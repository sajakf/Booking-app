import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const action = body.action as "offer" | "cancel" | "book"

  const updates: Record<string, unknown> = {}
  if (action === "offer") {
    updates.status = "OFFERED"
    updates.offeredAt = new Date()
    updates.expiresAt = new Date(Date.now() + 48 * 60 * 60 * 1000) // 48h
  } else if (action === "cancel") {
    updates.status = "CANCELLED"
  } else if (action === "book") {
    updates.status = "BOOKED"
  }

  const entry = await db.waitlist.update({ where: { id }, data: updates, include: { classroom: true } })

  // If offering: send WhatsApp notification
  if (action === "offer") {
    const { sendAbsenceAlert } = await import("@/lib/notifications/whatsapp")
    const msg = `Dear ${entry.parentName}, a spot has opened up in ${entry.classroom.nameEn} at Little Stars Camp! Reply to confirm within 48 hours or the spot will be offered to the next family.`
    console.log("[Waitlist Offer] Would send to", entry.parentPhone, ":", msg)
    // In production: replace with a proper sendSlotOffer() function
    await sendAbsenceAlert(entry.parentPhone, entry.childName, "N/A").catch(() => null)
  }

  return NextResponse.json(entry)
}
