"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { BookingShell } from "@/components/layout/BookingShell"
import { InstructorBadge } from "@/components/shared/InstructorBadge"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { classrooms, instructors, timeSlots } from "@/lib/mock-data/classrooms"
import { calcSubtotal, applyWeekDiscount, calcTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import { CalendarDays, Zap } from "lucide-react"

const DAY_NAMES_EN = ["Mon", "Tue", "Wed", "Thu", "Fri"]
const DAY_NAMES_AR = ["اثن", "ثلا", "أرب", "خمي", "جمع"]

function formatDate(iso: string, locale: "en" | "ar") {
  const d = new Date(iso + "T00:00:00")
  if (locale === "ar") {
    return d.toLocaleDateString("ar-KW", { day: "numeric", month: "short" })
  }
  return d.toLocaleDateString("en-GB", { day: "numeric", month: "short" })
}

export default function SchedulePage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const { locale, t } = useLocale()

  const room = classrooms.find((c) => c.id === state.selectedClassroomId)

  const [isFullWeek, setIsFullWeek] = useState(state.isFullWeek)
  const [selectedDays, setSelectedDays] = useState<string[]>(state.selectedDays)
  const [selectedSlot, setSelectedSlot] = useState<string | null>(state.selectedTimeSlot)
  const [error, setError] = useState("")

  if (!room) {
    router.replace(`/${lang}/book/classroom`)
    return null
  }

  const allDates = room.days.map((d) => d.date)

  const toggleFullWeek = () => {
    if (!isFullWeek) {
      setSelectedDays(allDates)
      setIsFullWeek(true)
    } else {
      setSelectedDays([])
      setIsFullWeek(false)
    }
  }

  const toggleDay = (date: string) => {
    if (isFullWeek) return
    setSelectedDays((prev) =>
      prev.includes(date) ? prev.filter((d) => d !== date) : [...prev, date],
    )
  }

  const dayNames = locale === "ar" ? DAY_NAMES_AR : DAY_NAMES_EN

  // Pricing preview
  const daysCount = selectedDays.length
  const subtotal = calcSubtotal(room.pricePerDay, daysCount)
  const weekDisc = isFullWeek ? applyWeekDiscount(subtotal, room.weekDiscount, true) : 0
  const total = calcTotal(subtotal, weekDisc, 0, 0)

  const handleContinue = () => {
    if (selectedDays.length === 0) { setError(t("error.select_days")); return }
    if (!selectedSlot) { setError(t("error.select_slot")); return }
    dispatch({ type: "SET_SCHEDULE", days: selectedDays, timeSlot: selectedSlot, isFullWeek })
    router.push(`/${lang}/book/details`)
  }

  return (
    <BookingShell
      step={2}
      title={t("step3.title")}
      subtitle={t("step3.subtitle")}
      backHref={`/${lang}/book/classroom`}
    >
      {/* Full week toggle */}
      <button
        onClick={toggleFullWeek}
        className={cn(
          "mb-6 w-full rounded-2xl border-2 p-4 text-start transition-all",
          isFullWeek
            ? "border-green-500 bg-green-50"
            : "border-gray-200 bg-white hover:border-green-300",
        )}
      >
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className={cn(
              "flex size-9 items-center justify-center rounded-full",
              isFullWeek ? "bg-green-500 text-white" : "bg-gray-100 text-gray-500"
            )}>
              <Zap className="size-5" />
            </div>
            <div>
              <p className="font-semibold text-gray-900">{t("step3.full_week")}</p>
              <p className="text-sm text-gray-500">
                {t("step3.full_week_desc", { n: room.weekDiscount })} ·{" "}
                <CurrencyDisplay amount={room.pricePerWeek} size="sm" />
              </p>
            </div>
          </div>
          <div className={cn(
            "flex size-6 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
            isFullWeek ? "border-green-500 bg-green-500 text-white" : "border-gray-300",
          )}>
            {isFullWeek && <span className="text-xs">✓</span>}
          </div>
        </div>
      </button>

      {/* Day selector */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-gray-700">{t("step3.single_days")}</p>
        <div className="grid grid-cols-5 gap-2">
          {room.days.map((day, idx) => {
            const isSelected = selectedDays.includes(day.date)
            const instructor = instructors.find((i) => i.id === day.instructorId)
            const hasSlots = day.availableSlots.length > 0
            const isFull = day.seatsRemaining === 0

            return (
              <button
                key={day.date}
                onClick={() => !isFull && toggleDay(day.date)}
                disabled={isFull || isFullWeek}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-xl border-2 p-2 text-center transition-all",
                  isSelected && !isFullWeek
                    ? "border-blue-600 bg-blue-50"
                    : isFullWeek && isSelected
                      ? "border-green-500 bg-green-50"
                      : "border-gray-200 bg-white hover:border-blue-300",
                  (isFull || isFullWeek) && !isSelected && "opacity-60",
                )}
              >
                <span className="text-[10px] font-medium text-gray-400 uppercase">
                  {dayNames[idx]}
                </span>
                <span className="text-sm font-bold text-gray-900">
                  {formatDate(day.date, locale)}
                </span>
                {instructor && (
                  <span className="text-[9px] text-gray-400 leading-tight">
                    {locale === "ar" ? instructor.nameAr.split(" ")[0] : instructor.name.split(" ")[0]}
                  </span>
                )}
                {isFull && (
                  <span className="text-[9px] text-orange-500 font-medium">
                    {t("step2.full")}
                  </span>
                )}
                {!isFull && (
                  <span className="text-[9px] text-gray-400">{day.seatsRemaining} left</span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Time slot picker */}
      <div className="mb-6">
        <p className="mb-3 text-sm font-medium text-gray-700">
          {t("step3.slot.morning")} / {t("step3.slot.afternoon")}
        </p>
        <div className="grid grid-cols-2 gap-3">
          {timeSlots.map((slot) => {
            const isSelected = selectedSlot === slot.id
            const label = locale === "ar" ? slot.labelAr : slot.label
            return (
              <button
                key={slot.id}
                onClick={() => setSelectedSlot(slot.id)}
                className={cn(
                  "rounded-xl border-2 p-3 text-center transition-all",
                  isSelected
                    ? "border-blue-600 bg-blue-50"
                    : "border-gray-200 bg-white hover:border-blue-300",
                )}
              >
                <p className="text-sm font-semibold text-gray-900">
                  {locale === "ar" ? (slot.id === "morning" ? t("step3.slot.morning") : t("step3.slot.afternoon")) : (slot.id === "morning" ? t("step3.slot.morning") : t("step3.slot.afternoon"))}
                </p>
                <p className="text-xs text-gray-500">
                  {slot.startTime} – {slot.endTime}
                </p>
              </button>
            )
          })}
        </div>
      </div>

      {/* Instructor for selected days */}
      {selectedDays.length > 0 && (
        <div className="mb-6 rounded-xl border border-blue-100 bg-blue-50 p-3">
          <p className="mb-2 text-xs font-medium text-blue-600 uppercase tracking-wide">
            {t("step3.instructor")}
          </p>
          {(() => {
            const firstDay = room.days.find((d) => selectedDays.includes(d.date))
            const instructor = instructors.find((i) => i.id === firstDay?.instructorId)
            return instructor ? (
              <InstructorBadge instructor={instructor} locale={locale} />
            ) : null
          })()}
        </div>
      )}

      {/* Pricing preview */}
      {daysCount > 0 && (
        <div className="mb-4 rounded-xl border border-gray-200 bg-white p-4">
          <div className="flex items-center justify-between text-sm">
            <span className="text-gray-500">
              {t("step3.days_selected", { n: daysCount })}
            </span>
          </div>
          {isFullWeek && weekDisc > 0 && (
            <div className="mt-1 flex items-center justify-between text-sm text-green-600">
              <span>– {t("step3.full_week_desc", { n: room.weekDiscount })}</span>
              <CurrencyDisplay amount={weekDisc} size="sm" className="text-green-600" />
            </div>
          )}
          <div className="mt-2 flex items-center justify-between">
            <span className="text-sm font-semibold text-gray-700">{t("step3.total_preview")}</span>
            <CurrencyDisplay amount={total} size="lg" className="text-blue-600" />
          </div>
        </div>
      )}

      {error && <p className="mb-3 text-sm text-red-600">{error}</p>}

      <button
        onClick={handleContinue}
        className={cn(
          "w-full rounded-2xl py-4 text-base font-semibold text-white transition-all",
          selectedDays.length > 0 && selectedSlot
            ? "bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98]"
            : "cursor-not-allowed bg-gray-300",
        )}
      >
        {t("step3.continue")}
      </button>
    </BookingShell>
  )
}
