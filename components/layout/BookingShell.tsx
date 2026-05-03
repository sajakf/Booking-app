"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight } from "lucide-react"
import { ProgressBar } from "./ProgressBar"
import { LanguageToggle } from "./LanguageToggle"
import { useLocale } from "@/hooks/useLocale"

interface BookingShellProps {
  children: React.ReactNode
  step: 1 | 2 | 3 | 4 | 5 | 6
  title: string
  subtitle?: string
  backHref?: string
}

export function BookingShell({ children, step, title, subtitle, backHref }: BookingShellProps) {
  const { locale, t } = useLocale()
  const ChevronBack = locale === "ar" ? ChevronRight : ChevronLeft

  return (
    <div className="flex min-h-screen flex-col bg-gray-50">
      {/* Top bar */}
      <header className="sticky top-0 z-20 border-b border-gray-200 bg-white/95 backdrop-blur">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-2">
              {backHref && (
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-1 text-sm text-gray-500 hover:text-gray-900"
                >
                  <ChevronBack className="size-4" />
                  <span className="hidden sm:inline">{t("nav.back")}</span>
                </Link>
              )}
            </div>
            <LanguageToggle />
          </div>
          <ProgressBar currentStep={step} />
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-6">
        <div className="mb-6">
          <h1 className="text-xl font-bold text-gray-900 sm:text-2xl">{title}</h1>
          {subtitle && <p className="mt-1 text-sm text-gray-500">{subtitle}</p>}
        </div>
        {children}
      </main>
    </div>
  )
}
