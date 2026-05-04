"use client"

import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BookingShell } from "@/components/layout/BookingShell"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { isValidLocale } from "@/lib/i18n"
import { getSessions, getWorkshop, getDaysForGender } from "@/lib/mock-data/workshops"
import type { Locale } from "@/types/i18n"
import { cn } from "@/lib/utils"
import { CalendarDays, CheckCircle, Sparkles } from "lucide-react"

// Day-of-week short labels
const DOW_EN: Record<number, string> = { 0: "Sun", 1: "Mon", 2: "Tue", 3: "Wed", 4: "Thu", 5: "Fri", 6: "Sat" }
const DOW_AR: Record<number, string> = { 0: "أحد", 1: "اثن", 2: "ثلا", 3: "أرب", 4: "خمي", 5: "جمع", 6: "سبت" }

function formatDate(iso: string, isAr: boolean) {
  const d = new Date(iso)
  const day = d.getDate()
  const months_en = ["Jan","Feb","Mar","Apr","May","Jun","Jul","Aug","Sep","Oct","Nov","Dec"]
  const months_ar = ["يناير","فبراير","مارس","أبريل","مايو","يونيو","يوليو","أغسطس","سبتمبر","أكتوبر","نوفمبر","ديسمبر"]
  const dow = isAr ? DOW_AR[d.getDay()] : DOW_EN[d.getDay()]
  return isAr
    ? `${dow} ${day} ${months_ar[d.getMonth()]}`
    : `${dow} ${months_en[d.getMonth()]} ${day}`
}

export default function WeeksPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const { t } = useLocale()
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const isAr = locale === "ar"

  const sessions = useMemo(() => getSessions(), [])
  const [selectedSessionId, setSelectedSessionId] = useState<string | null>(state.selectedSessionId)

  // Guard
  if (!state.child) {
    if (typeof window !== "undefined") router.replace(`/${locale}/book/child`)
    return null
  }
  if (state.selectedWorkshopIds.length === 0) {
    if (typeof window !== "undefined") router.replace(`/${locale}/book/workshops`)
    return null
  }

  const gender = state.child.gender
  const pricePerSession = state.selectedWorkshopIds.reduce((sum, id) => {
    const w = getWorkshop(id)
    return sum + (w?.pricePerSession ?? 0)
  }, 0)

  const selectedSession = sessions.find((s) => s.id === selectedSessionId)
  const selectedDays = selectedSession ? getDaysForGender(selectedSession, gender) : []
  // Each day has all selected workshops → price = workshops * days
  const weekTotal = pricePerSession * selectedDays.length

  const handleContinue = () => {
    if (!selectedSessionId || !selectedSession) return
    dispatch({
      type: "SET_SESSION",
      session: { sessionId: selectedSessionId, days: getDaysForGender(selectedSession, gender) },
    })
    router.push(`/${locale}/book/details`)
  }

  const genderLabel = isAr
    ? (gender === "male" ? "البنين" : "البنات")
    : (gender === "male" ? "Boys" : "Girls")

  const daysLabel = isAr
    ? (gender === "male" ? "الأحد، الثلاثاء، الخميس" : "الاثنين، الأربعاء، السبت")
    : (gender === "male" ? "Sun, Tue, Thu" : "Mon, Wed, Sat")

  return (
    <BookingShell step={3} backHref={`/${locale}/book/workshops`}>

      {/* Header */}
      <div className="mb-6 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex size-14 items-center justify-center rounded-full bg-cyan-400/20 ring-2 ring-cyan-400/40">
            <CalendarDays className="size-7 text-cyan-400" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t("step3.title")}</h1>
        <p className="mt-1.5 text-blue-200">{t("step3.subtitle")}</p>
      </div>

      {/* Gender-days info pill */}
      <div className="mb-6 flex items-center justify-center">
        <span className="rounded-full bg-blue-500/20 border border-blue-400/30 px-4 py-2 text-sm font-semibold text-blue-200">
          {isAr ? `أيام ${genderLabel}: ${daysLabel}` : `${genderLabel}' days: ${daysLabel}`}
        </span>
      </div>

      {/* Session cards */}
      <div className="space-y-3">
        {sessions.map((session, idx) => {
          const isSelected = selectedSessionId === session.id
          const days = getDaysForGender(session, gender)

          // Gradient accent per week
          const accentColors = [
            "from-violet-500/20 to-indigo-500/20 border-violet-400/30",
            "from-cyan-500/20 to-blue-500/20 border-cyan-400/30",
            "from-emerald-500/20 to-teal-500/20 border-emerald-400/30",
            "from-orange-500/20 to-amber-500/20 border-orange-400/30",
            "from-pink-500/20 to-rose-500/20 border-pink-400/30",
          ]
          const accent = accentColors[idx % accentColors.length]
          const weekEmojis = ["🔭", "⚗️", "🤖", "🌱", "🚀"]

          return (
            <button
              key={session.id}
              onClick={() => setSelectedSessionId(session.id)}
              className={cn(
                "relative w-full rounded-3xl border-2 bg-gradient-to-br p-5 text-start transition-all",
                isSelected
                  ? "border-yellow-400 bg-yellow-400/10 shadow-xl shadow-yellow-400/15 scale-[1.01]"
                  : `${accent} hover:border-white/30 hover:scale-[1.005]`
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-center gap-3">
                  <span className="text-3xl">{weekEmojis[idx]}</span>
                  <div>
                    <p className={cn("text-lg font-extrabold", isSelected ? "text-yellow-300" : "text-white")}>
                      {isAr ? session.labelAr : session.label}
                    </p>
                    <p className="text-sm text-white/60 mt-0.5">
                      {isAr ? session.dateRangeAr : session.dateRange}
                    </p>
                  </div>
                </div>
                {isSelected && (
                  <CheckCircle className="size-6 text-yellow-400 shrink-0 mt-0.5" fill="currentColor" fillOpacity={0.2} />
                )}
              </div>

              {/* Days row */}
              <div className="mt-4 flex flex-wrap gap-2">
                {days.map((day) => (
                  <span
                    key={day}
                    className={cn(
                      "rounded-xl px-3 py-1.5 text-xs font-semibold",
                      isSelected
                        ? "bg-yellow-400/20 text-yellow-200 border border-yellow-400/30"
                        : "bg-white/10 text-white/70 border border-white/15"
                    )}
                  >
                    {formatDate(day, isAr)}
                  </span>
                ))}
              </div>

              {/* Price tag — shown on hover/selected */}
              {isSelected && (
                <div className="mt-3 flex items-center justify-between rounded-2xl bg-yellow-400/10 border border-yellow-400/20 px-4 py-2.5">
                  <span className="text-sm text-yellow-200">{t("step3.price_label")}</span>
                  <span className="text-lg font-extrabold text-yellow-300">
                    {weekTotal.toFixed(3)} {t("currency.kwd")}
                  </span>
                </div>
              )}
            </button>
          )
        })}
      </div>

      {/* CTA */}
      <div className="sticky bottom-4 mt-6">
        <button
          onClick={handleContinue}
          disabled={!selectedSessionId}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-4 text-base font-extrabold text-[#0a1628] shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
        >
          <Sparkles className="size-5" />
          {t("step3.continue")}
        </button>
      </div>

    </BookingShell>
  )
}
