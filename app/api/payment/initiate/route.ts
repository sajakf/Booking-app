import { NextRequest, NextResponse } from "next/server"
import { myfatoorah } from "@/lib/myfatoorah/client"
import { db } from "@/lib/db"
import type { MyFatoorahInitiateRequest, MyFatoorahInitiateResponse } from "@/types/payment"
import { v4 as uuidv4 } from "uuid"

const PAYMENT_METHOD_IDS: Record<string, number> = {
  KNET: 1,
  VISA: 2,
  MASTERCARD: 2,
  APPLEPAY: 3,
  TABBY: 20,
  TAMARA: 30,
}

export async function POST(req: NextRequest) {
  const { bookingDraft, paymentMethod, locale } = await req.json()

  // Store draft keyed by a UUID so the callback can reconstruct the booking
  const draftId = uuidv4()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await db.bookingDraft.create({
    data: {
      id: draftId,
      data: JSON.stringify({ ...bookingDraft, locale, expiresAt: expiresAt.toISOString() }),
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const callbackUrl = `${baseUrl}/api/payment/callback?draftId=${draftId}&lang=${locale}`
  const errorUrl = `${baseUrl}/${locale}/book/payment?error=failed`

  const items = bookingDraft.lineItems?.map((item: { classroomName: string; unitPrice: number }) => ({
    ItemName: item.classroomName,
    Quantity: 1,
    UnitPrice: item.unitPrice,
  })) ?? [{ ItemName: "Camp Booking", Quantity: 1, UnitPrice: bookingDraft.total }]

  const request: MyFatoorahInitiateRequest = {
    InvoiceValue: bookingDraft.total,
    NotificationOption: "LNK",
    DisplayCurrencyIso: "KWD",
    CustomerName: bookingDraft.parent?.name ?? "Customer",
    CustomerEmail: bookingDraft.parent?.email ?? "",
    CustomerMobile: bookingDraft.parent?.mobile?.replace("+965", "") ?? "",
    CallBackUrl: callbackUrl,
    ErrorUrl: errorUrl,
    Language: locale === "ar" ? "AR" : "EN",
    UserDefinedField: draftId,
    InvoiceItems: items,
    ...(paymentMethod && PAYMENT_METHOD_IDS[paymentMethod]
      ? { PaymentMethodId: PAYMENT_METHOD_IDS[paymentMethod] }
      : {}),
  }

  // In test mode without a real API key, return a mock response
  if (!process.env.MYFATOORAH_API_KEY || process.env.MYFATOORAH_API_KEY === "test") {
    const mockRef = `MOCK-${draftId.slice(0, 8).toUpperCase()}`
    return NextResponse.json({
      invoiceId: "MOCK-123",
      invoiceUrl: `${baseUrl}/api/payment/callback?draftId=${draftId}&lang=${locale}&mock=1&paymentId=MOCK-PAY`,
      mockRef,
      expiresAt: expiresAt.toISOString(),
    })
  }

  try {
    const response = await myfatoorah.sendPayment<MyFatoorahInitiateResponse>(request)
    return NextResponse.json({
      invoiceId: String(response.Data.InvoiceId),
      invoiceUrl: response.Data.InvoiceURL,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (err) {
    console.error("MyFatoorah error:", err)
    return NextResponse.json({ error: "Payment initiation failed" }, { status: 500 })
  }
}
