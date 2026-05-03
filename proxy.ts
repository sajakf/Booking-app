import { NextRequest, NextResponse } from "next/server"
import { getToken } from "next-auth/jwt"
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

  // Admin route protection
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

  // Skip already-localized paths
  if (pathname.startsWith("/en") || pathname.startsWith("/ar")) {
    return NextResponse.next()
  }

  // Locale redirect for root and unlocalized paths
  const acceptLang = request.headers.get("accept-language") ?? ""
  const preferred = acceptLang.split(",")[0]?.split("-")[0]?.toLowerCase()
  const locale = isValidLocale(preferred ?? "") ? preferred : "en"

  return NextResponse.redirect(new URL(`/${locale}${pathname}`, request.url))
}

export const config = {
  matcher: ["/((?!_next|favicon|.*\\..*).*)"],
}
