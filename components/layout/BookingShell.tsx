"use client"

import Link from "next/link"
import { ChevronLeft, ChevronRight, Telescope } from "lucide-react"
import { ProgressBar } from "./ProgressBar"
import { LanguageToggle } from "./LanguageToggle"
import { useLocale } from "@/hooks/useLocale"

interface BookingShellProps {
  children: React.ReactNode
  step: 1 | 2 | 3 | 4 | 5 | 6
  backHref?: string
}

export function BookingShell({ children, step, backHref }: BookingShellProps) {
  const { locale, t } = useLocale()
  const ChevronBack = locale === "ar" ? ChevronRight : ChevronLeft

  return (
    <div className="flex min-h-screen flex-col bg-[#0d1133]">
      {/* Top bar */}
      <header className="sticky top-0 z-20 bg-[#32246b] backdrop-blur border-b border-white/10 shadow-xl">
        <div className="mx-auto max-w-2xl px-4 py-3">
          <div className="mb-3 flex items-center justify-between">
            <div className="flex items-center gap-3">
              {backHref ? (
                <Link
                  href={backHref}
                  className="inline-flex items-center gap-1.5 rounded-full border border-white/20 bg-white/10 px-3 py-1.5 text-sm font-medium text-white hover:bg-white/20 transition"
                >
                  <ChevronBack className="size-4" />
                  <span className="hidden sm:inline">{t("nav.back")}</span>
                </Link>
              ) : (
                <Link href={`/${locale}`} className="flex items-center gap-2 text-white hover:opacity-80 transition">
                  <Telescope className="size-5 text-[#b3f82d]" />
                  <span className="text-sm font-bold text-[#b3f82d] hidden sm:inline">Science Club</span>
                </Link>
              )}
            </div>
            <LanguageToggle />
          </div>
          <ProgressBar currentStep={step} />
        </div>
      </header>

      {/* Page content */}
      <main className="mx-auto w-full max-w-2xl flex-1 px-4 py-8">
        {children}
      </main>

      {/* Footer */}
      <div className="h-14 flex items-center justify-center select-none pointer-events-none text-white/10 text-xl tracking-widest">
        ✦ ✦ ✦ ✦ ✦
      </div>
    </div>
  )
}
