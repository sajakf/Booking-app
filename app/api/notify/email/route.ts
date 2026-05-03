import { NextRequest, NextResponse } from "next/server"
import { sendConfirmationEmail } from "@/lib/notifications/email"
import type { Booking } from "@/types/booking"

export async function POST(req: NextRequest) {
  const { booking } = await req.json() as { booking: Booking }
  const result = await sendConfirmationEmail(booking)
  return NextResponse.json(result)
}
