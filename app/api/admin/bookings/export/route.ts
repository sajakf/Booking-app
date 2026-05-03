import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import * as XLSX from "xlsx"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search") ?? ""

  const where: Record<string, unknown> = {}
  if (status && status !== "ALL") where.status = status
  if (search) {
    where.OR = [
      { bookingRef: { contains: search } },
      { parentName: { contains: search } },
      { parentEmail: { contains: search } },
      { childName: { contains: search } },
    ]
  }

  const bookings = await db.booking.findMany({
    where,
    orderBy: { createdAt: "desc" },
  })

  const rows = bookings.map((b) => ({
    "Booking Ref": b.bookingRef,
    "Child Name": b.childName,
    "Child Age": b.childAge,
    "Child Gender": b.childGender,
    "Parent Name": b.parentName,
    "Parent Email": b.parentEmail,
    "Parent Phone": b.parentPhone,
    "Status": b.status,
    "Payment Status": b.paymentStatus,
    "Payment Method": b.paymentMethod ?? "",
    "Cash Payment": b.isCashPayment ? "Yes" : "No",
    "Subtotal KWD": Number(b.subtotalKwd).toFixed(3),
    "Discount KWD": Number(b.discountKwd).toFixed(3),
    "Total KWD": Number(b.totalKwd).toFixed(3),
    "Promo Code": b.promoCode ?? "",
    "Sibling Discount": b.hasSibling ? "Yes" : "No",
    "Medical Notes": b.medicalNotes ?? "",
    "Paid At": b.paidAt ? new Date(b.paidAt).toLocaleString("en-KW") : "",
    "Created At": new Date(b.createdAt).toLocaleString("en-KW"),
    "Admin Notes": b.notes ?? "",
  }))

  const ws = XLSX.utils.json_to_sheet(rows)
  const wb = XLSX.utils.book_new()
  XLSX.utils.book_append_sheet(wb, ws, "Bookings")

  const buf = XLSX.write(wb, { type: "buffer", bookType: "xlsx" })

  return new NextResponse(buf, {
    headers: {
      "Content-Type": "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
      "Content-Disposition": `attachment; filename="bookings-${Date.now()}.xlsx"`,
    },
  })
}
