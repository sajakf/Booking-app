"use client"

import { use } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { BookingShell } from "@/components/layout/BookingShell"
import { SeatCounter } from "@/components/shared/SeatCounter"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { classrooms } from "@/lib/mock-data/classrooms"
import { cn } from "@/lib/utils"
import type { Classroom } from "@/types/classroom"
import { Check } from "lucide-react"

export default function ClassroomPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const { locale, t } = useLocale()

  const handleSelect = (room: Classroom) => {
    dispatch({ type: "SET_CLASSROOM", classroomId: room.id })
  }

  const handleContinue = () => {
    if (state.selectedClassroomId) {
      router.push(`/${lang}/book/schedule`)
    }
  }

  const minSeatsForRoom = (room: Classroom) => Math.min(...room.days.map((d) => d.seatsRemaining))

  return (
    <BookingShell
      step={1}
      title={t("step2.title")}
      subtitle={t("step2.subtitle")}
    >
      <div className="space-y-4">
        {classrooms.map((room) => {
          const isSelected = state.selectedClassroomId === room.id
          const name = locale === "ar" ? room.nameAr : room.name
          const desc = locale === "ar" ? room.descriptionAr : room.description
          const seatsLeft = minSeatsForRoom(room)
          const isFull = seatsLeft === 0
          const genderEmoji = room.gender === "boys" ? "🟦" : room.gender === "girls" ? "🟧" : "🟩"

          return (
            <button
              key={room.id}
              onClick={() => !isFull && handleSelect(room)}
              disabled={isFull}
              className={cn(
                "w-full rounded-2xl border-2 p-4 text-start transition-all",
                isSelected
                  ? "border-blue-600 bg-blue-50 shadow-md shadow-blue-100"
                  : "border-gray-200 bg-white hover:border-blue-300 hover:shadow-sm",
                isFull && "cursor-not-allowed opacity-50",
              )}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1 flex-wrap">
                    <span className="font-semibold text-gray-900">{name}</span>
                    <span className="shrink-0 rounded-full bg-gray-100 px-2 py-0.5 text-xs font-medium text-gray-600">
                      {genderEmoji} {t(`step2.gender.${room.gender}`)}
                    </span>
                    <span className="shrink-0 text-xs text-gray-400">
                      {t("hero.ages")} {room.ageRange[0]}–{room.ageRange[1]}
                    </span>
                  </div>
                  <p className="mb-3 text-sm text-gray-500">{desc}</p>

                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1">
                    <div>
                      <span className="text-base font-bold text-blue-600">
                        <CurrencyDisplay amount={room.pricePerDay} size="md" />
                      </span>
                      <span className="text-xs text-gray-400"> {t("step2.per_day")}</span>
                    </div>
                    <div>
                      <span className="text-sm font-medium text-green-600">
                        <CurrencyDisplay amount={room.pricePerWeek} size="sm" />
                      </span>
                      <span className="text-xs text-gray-400"> {t("step2.per_week")}</span>
                      <span className="ms-1 rounded-full bg-green-100 px-1.5 py-0.5 text-xs font-medium text-green-700">
                        {t("step2.week_save", { n: room.weekDiscount })}
                      </span>
                    </div>
                  </div>
                </div>

                <div className="flex flex-col items-end gap-2 shrink-0">
                  <div
                    className={cn(
                      "flex size-7 items-center justify-center rounded-full border-2 transition-colors",
                      isSelected
                        ? "border-blue-600 bg-blue-600 text-white"
                        : "border-gray-300 bg-white",
                    )}
                  >
                    {isSelected && <Check className="size-4" />}
                  </div>
                </div>
              </div>

              <div className="mt-3">
                <SeatCounter
                  seatsRemaining={isFull ? 0 : seatsLeft}
                  totalSeats={room.totalSeats}
                  label={
                    isFull
                      ? t("step2.full")
                      : t("step2.seats_remaining", { n: seatsLeft })
                  }
                />
              </div>
            </button>
          )
        })}
      </div>

      {/* Sticky CTA */}
      <div className="mt-6 pb-6">
        <button
          onClick={handleContinue}
          disabled={!state.selectedClassroomId}
          className={cn(
            "w-full rounded-2xl py-4 text-base font-semibold text-white transition-all",
            state.selectedClassroomId
              ? "bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98]"
              : "cursor-not-allowed bg-gray-300",
          )}
        >
          {t("step2.continue")}
        </button>
      </div>
    </BookingShell>
  )
}
