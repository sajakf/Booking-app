import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
import { createServerClient } from "@supabase/ssr"
import { isValidLocale } from "@/lib/i18n"

export async function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl

  // Skip static assets and Next.js internals
  if (
    pathname.startsWith("/_next") ||
    pathname.startsWith("/favicon") ||
    pathname.match(/\.[a-z]+$/)
  ) {
    return NextResponse.next()
  }

  // ── Admin routes — protected by NextAuth JWT ────────────────────────────
  const isAdminRoute = pathname.startsWith("/admin") || pathname.startsWith("/api/admin")
  const isLoginPage = pathname === "/admin/login"

  if (isAdminRoute && !isLoginPage) {
    const token = await getToken({ req: request, secret: process.env.NEXTAUTH_SECRET })
    if (!token) {
      const loginUrl = new URL("/admin/login", request.url)
      loginUrl.searchParams.set("callbackUrl", pathname)
      return NextResponse.redirect(loginUrl)
    }
    return NextResponse.next()
  }

  // Skip API routes (non-admin)
  if (pathname.startsWith("/api")) {
    return NextResponse.next()
  }

  // ── Supabase Auth session refresh (parent-facing pages) ─────────────────
  let response = NextResponse.next({ request })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() { return request.cookies.getAll() },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value))
          response = NextResponse.next({ request })
          cookiesToSet.forEach(({ name, value, options }) =>
            response.cookies.set(name, value, options)
          )
        },
      },
    }
  )
  await supabase.auth.getUser()

  // ── Locale redirect for root and unlocalized paths ──────────────────────
  if (!pathname.startsWith("/en") && !pathname.startsWith("/ar")) {
    const acceptLang = request.headers.get("accept-language") ?? ""
    const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase()
    const locale = isValidLocale(preferred ?? "") ? preferred : "en"
    return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
  }

  return response
}

export const config = {
  matcher: ["/((?!_next|favicon|.*\\..*).*)"],
}
