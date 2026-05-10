import { NextRequest, NextResponse } from "next/server"
import { myfatoorah } from "@/lib/myfatoorah/client"
import { db } from "@/lib/db"

interface MFPaymentStatus {
  IsSuccess: boolean
  Data: {
    InvoiceId: number
    InvoiceStatus: "Paid" | "Pending" | "Failed" | "Expired"
    InvoiceValue: number
    InvoiceTransactions: Array<{
      TransactionStatus: string
      PaymentGateway: string
      PaymentId: string
      Error: string | null
      ErrorCode: string | null
    }>
    UserDefinedField: string
  }
}

/**
 * GET /api/payment/verify?paymentId=xxx&draftId=yyy&lang=en
 *
 * Called from the error page when MyFatoorah redirects to ErrorUrl but a
 * paymentId is present (payment may have been captured despite the error redirect).
 *
 * - If InvoiceStatus === "Paid" → forward to the normal callback to complete booking
 * - Otherwise → return the real failure reason as JSON for the UI to display
 */
export async function GET(req: NextRequest) {
  const { searchParams } = req.nextUrl
  const paymentId = searchParams.get("paymentId")
  const draftId = searchParams.get("draftId")
  const lang = searchParams.get("lang") ?? "en"

  if (!paymentId) {
    return NextResponse.json({ error: "Missing paymentId" }, { status: 400 })
  }

  // Sandbox/mock mode — nothing to verify
  if (!process.env.MYFATOORAH_API_KEY || process.env.MYFATOORAH_API_KEY === "test") {
    return NextResponse.json({ status: "Failed", reason: "Mock mode — no real payment" })
  }

  try {
    const result = await myfatoorah.getPaymentStatus<MFPaymentStatus>({
      Key: paymentId,
      KeyType: "PaymentId",
    })

    if (!result.IsSuccess) {
      return NextResponse.json({ status: "Failed", reason: "Could not retrieve payment status" })
    }

    const invoice = result.Data
    const tx = invoice.InvoiceTransactions?.[0]

    if (invoice.InvoiceStatus === "Paid") {
      // Payment was actually captured — forward to callback to complete the booking.
      // Prefer the UserDefinedField (draftId embedded in invoice) over the URL param.
      const resolvedDraftId = invoice.UserDefinedField || draftId
      if (!resolvedDraftId) {
        return NextResponse.json({ status: "Paid", reason: "Payment captured but booking draft not found. Contact support.", recovered: false })
      }

      const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
      const callbackUrl = new URL(`${baseUrl}/api/payment/callback`)
      callbackUrl.searchParams.set("draftId", resolvedDraftId)
      callbackUrl.searchParams.set("lang", lang)
      callbackUrl.searchParams.set("paymentId", paymentId)

      return NextResponse.redirect(callbackUrl.toString())
    }

    // Still pending — draft might still be alive; check expiry
    if (invoice.InvoiceStatus === "Pending" && draftId) {
      const draft = await db.bookingDraft.findUnique({ where: { id: draftId } })
      if (draft && draft.expiresAt > new Date()) {
        return NextResponse.json({
          status: "Pending",
          reason: tx?.Error ?? "Payment is still pending. Try completing the payment again.",
          canRetry: true,
          draftId,
        })
      }
    }

    // Failed or expired
    const reason =
      tx?.Error === "Transaction not Captured!"
        ? "The payment was not completed. For KNET: enter card number → PIN → OTP to finish the transaction."
        : (tx?.Error ?? `Payment ${invoice.InvoiceStatus.toLowerCase()}.`)

    return NextResponse.json({
      status: invoice.InvoiceStatus,
      errorCode: tx?.ErrorCode ?? null,
      reason,
      gateway: tx?.PaymentGateway ?? null,
    })
  } catch (err) {
    console.error("[verify] Error checking payment status:", err)
    return NextResponse.json({ error: "Verification failed" }, { status: 500 })
  }
}
