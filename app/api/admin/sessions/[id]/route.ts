import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const updated = await db.session.update({
    where: { id },
    data: {
      ...(body.classroomId !== undefined && { classroomId: body.classroomId }),
      ...(body.instructorId !== undefined && { instructorId: body.instructorId }),
      ...(body.day !== undefined && { day: body.day }),
      ...(body.startTime !== undefined && { startTime: body.startTime }),
      ...(body.endTime !== undefined && { endTime: body.endTime }),
      ...(body.seatsTotal !== undefined && { seatsTotal: Number(body.seatsTotal) }),
      ...(body.notes !== undefined && { notes: body.notes }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
    include: { classroom: true, instructor: true },
  })
  return NextResponse.json(updated)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await db.session.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
