import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { myfatoorah } from "@/lib/myfatoorah/client"

export async function POST(
  req: NextRequest,
  { params }: { params: Promise<{ id: string }> },
) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const { invoiceId, amount, comment } = body as {
    invoiceId: string
    amount: number
    comment?: string
  }

  if (!invoiceId || typeof amount !== "number" || amount <= 0) {
    return NextResponse.json(
      { error: "invoiceId and a positive amount are required" },
      { status: 400 },
    )
  }

  if (process.env.MYFATOORAH_API_KEY && process.env.MYFATOORAH_API_KEY !== "test") {
    try {
      await myfatoorah.makeRefund({
        InvoiceId: invoiceId,
        RefundChargeOnCustomer: false,
        ServiceCharge: 0,
        Amount: amount,
        Comment: comment ?? "Admin-issued refund",
      })
    } catch (err) {
      console.error("[refund] MyFatoorah makeRefund failed:", err)
      return NextResponse.json({ error: "Refund gateway error" }, { status: 502 })
    }
  }

  const booking = await db.booking.update({
    where: { id },
    data: { status: "REFUNDED", paymentStatus: "FAILED" },
  })

  return NextResponse.json({ success: true, booking })
}
