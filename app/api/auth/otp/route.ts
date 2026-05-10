import { NextRequest, NextResponse } from "next/server"
import { SignJWT } from "jose"

const JWT_SECRET = new TextEncoder().encode(
  process.env.NEXTAUTH_SECRET ?? "fallback-secret-change-in-production"
)
const COOKIE_NAME = "parent_session"
const MAX_AGE_SEC = 60 * 60 * 24 * 30 // 30 days

const SUPABASE_URL      = process.env.NEXT_PUBLIC_SUPABASE_URL ?? ""
const SUPABASE_ANON_KEY = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY ?? ""

async function makeToken(parentId: string, phone: string): Promise<string> {
  return new SignJWT({ sub: parentId, phone })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(JWT_SECRET)
}

async function callEdgeFn(slug: string, body: unknown) {
  const res = await fetch(`${SUPABASE_URL}/functions/v1/${slug}`, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "apikey": SUPABASE_ANON_KEY,
      "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
    },
    body: JSON.stringify(body),
  })
  const data = await res.json()
  return { ok: res.ok, status: res.status, data }
}

export async function POST(req: NextRequest) {
  const body = await req.json().catch(() => null)
  if (!body?.action) {
    return NextResponse.json({ error: "Missing action" }, { status: 400 })
  }

  // ── SEND OTP ──────────────────────────────────────────────────────────────
  if (body.action === "send") {
    const { ok, status, data } = await callEdgeFn("send-otp", { phone: body.phone })
    if (!ok) return NextResponse.json({ error: data.error ?? "Failed to send OTP" }, { status })
    return NextResponse.json({ sent: true })
  }

  // ── VERIFY OTP ────────────────────────────────────────────────────────────
  if (body.action === "verify") {
    const { ok, status, data } = await callEdgeFn("verify-otp", {
      phone: body.phone,
      code:  body.code,
      name:  body.name ?? "",
    })

    if (!ok) return NextResponse.json({ error: data.error ?? "Verification failed" }, { status })

    const parent = data.parent as { id: string; name: string; phone: string; email?: string }

    // Issue a signed JWT session cookie (httpOnly — must be set server-side)
    const token = await makeToken(parent.id, parent.phone)
    const res = NextResponse.json({
      id:    parent.id,
      name:  parent.name,
      phone: parent.phone,
      email: parent.email ?? null,
    })
    res.cookies.set(COOKIE_NAME, token, {
      httpOnly: true,
      secure:   process.env.NODE_ENV === "production",
      sameSite: "lax",
      maxAge:   MAX_AGE_SEC,
      path:     "/",
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
