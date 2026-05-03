import { NextRequest, NextResponse } from "next/server"
import { bookingStore } from "@/lib/booking-store"
import { generateBookingRef } from "@/lib/booking-ref"
import { sendWhatsAppConfirmation } from "@/lib/notifications/whatsapp"
import { sendConfirmationEmail } from "@/lib/notifications/email"
import { db } from "@/lib/db"
import type { Booking } from "@/types/booking"
import type { Locale } from "@/types/i18n"

export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const draftId = searchParams.get("draftId")
  const lang = searchParams.get("lang") ?? "en"
  const isMock = searchParams.get("mock") === "1"
  const paymentId = searchParams.get("paymentId") ?? ""

  if (!draftId) {
    return NextResponse.redirect(new URL(`/${lang}/book/payment?error=missing_draft`, req.url))
  }

  const draftRecord = await db.bookingDraft.findUnique({ where: { id: draftId } })
  if (!draftRecord) {
    return NextResponse.redirect(new URL(`/${lang}/book/payment?error=draft_expired`, req.url))
  }

  // Seat hold expiry check
  if (draftRecord.expiresAt < new Date()) {
    await db.bookingDraft.delete({ where: { id: draftId } }).catch(() => null)
    return NextResponse.redirect(new URL(`/${lang}/book/payment?error=seat_expired`, req.url))
  }

  const draft = JSON.parse(draftRecord.data) as Record<string, unknown>

  // In mock/test mode, skip real payment verification
  if (!isMock && process.env.MYFATOORAH_API_KEY && process.env.MYFATOORAH_API_KEY !== "test") {
    try {
      const { myfatoorah } = await import("@/lib/myfatoorah/client")
      const status = await myfatoorah.getPaymentStatus<{ IsSuccess: boolean; Data: { InvoiceStatus: string } }>({
        Key: paymentId,
        KeyType: "PaymentId",
      })
      if (!status.IsSuccess || status.Data.InvoiceStatus !== "Paid") {
        return NextResponse.redirect(new URL(`/${lang}/book/payment?error=payment_failed`, req.url))
      }
    } catch {
      return NextResponse.redirect(new URL(`/${lang}/book/payment?error=verification_failed`, req.url))
    }
  }

  const bookingDraft = draft
  const ref = generateBookingRef()
  const now = new Date()

  const child = bookingDraft.child as Record<string, unknown> | undefined
  const parent = bookingDraft.parent as Record<string, unknown> | undefined
  const lineItems = bookingDraft.lineItems as unknown[] | undefined

  // Persist to database (source of truth)
  let dbBooking: Awaited<ReturnType<typeof db.booking.create>> | null = null
  try {
    dbBooking = await db.booking.create({
      data: {
        bookingRef: ref,
        status: "PAID",
        lineItemsJson: JSON.stringify(lineItems ?? []),
        childName: String(child?.name ?? ""),
        childAge: Number(child?.age ?? 0),
        childGender: String(child?.gender ?? ""),
        parentName: String(parent?.name ?? ""),
        parentEmail: String(parent?.email ?? ""),
        parentPhone: String(parent?.mobile ?? ""),
        hasSibling: Boolean(bookingDraft.hasSibling),
        promoCode: (bookingDraft.promo as Record<string, unknown> | undefined)?.code as string | undefined ?? null,
        medicalNotes: String(bookingDraft.medicalNotes ?? ""),
        subtotalKwd: Number(bookingDraft.subtotal ?? 0),
        discountKwd:
          Number(bookingDraft.weekDiscount ?? 0) +
          Number(bookingDraft.promoDiscount ?? 0) +
          Number(bookingDraft.siblingDiscount ?? 0),
        totalKwd: Number(bookingDraft.total ?? 0),
        paymentStatus: "SUCCESS",
        paymentMethod: String(bookingDraft.paymentMethod ?? ""),
        paymentId: paymentId || null,
        paidAt: now,
      },
    })
  } catch (err) {
    console.error("Failed to persist booking to DB:", err)
  }

  // Remove the draft now that booking is confirmed
  await db.bookingDraft.delete({ where: { id: draftId } }).catch(() => null)

  const booking: Booking = {
    ref,
    status: "paid",
    locale: (bookingDraft.locale as Locale) ?? "en",
    child: {
      name: String(child?.name ?? ""),
      age: Number(child?.age ?? 0),
      gender: (child?.gender as "male" | "female") ?? "male",
    },
    parent: {
      name: String(parent?.name ?? ""),
      mobile: String(parent?.mobile ?? ""),
      email: String(parent?.email ?? ""),
    },
    medicalNotes: String(bookingDraft.medicalNotes ?? ""),
    lineItems: (lineItems ?? []) as Booking["lineItems"],
    isFullWeek: Boolean(bookingDraft.isFullWeek),
    subtotal: Number(bookingDraft.subtotal ?? 0),
    weekDiscount: Number(bookingDraft.weekDiscount ?? 0),
    promoCode: (bookingDraft.promo as Record<string, unknown> | undefined)?.code as string | null ?? null,
    promoDiscount: Number(bookingDraft.promoDiscount ?? 0),
    siblingDiscount: Number(bookingDraft.siblingDiscount ?? 0),
    total: Number(bookingDraft.total ?? 0),
    currency: "KWD",
    paymentMethod: (bookingDraft.paymentMethod as Booking["paymentMethod"]) ?? null,
    myFatoorahInvoiceId: dbBooking?.invoiceId ?? null,
    myFatoorahPaymentId: paymentId || null,
    createdAt: (bookingDraft.createdAt as string) ?? now.toISOString(),
    confirmedAt: now.toISOString(),
  }

  // Cache in memory for instant confirmation page load
  bookingStore.save(booking)

  // Fire notifications (best effort)
  try {
    await Promise.all([sendWhatsAppConfirmation(booking), sendConfirmationEmail(booking)])
  } catch (err) {
    console.error("Notification error:", err)
  }

  return NextResponse.redirect(new URL(`/${lang}/book/confirmation?ref=${ref}`, req.url))
}

export async function POST(req: NextRequest) {
  const webhookSecret = process.env.MYFATOORAH_WEBHOOK_SECRET

  if (webhookSecret) {
    const signature =
      req.headers.get("x-myfatoorah-signature") ?? req.headers.get("myfatoorah-signature")

    if (signature) {
      const body = await req.text()
      const { createHmac } = await import("crypto")
      const expected = createHmac("sha256", webhookSecret).update(body).digest("hex")
      if (signature !== expected) {
        console.warn("[webhook] HMAC mismatch — rejecting POST callback")
        return NextResponse.json({ error: "Invalid signature" }, { status: 401 })
      }
      // Reconstruct request with params extracted from webhook body
      const parsed = JSON.parse(body) as Record<string, unknown>
      const data = (parsed?.Data ?? {}) as Record<string, unknown>
      const url = new URL(req.url)
      url.searchParams.set("paymentId", String(data.PaymentId ?? parsed.paymentId ?? ""))
      url.searchParams.set("draftId", String(data.UserDefinedField ?? url.searchParams.get("draftId") ?? ""))
      return GET(new NextRequest(url, { headers: req.headers }))
    } else {
      console.warn("[webhook] No HMAC signature header present — proceeding without verification")
    }
  } else {
    console.warn("[webhook] MYFATOORAH_WEBHOOK_SECRET not configured — skipping HMAC check")
  }

  return GET(req)
}
