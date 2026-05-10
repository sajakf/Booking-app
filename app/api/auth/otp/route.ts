import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-in-production"
)
const COOKIE_NAME = "parent_session"
const MAX_AGE_SEC = 60 * 60 * 24 * 30  // 30 days
const OTP_TTL_MS  = 10 * 60 * 1000      // 10 minutes

const TWILIO_ACCOUNT_SID  = process.env.TWILIO_ACCOUNT_SID  ?? ""
const TWILIO_AUTH_TOKEN   = process.env.TWILIO_AUTH_TOKEN   ?? ""
const TWILIO_PHONE_NUMBER = process.env.TWILIO_PHONE_NUMBER ?? ""

const KUWAIT_MOBILE_RE = /^[569]\d{7}$/

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  const local = digits.startsWith("965") && digits.length === 11 ? digits.slice(3) : digits
  if (!KUWAIT_MOBILE_RE.test(local)) return null
  return `+965${local}`
}

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

async function sendTwilioSMS(to: string, body: string): Promise<{ ok: boolean; error?: string }> {
  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    console.warn("[OTP] Twilio not configured — logging code to console only")
    return { ok: true } // allow dev flow to continue
  }

  const credentials = Buffer.from(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`).toString("base64")

  const res = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: "POST",
      headers: {
        Authorization: `Basic ${credentials}`,
        "Content-Type": "application/x-www-form-urlencoded",
      },
      body: new URLSearchParams({ To: to, From: TWILIO_PHONE_NUMBER, Body: body }),
    }
  )

  if (!res.ok) {
    const text = await res.text()
    console.error("[Twilio]", res.status, text)
    return { ok: false, error: "Failed to send SMS. Please try again." }
  }

  return { ok: true }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 })
  }

  // ── SEND OTP ──────────────────────────────────────────────────────────────
  if (body.action === "send") {
    const phone = normalisePhone(String(body.phone ?? ""))
    if (!phone) {
      return NextResponse.json(
        { error: "Please enter a valid Kuwait mobile number (starts with 5, 6, or 9)" },
        { status: 400 }
      )
    }

    // Rate limit: max 5 per hour
    const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
    const recentCount = await db.phoneOTP.count({
      where: { phone, createdAt: { gte: oneHourAgo } },
    })
    if (recentCount >= 5) {
      return NextResponse.json(
        { error: "Too many OTP requests. Please wait an hour before trying again." },
        { status: 429 }
      )
    }

    const code = randomCode()
    const expiresAt = new Date(Date.now() + OTP_TTL_MS)

    await db.phoneOTP.deleteMany({ where: { phone } })
    await db.phoneOTP.create({ data: { phone, code, expiresAt } })

    const message = `Your Science Camp verification code is: ${code}. Valid for 10 minutes. Do not share this code.`
    console.log(`[OTP] ${phone} → ${code}`)

    const sms = await sendTwilioSMS(phone, message)
    if (!sms.ok) {
      return NextResponse.json({ error: sms.error }, { status: 502 })
    }

    return NextResponse.json({ sent: true })
  }

  // ── VERIFY OTP ────────────────────────────────────────────────────────────
  if (body.action === "verify") {
    const phone = normalisePhone(String(body.phone ?? ""))
    const code  = String(body.code ?? "").trim()

    if (!phone || !code) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 })
    }

    const record = await db.phoneOTP.findFirst({
      where: { phone },
      orderBy: { createdAt: "desc" },
    })

    if (!record) {
      return NextResponse.json({ error: "No OTP found. Please request a new code." }, { status: 400 })
    }
    if (new Date(record.expiresAt) < new Date()) {
      await db.phoneOTP.delete({ where: { id: record.id } })
      return NextResponse.json({ error: "Code expired. Please request a new one." }, { status: 400 })
    }
    if ((record.attempts ?? 0) >= 5) {
      await db.phoneOTP.delete({ where: { id: record.id } })
      return NextResponse.json({ error: "Too many incorrect attempts. Please request a new code." }, { status: 400 })
    }
    if (record.code !== code) {
      await db.phoneOTP.update({ where: { id: record.id }, data: { attempts: { increment: 1 } } })
      const remaining = 4 - (record.attempts ?? 0)
      return NextResponse.json(
        { error: `Incorrect code. ${remaining} attempt${remaining === 1 ? "" : "s"} remaining.` },
        { status: 400 }
      )
    }

    // ✅ Correct — clean up and upsert account
    await db.phoneOTP.delete({ where: { id: record.id } })

    const parent = await db.parentAccount.upsert({
      where: { phone },
      update: {
        ...(body.name ? { name: String(body.name) } : {}),
        isVerified: true,
        updatedAt: new Date(),
      },
      create: { phone, name: String(body.name ?? ""), isVerified: true },
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
