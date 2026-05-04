"use client"

import { use, useMemo } from "react"
import { useRouter } from "next/navigation"
import { BookingShell } from "@/components/layout/BookingShell"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { isValidLocale } from "@/lib/i18n"
import { getWorkshops, getTimeSlots } from "@/lib/mock-data/workshops"
import type { Locale } from "@/types/i18n"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, Sparkles, Info } from "lucide-react"
import type { TranslationKey } from "@/lib/i18n/en"
import {
  Printer, Microscope, FlaskConical, Zap, Telescope,
  Camera, Sprout, Cog, BookOpen, Car, Bot, Plane, Video, Palette
} from "lucide-react"

// Map icon name string → Lucide component
const ICON_MAP: Record<string, React.ElementType> = {
  Printer, Microscope, FlaskConical, Zap, Telescope,
  Camera, Sprout, Cog, BookOpen, Car, Bot, Plane, Video, Palette,
}

export default function WorkshopsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const { t } = useLocale()
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const isAr = locale === "ar"

  const workshops = useMemo(() => getWorkshops(), [])
  const timeSlots = useMemo(() => getTimeSlots(), [])
  const selected = state.selectedWorkshopIds

  // If no child info, redirect back
  if (!state.child) {
    if (typeof window !== "undefined") router.replace(`/${locale}/book/child`)
    return null
  }

  const slot1Workshops = workshops.filter((w) => w.timeSlot === "slot-1")
  const slot2Workshops = workshops.filter((w) => w.timeSlot === "slot-2")
  const slot1 = timeSlots.find((s) => s.id === "slot-1")!
  const slot2 = timeSlots.find((s) => s.id === "slot-2")!

  const selectedSlots = selected.map((id) => workshops.find((w) => w.id === id)?.timeSlot)
  const hasSlot1 = selectedSlots.includes("slot-1")
  const hasSlot2 = selectedSlots.includes("slot-2")

  const toggle = (id: string, slotId: string) => {
    if (selected.includes(id)) {
      dispatch({ type: "SET_WORKSHOPS", workshopIds: selected.filter((s) => s !== id) })
      return
    }
    // Max 2 workshops total, max 1 per slot
    const thisSlotTaken = (slotId === "slot-1" ? hasSlot1 : hasSlot2)
    if (thisSlotTaken) return // already have one in this slot
    if (selected.length >= 2) return // already have 2
    dispatch({ type: "SET_WORKSHOPS", workshopIds: [...selected, id] })
  }

  const handleContinue = () => {
    if (selected.length === 0) return
    router.push(`/${locale}/book/weeks`)
  }

  const totalPerSession = selected.reduce((sum, id) => {
    const w = workshops.find((w) => w.id === id)
    return sum + (w?.pricePerSession ?? 0)
  }, 0)

  return (
    <BookingShell step={2} backHref={`/${locale}/book/child`}>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          {t("step2.title")}
        </h1>
        <p className="mt-1.5 text-blue-200">{t("step2.subtitle")}</p>
      </div>

      {/* Hint */}
      <div className="mb-6 flex items-start gap-2.5 rounded-2xl bg-blue-500/10 border border-blue-400/20 px-4 py-3">
        <Info className="size-4 text-blue-300 shrink-0 mt-0.5" />
        <p className="text-sm text-blue-200">{t("step2.max_hint")}</p>
      </div>

      {/* Slot 1 */}
      <SlotSection
        label={isAr ? slot1.labelAr : slot1.label}
        slotId="slot-1"
        occupied={hasSlot1}
        workshops={slot1Workshops}
        selected={selected}
        toggle={toggle}
        isAr={isAr}
        t={t}
        slotBadgeColor="bg-violet-500"
      />

      {/* Slot 2 */}
      <SlotSection
        label={isAr ? slot2.labelAr : slot2.label}
        slotId="slot-2"
        occupied={hasSlot2}
        workshops={slot2Workshops}
        selected={selected}
        toggle={toggle}
        isAr={isAr}
        t={t}
        slotBadgeColor="bg-cyan-500"
      />

      {/* Selected summary + CTA */}
      <div className="sticky bottom-4 mt-6">
        <div className="rounded-3xl bg-[#0d1f3c] border border-white/10 p-4 shadow-2xl">
          {selected.length > 0 ? (
            <div className="mb-3 flex items-center justify-between">
              <div className="flex gap-2 flex-wrap">
                {selected.map((id) => {
                  const w = workshops.find((w) => w.id === id)!
                  return (
                    <span
                      key={id}
                      className="flex items-center gap-1 rounded-full px-3 py-1 text-xs font-bold"
                      style={{ backgroundColor: w.bgLight, color: w.color }}
                    >
                      {isAr ? w.nameAr : w.name}
                      <button onClick={() => toggle(id, w.timeSlot)} className="ms-1 opacity-60 hover:opacity-100">×</button>
                    </span>
                  )
                })}
              </div>
              <span className="text-sm font-extrabold text-yellow-400 shrink-0 ms-3">
                {totalPerSession.toFixed(3)} {t("currency.kwd")} {t("step2.per_session")}
              </span>
            </div>
          ) : (
            <p className="mb-3 text-center text-sm text-white/40">
              {isAr ? "لم تختر ورشة بعد 👆" : "No workshop selected yet 👆"}
            </p>
          )}
          <button
            onClick={handleContinue}
            disabled={selected.length === 0}
            className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-3.5 text-base font-extrabold text-[#0a1628] shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 active:scale-[0.98] disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <Sparkles className="size-5" />
            {t("step2.continue")}
          </button>
        </div>
      </div>

    </BookingShell>
  )
}

