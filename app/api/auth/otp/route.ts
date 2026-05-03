import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-in-production"
)
const COOKIE_NAME = "parent_session"
const MAX_AGE_SEC = 60 * 60 * 24 * 30 // 30 days
const OTP_TTL_MS = 5 * 60 * 1000 // 5 minutes

// Kuwait mobile: 8 digits starting with 5, 6, or 9
const KUWAIT_MOBILE_RE = /^[569]\d{7}$/

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

async function makeToken(parentId: string, phone: string): Promise<string> {
  return new SignJWT({ sub: parentId, phone })
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

  // ── SEND OTP ─────────────────────────────────────────────────────────────
  if (body.action === "send") {
    const raw: string = String(body.phone ?? "").replace(/\D/g, "")
    // Strip +965 prefix if present
    const digits = raw.startsWith("965") && raw.length === 11 ? raw.slice(3) : raw

    if (!KUWAIT_MOBILE_RE.test(digits)) {
      return NextResponse.json(
        { error: "Please enter a valid Kuwait mobile number (starts with 5, 6, or 9)" },
        { status: 400 }
      )
    }

    const phone = `+965${digits}`
    const code = randomCode()
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    // Delete any existing OTPs for this number, then insert fresh one
    await db.phoneOTP.deleteMany({ where: { phone } })
    await db.phoneOTP.create({ data: { phone, code, expiresAt } })

    // TODO: in production, send `code` via SMS (e.g. Twilio, Unifonic)
    // For now, return it in dev mode so registration can be tested
    const isDev = process.env.NODE_ENV !== "production"
    return NextResponse.json({ sent: true, ...(isDev && { devCode: code }) })
  }

  // ── VERIFY OTP ───────────────────────────────────────────────────────────
  if (body.action === "verify") {
    const { phone: rawPhone, code, name } = body
    if (!rawPhone || !code) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 })
    }

    const raw = String(rawPhone).replace(/\D/g, "")
    const digits = raw.startsWith("965") && raw.length === 11 ? raw.slice(3) : raw
    const phone = `+965${digits}`

    const record = await db.phoneOTP.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    })

    if (!record) {
      return NextResponse.json({ error: "No OTP found. Please request a new code." }, { status: 400 })
    }
    if (record.expiresAt < new Date()) {
      await db.phoneOTP.delete({ where: { id: record.id } })
      return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 })
    }
    if (record.code !== String(code).trim()) {
      return NextResponse.json({ error: "Incorrect code. Please try again." }, { status: 400 })
    }

    // OTP valid — delete it
    await db.phoneOTP.delete({ where: { id: record.id } })

    // Upsert parent account
    const parent = await db.parentAccount.upsert({
      where: { phone },
      update: name ? { name: String(name) } : {},
      create: { phone, name: String(name ?? ""), isVerified: true },
    })

    const token = await makeToken(parent.id, parent.phone)
    const res = NextResponse.json({ id: parent.id, name: parent.name, phone: parent.phone })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge: MAX_AGE_SEC,
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
