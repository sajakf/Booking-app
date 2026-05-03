import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const sessions = await db.session.findMany({
    orderBy: [{ day: "asc" }, { startTime: "asc" }],
    include: { classroom: true, instructor: true },
  })
  return NextResponse.json(sessions)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const newSession = await db.session.create({
    data: {
      classroomId: body.classroomId,
      instructorId: body.instructorId,
      day: body.day,
      startTime: body.startTime,
      endTime: body.endTime,
      seatsTotal: Number(body.seatsTotal),
      notes: body.notes ?? null,
    },
    include: { classroom: true, instructor: true },
  })
  return NextResponse.json(newSession, { status: 201 })
}
