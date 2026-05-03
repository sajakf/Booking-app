import { NextRequest, NextResponse } from "next/server"
import { bookingStore } from "@/lib/booking-store"
import { db } from "@/lib/db"
import type { Booking } from "@/types/booking"

export async function GET(_req: NextRequest, { params }: { params: Promise<{ ref: string }> }) {
  const { ref } = await params

  // Fast path: in-memory cache (populated by callback handler on same server instance)
  const cached = bookingStore.get(ref)
  if (cached) return NextResponse.json({ booking: cached })

  // Fallback: read from database (handles server restarts / serverless cold starts)
  const row = await db.booking.findUnique({ where: { bookingRef: ref } })
  if (!row) {
    return NextResponse.json({ error: "Booking not found" }, { status: 404 })
  }

  const booking: Booking = {
    ref: row.bookingRef,
    status: row.status.toLowerCase() as Booking["status"],
    locale: "en",
    child: {
      name: row.childName,
      age: row.childAge,
      gender: row.childGender as "male" | "female",
    },
    parent: {
      name: row.parentName,
      mobile: row.parentPhone,
      email: row.parentEmail,
    },
    medicalNotes: row.medicalNotes ?? "",
    lineItems: JSON.parse(row.lineItemsJson) as Booking["lineItems"],
    isFullWeek: false,
    subtotal: row.subtotalKwd,
    weekDiscount: row.discountKwd,
    promoCode: row.promoCode ?? null,
    promoDiscount: 0,
    siblingDiscount: 0,
    total: row.totalKwd,
    currency: "KWD",
    paymentMethod: (row.paymentMethod as Booking["paymentMethod"]) ?? null,
    myFatoorahInvoiceId: row.invoiceId ?? null,
    myFatoorahPaymentId: row.paymentId ?? null,
    createdAt: row.createdAt.toISOString(),
    confirmedAt: row.paidAt?.toISOString() ?? null,
  }

  return NextResponse.json({ booking })
}
