"use client"

import { use } from "react"
import { BookingContextProvider } from "@/context/BookingContext"
import type { Locale } from "@/types/i18n"
import { isValidLocale } from "@/lib/i18n"

export default function BookingLayout({
  children,
  params,
}: {
  children: React.ReactNode
  params: Promise<{ lang: string }>
}) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"

  return (
    <BookingContextProvider locale={locale}>
      <div className="min-h-screen bg-gray-50">{children}</div>
    </BookingContextProvider>
  )
}
