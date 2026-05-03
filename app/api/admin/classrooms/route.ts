import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const classrooms = await db.classroom.findMany({
    orderBy: { createdAt: "asc" },
    include: { sessions: { include: { instructor: true } } },
  })
  return NextResponse.json(classrooms)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const classroom = await db.classroom.create({
    data: {
      nameEn: body.nameEn,
      nameAr: body.nameAr,
      gender: body.gender,
      capacity: Number(body.capacity),
      ageRangeMin: Number(body.ageRangeMin ?? 5),
      ageRangeMax: Number(body.ageRangeMax ?? 18),
      pricePerDay: Number(body.pricePerDay),
      weekDiscount: Number(body.weekDiscount ?? 0),
      activityType: body.activityType ?? null,
    },
  })
  return NextResponse.json(classroom, { status: 201 })
}
