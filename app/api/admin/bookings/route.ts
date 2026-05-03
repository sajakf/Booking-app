import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const status = searchParams.get("status")
  const search = searchParams.get("search") ?? ""
  const page = Math.max(1, Number(searchParams.get("page") ?? "1"))
  const limit = Math.min(100, Number(searchParams.get("limit") ?? "20"))
  const skip = (page - 1) * limit

  const where: Record<string, unknown> = {}
  if (status && status !== "ALL") where.status = status
  if (search) {
    where.OR = [
      { bookingRef: { contains: search } },
      { parentName: { contains: search } },
      { parentEmail: { contains: search } },
      { parentPhone: { contains: search } },
      { childName: { contains: search } },
    ]
  }

  const [bookings, total] = await Promise.all([
    db.booking.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip,
      take: limit,
    }),
    db.booking.count({ where }),
  ])

  return NextResponse.json({ bookings, total, page, limit, pages: Math.ceil(total / limit) })
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const { generateBookingRef } = await import("@/lib/booking-ref")

  const booking = await db.booking.create({
    data: {
      bookingRef: generateBookingRef(),
      childName: body.childName,
      childAge: Number(body.childAge),
      childGender: body.childGender,
      parentName: body.parentName,
      parentEmail: body.parentEmail,
      parentPhone: body.parentPhone,
      medicalNotes: body.medicalNotes || null,
      lineItemsJson: body.lineItemsJson ?? "[]",
      subtotalKwd: Number(body.subtotalKwd ?? body.totalKwd),
      discountKwd: Number(body.discountKwd ?? 0),
      totalKwd: Number(body.totalKwd),
      status: body.status ?? "PAID",
      paymentStatus: body.paymentStatus ?? "SUCCESS",
      paymentMethod: body.paymentMethod ?? "CASH",
      isCashPayment: body.isCashPayment ?? true,
      paidAt: new Date(),
      notes: body.notes || null,
    },
  })
  return NextResponse.json(booking, { status: 201 })
}
