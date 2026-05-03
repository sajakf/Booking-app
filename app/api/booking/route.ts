import { NextRequest, NextResponse } from "next/server"
import { generateBookingRef } from "@/lib/booking-ref"
import { bookingStore } from "@/lib/booking-store"
import type { Booking } from "@/types/booking"

export async function POST(req: NextRequest) {
  const body = await req.json()

  const booking: Booking = {
    ...body,
    ref: generateBookingRef(),
    status: "paid",
    confirmedAt: new Date().toISOString(),
    createdAt: body.createdAt ?? new Date().toISOString(),
  }

  bookingStore.save(booking)

  return NextResponse.json({ ref: booking.ref, booking })
}
