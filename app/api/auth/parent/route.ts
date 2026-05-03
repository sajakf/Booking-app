import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import bcrypt from "bcryptjs"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-in-production"
)
const COOKIE_NAME = "parent_session"
const MAX_AGE_SEC = 60 * 60 * 24 * 30 // 30 days

async function makeToken(parentId: string, email: string): Promise<string> {
  return new SignJWT({ sub: parentId, email })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET)
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 })
  }

  // ── SIGNUP ────────────────────────────────────────────────────────────────
  if (body.action === "signup") {
    const { name, email, phone, password } = body

    if (!name || !email || !password) {
      return NextResponse.json({ error: "Name, email, and password are required" }, { status: 400 })
    }
    if (password.length < 8) {
      return NextResponse.json({ error: "Password must be at least 8 characters" }, { status: 400 })
    }

    const existing = await db.parentAccount.findUnique({ where: { email } })
    if (existing) {
      return NextResponse.json({ error: "This email is already registered" }, { status: 409 })
    }

    const passwordHash = await bcrypt.hash(password, 12)
    const parent = await db.parentAccount.create({
      data: { name, email, phone: phone || null, passwordHash },
    })

    const token = await makeToken(parent.id, parent.email ?? "")
    const res = NextResponse.json({ id: parent.id, name: parent.name, email: parent.email })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE_SEC,
      path: "/",
    })
    return res
  }

  // ── LOGIN ─────────────────────────────────────────────────────────────────
  if (body.action === "login") {
    const { email, password, remember } = body

    if (!email || !password) {
      return NextResponse.json({ error: "Email and password are required" }, { status: 400 })
    }

    const parent = await db.parentAccount.findUnique({ where: { email } })
    if (!parent || !parent.passwordHash) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const valid = await bcrypt.compare(password, parent.passwordHash)
    if (!valid) {
      return NextResponse.json({ error: "Invalid email or password" }, { status: 401 })
    }

    const token = await makeToken(parent.id, parent.email ?? "")
    const maxAge = remember ? MAX_AGE_SEC : 60 * 60 * 24
    const res = NextResponse.json({ id: parent.id, name: parent.name, email: parent.email })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge,
      path: "/",
    })
    return res
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  if (body.action === "logout") {
    const res = NextResponse.json({ ok: true })
    res.cookies.delete(COOKIE_NAME)
    return res
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