// ── Slot section ──────────────────────────────────────────────────────────────
interface SlotSectionProps {
  label: string
  slotId: string
  occupied: boolean
  workshops: ReturnType<typeof getWorkshops>
  selected: string[]
  toggle: (id: string, slotId: string) => void
  isAr: boolean
  t: (key: TranslationKey) => string
  slotBadgeColor: string
}

function SlotSection({ label, slotId, occupied, workshops, selected, toggle, isAr, t, slotBadgeColor }: SlotSectionProps) {
  return (
    <div className="mb-8">
      {/* Time-slot label */}
      <div className="mb-3 flex items-center gap-2">
        <span className={cn("flex items-center gap-1.5 rounded-full px-3 py-1 text-xs font-bold text-white", slotBadgeColor)}>
          <Clock className="size-3.5" />
          {label}
        </span>
        {occupied && (
          <span className="rounded-full bg-yellow-400/15 px-2 py-0.5 text-xs font-semibold text-yellow-300 border border-yellow-400/30">
            {isAr ? "تم الاختيار ✓" : "Slot filled ✓"}
          </span>
        )}
      </div>

      {/* Workshop cards grid */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
        {workshops.map((w) => {
          const Icon = ICON_MAP[w.icon] ?? Sparkles
          const isSelected = selected.includes(w.id)
          const isBlocked = !isSelected && occupied // slot already filled
          return (
            <button
              key={w.id}
              onClick={() => toggle(w.id, slotId)}
              disabled={isBlocked && !isSelected}
              className={cn(
                "relative flex flex-col items-start gap-2.5 rounded-2xl border-2 p-3.5 text-start transition-all",
                isSelected
                  ? "border-yellow-400 bg-yellow-400/10 shadow-lg shadow-yellow-400/15 scale-[1.02]"
                  : isBlocked
                    ? "border-white/5 bg-white/3 opacity-40 cursor-not-allowed"
                    : "border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/10 active:scale-[0.98]"
              )}
            >
              {/* Icon circle */}
              <div
                className="flex size-10 items-center justify-center rounded-xl shadow-md"
                style={{ backgroundColor: w.color + "22", border: `1.5px solid ${w.color}55` }}
              >
                <Icon className="size-5" style={{ color: w.color }} />
              </div>

              {/* Name */}
              <div className="flex-1">
                <p className={cn("text-sm font-bold leading-tight", isSelected ? "text-yellow-200" : "text-white")}>
                  {isAr ? w.nameAr : w.name}
                </p>
                <p className="mt-0.5 text-xs text-white/40 line-clamp-2">
                  {isAr ? w.descriptionAr : w.description}
                </p>
              </div>

              {/* Price */}
              <span className="text-xs font-semibold" style={{ color: isSelected ? "#fde047" : w.color }}>
                {w.pricePerSession.toFixed(3)} {t("currency.kwd")}
              </span>

              {/* Selected check */}
              {isSelected && (
                <CheckCircle
                  className="absolute end-2 top-2 size-5 text-yellow-400"
                  fill="currentColor"
                  fillOpacity={0.2}
                />
              )}
            </button>
          )
        })}
      </div>
    </div>
  )
}
