import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const classroom = await db.classroom.update({
    where: { id },
    data: {
      ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
      ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
      ...(body.gender !== undefined && { gender: body.gender }),
      ...(body.capacity !== undefined && { capacity: Number(body.capacity) }),
      ...(body.ageRangeMin !== undefined && { ageRangeMin: Number(body.ageRangeMin) }),
      ...(body.ageRangeMax !== undefined && { ageRangeMax: Number(body.ageRangeMax) }),
      ...(body.pricePerDay !== undefined && { pricePerDay: Number(body.pricePerDay) }),
      ...(body.weekDiscount !== undefined && { weekDiscount: Number(body.weekDiscount) }),
      ...(body.activityType !== undefined && { activityType: body.activityType }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })
  return NextResponse.json(classroom)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await db.classroom.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
