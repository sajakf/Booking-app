import { NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/supabase/server"
import { createServerClient } from "@supabase/ssr"

// Kuwait mobile: 8 digits starting with 5, 6, or 9
const KUWAIT_MOBILE_RE = /^[569]\d{7}$/

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, "")
  const local = digits.startsWith("965") && digits.length === 11 ? digits.slice(3) : digits
  if (!KUWAIT_MOBILE_RE.test(local)) return null
  return `+965${local}`
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

    const supabase = createAdminClient()
    const { error } = await supabase.auth.admin.generateLink({
      type: "magiclink",
      email: `${phone.replace("+", "")}@sms.placeholder`,
    })

    // Use Supabase phone OTP (requires phone provider configured in Supabase dashboard)
    const { error: otpError } = await supabase.auth.signInWithOtp({
      phone,
      options: { channel: "sms" },
    })

    if (otpError) {
      // In development, fall back to fixed code if phone provider not configured
      if (process.env.NODE_ENV !== "production") {
        console.log(`[OTP DEV] Code for ${phone}: 123456`)
        return NextResponse.json({ sent: true, devCode: "123456" })
      }
      return NextResponse.json({ error: otpError.message }, { status: 400 })
    }

    return NextResponse.json({ sent: true })
  }

  // ── VERIFY OTP ────────────────────────────────────────────────────────────
  if (body.action === "verify") {
    const phone = normalisePhone(String(body.phone ?? ""))
    const token = String(body.code ?? "").trim()

    if (!phone || !token) {
      return NextResponse.json({ error: "Phone and code are required" }, { status: 400 })
    }

    // Create a response object so Supabase SSR can write session cookies
    let response = NextResponse.json({ ok: true })

    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      {
        cookies: {
          getAll() { return req.cookies.getAll() },
          setAll(cookiesToSet) {
            cookiesToSet.forEach(({ name, value }) => req.cookies.set(name, value))
            response = NextResponse.json({ ok: true })
            cookiesToSet.forEach(({ name, value, options }) =>
              response.cookies.set(name, value, options)
            )
          },
        },
      }
    )

    const { data, error } = await supabase.auth.verifyOtp({
      phone,
      token,
      type: "sms",
    })

    if (error) {
      // Dev fallback: accept "123456" when phone provider not configured
      if (process.env.NODE_ENV !== "production" && token === "123456") {
        // Sign in anonymously and attach phone metadata
        const adminClient = createAdminClient()

        // Upsert ParentAccount in our DB
        const { db } = await import("@/lib/db")
        const parent = await db.parentAccount.upsert({
          where: { phone },
          update: body.name ? { name: String(body.name) } : {},
          create: { phone, name: String(body.name ?? ""), isVerified: true },
        })

        const devResponse = NextResponse.json({
          id: parent.id,
          name: parent.name,
          phone: parent.phone,
        })
        // Set a lightweight session cookie for dev
        devResponse.cookies.set("parent_phone", phone, {
          httpOnly: true,
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 30,
          path: "/",
        })
        return devResponse
      }

      return NextResponse.json({ error: error.message }, { status: 400 })
    }

    // Upsert ParentAccount in our Postgres DB
    const { db } = await import("@/lib/db")
    const parent = await db.parentAccount.upsert({
      where: { phone },
      update: body.name ? { name: String(body.name) } : {},
      create: {
        phone,
        name: String(body.name ?? ""),
        isVerified: true,
        ...(data.user?.email ? { email: data.user.email } : {}),
      },
    })

    // Rewrite response body with parent info (cookies already set by supabase SSR above)
    const finalResponse = NextResponse.json(
      { id: parent.id, name: parent.name, phone: parent.phone },
      { headers: response.headers }
    )
    return finalResponse
  }

  // ── LOGOUT ────────────────────────────────────────────────────────────────
  if (body.action === "logout") {
    const supabase = createAdminClient()
    // Best-effort sign-out; ignore errors
    const res = NextResponse.json({ ok: true })
    res.cookies.delete("parent_phone")
    // Supabase session cookies are sb-* prefixed — clear them
    req.cookies.getAll()
      .filter((c) => c.name.startsWith("sb-"))
      .forEach((c) => res.cookies.delete(c.name))
    return res
  }

  return NextResponse.json({ error: "Unknown action" }, { status: 400 })
}
