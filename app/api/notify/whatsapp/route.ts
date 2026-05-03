import { NextRequest, NextResponse } from "next/server"
import { sendWhatsAppConfirmation } from "@/lib/notifications/whatsapp"
import type { Booking } from "@/types/booking"

export async function POST(req: NextRequest) {
  const { booking } = await req.json() as { booking: Booking }
  const result = await sendWhatsAppConfirmation(booking)
  return NextResponse.json(result)
}
