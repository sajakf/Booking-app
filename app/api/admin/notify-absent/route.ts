import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"
import { sendAbsenceAlert } from "@/lib/notifications/whatsapp"

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { bookingId, date } = await req.json()
  const booking = await db.booking.findUnique({ where: { id: bookingId } })
  if (!booking) return NextResponse.json({ error: "Not found" }, { status: 404 })

  await sendAbsenceAlert(booking.parentPhone, booking.childName, date)
  return NextResponse.json({ ok: true })
}
