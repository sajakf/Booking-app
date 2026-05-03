import { NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { db } from "@/lib/db"

export async function GET() {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const instructors = await db.instructor.findMany({ orderBy: { createdAt: "asc" } })
  return NextResponse.json(instructors)
}

export async function POST(req: NextRequest) {
  const session = await getServerSession(authOptions)
  if (!session) return NextResponse.json({ error: "Unauthorized" }, { status: 401 })

  const body = await req.json()
  const instructor = await db.instructor.create({
    data: {
      nameEn: body.nameEn,
      nameAr: body.nameAr,
      phone: body.phone || null,
      email: body.email || null,
      bio: body.bio || null,
      photo: body.photo || null,
      certifications: body.certifications ?? "",
    },
  })
  return NextResponse.json(instructor, { status: 201 })
}
