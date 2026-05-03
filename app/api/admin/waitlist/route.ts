import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const entries = await db.waitlist.findMany({
    where: { status: { in: ["WAITING", "OFFERED"] } },
    orderBy: { createdAt: "asc" },
    include: { classroom: true, session: { include: { instructor: true } } },
  })
  return NextResponse.json(entries)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const entry = await db.waitlist.create({
    data: {
      classroomId: body.classroomId,
      sessionId: body.sessionId ?? null,
      parentName: body.parentName,
      parentEmail: body.parentEmail,
      parentPhone: body.parentPhone,
      childName: body.childName,
      childAge: Number(body.childAge),
      childGender: body.childGender,
      notes: body.notes ?? null,
    },
  })
  return NextResponse.json(entry, { status: 201 })
}
