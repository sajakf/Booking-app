import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { searchParams } = req.nextUrl
  const date = searchParams.get("date")
  const classroomId = searchParams.get("classroomId")

  if (!date) return NextResponse.json({ error: "date required" }, { status: 400 })

  const dayStart = new Date(date)
  dayStart.setHours(0, 0, 0, 0)
  const dayEnd = new Date(date)
  dayEnd.setHours(23, 59, 59, 999)

  const where: Record<string, unknown> = {
    date: { gte: dayStart, lte: dayEnd },
  }
  if (classroomId) where.classroomId = classroomId

  const records = await db.attendance.findMany({
    where,
    include: { booking: true, classroom: true },
  })
  return NextResponse.json(records)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const date = new Date(body.date)
  date.setHours(12, 0, 0, 0)

  const record = await db.attendance.upsert({
    where: { bookingId_date: { bookingId: body.bookingId, date } },
    create: {
      bookingId: body.bookingId,
      classroomId: body.classroomId,
      date,
      status: body.status,
      markedAt: new Date(),
      markedBy: session.user?.email ?? null,
      notes: body.notes ?? null,
    },
    update: {
      status: body.status,
      markedAt: new Date(),
      notes: body.notes ?? null,
    },
    include: { booking: true },
  })

  return NextResponse.json(record)
}
