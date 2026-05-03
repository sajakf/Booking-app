import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function PATCH(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  const body = await req.json()
  const instructor = await db.instructor.update({
    where: { id },
    data: {
      ...(body.nameEn !== undefined && { nameEn: body.nameEn }),
      ...(body.nameAr !== undefined && { nameAr: body.nameAr }),
      ...(body.phone !== undefined && { phone: body.phone }),
      ...(body.email !== undefined && { email: body.email }),
      ...(body.bio !== undefined && { bio: body.bio }),
      ...(body.photo !== undefined && { photo: body.photo }),
      ...(body.certifications !== undefined && { certifications: body.certifications }),
      ...(body.isActive !== undefined && { isActive: body.isActive }),
    },
  })
  return NextResponse.json(instructor)
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const { id } = await params
  await db.instructor.update({ where: { id }, data: { isActive: false } })
  return NextResponse.json({ ok: true })
}
