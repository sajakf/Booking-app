import type { Metadata } from "next"
import type { Locale } from "@/types/i18n"
import { Cairo } from "next/font/google"
import { Geist, Geist_Mono } from "next/font/google"
import { isValidLocale } from "@/lib/i18n"
import "@/app/globals.css"

const geistSans = Geist({ variable: "--font-geist-sans", subsets: ["latin"] })
const geistMono = Geist_Mono({ variable: "--font-geist-mono", subsets: ["latin"] })
const cairo = Cairo({ variable: "--font-cairo", subsets: ["arabic", "latin"] })

export const metadata: Metadata = {
  title: "Little Stars Summer Camp",
  description: "Book your child's spot — Kuwait",
}

export default async function LocaleLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = await params
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const isAr = locale === "ar"

  const fontVars = isAr
    ? `${cairo.variable} ${geistMono.variable}`
    : `${geistSans.variable} ${geistMono.variable}`

  return (
    <html
      lang={locale}
      dir={isAr ? "rtl" : "ltr"}
      className={`${fontVars} h-full antialiased`}
    >
      <body className={`min-h-full flex flex-col ${isAr ? "font-[var(--font-cairo)]" : "font-[var(--font-geist-sans)]"}`}>
        {children}
      </body>
    </html>
  )
}
