"use client"

import { use, useMemo, useState } from "react"
import { useRouter } from "next/navigation"
import { BookingShell } from "@/components/layout/BookingShell"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { isValidLocale } from "@/lib/i18n"
import { getWorkshops, getTimeSlots } from "@/lib/mock-data/workshops"
import type { Locale } from "@/types/i18n"
import { cn } from "@/lib/utils"
import { CheckCircle, Clock, Sparkles, Info, ChevronDown, AlertCircle } from "lucide-react"
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
  const [agreedCampTerms, setAgreedCampTerms] = useState(false)
  const [campTermsOpen, setCampTermsOpen] = useState(false)
  const [showTermsError, setShowTermsError] = useState(false)

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
    if (!agreedCampTerms) { setShowTermsError(true); return }
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

      {/* ── CAMP RULES & TERMS ──────────────────────────────────────────────── */}
      <div className="mt-6 rounded-2xl border border-white/15 bg-white/5 overflow-hidden">
        {/* Header row — click to expand */}
        <button
          type="button"
          onClick={() => setCampTermsOpen((v) => !v)}
          className="flex w-full items-center justify-between gap-3 px-4 py-3.5 text-start"
        >
          <div className="flex items-center gap-2.5">
            <span className="flex size-7 shrink-0 items-center justify-center rounded-lg bg-[#b3f82d]/15">
              <svg viewBox="0 0 20 20" className="size-4 text-[#b3f82d]" fill="none">
                <path d="M6 2h8a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2z" stroke="currentColor" strokeWidth="1.5"/>
                <path d="M7 7h6M7 10h6M7 13h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
              </svg>
            </span>
            <span className="text-sm font-bold text-white">
              {isAr ? "قواعد المخيم وعقد الشروط والأحكام" : "Summer Camp Rules & Terms Contract"}
            </span>
          </div>
          <ChevronDown className={cn("size-4 text-white/40 shrink-0 transition-transform", campTermsOpen && "rotate-180")} />
        </button>

        {/* Expandable contract */}
        <div className={cn("overflow-hidden transition-all duration-300", campTermsOpen ? "max-h-[600px]" : "max-h-0")}>
          <div className="space-y-4 border-t border-white/10 px-4 py-4 text-sm text-white/70">

            {/* Section 1 */}
            <div>
              <p className="mb-1.5 font-bold text-[#b3f82d]">
                {isAr ? "١. اتفاقية سلوك المتدرب وأدابه" : "1. Camper Behavior & Conduct Agreement"}
              </p>
              <ul className="space-y-1.5 ps-3">
                {(isAr ? [
                  "يُتوقع من جميع المتدربين احترام المدربين وزملائهم وممتلكات المخيم.",
                  "لا يُسمح بالتنمر أو التحرش أو أي سلوك مُخل بالنظام.",
                  "يحق للمخيم إنهاء مشاركة أي متدرب دون استرداد رسوم في حال انتهاك هذه القواعد.",
                  "يلتزم المتدرب باتباع تعليمات المدربين في جميع الأنشطة.",
                ] : [
                  "All campers are expected to respect instructors, peers, and camp property at all times.",
                  "Bullying, harassment, or disruptive behavior is strictly prohibited.",
                  "The camp reserves the right to dismiss any camper without refund for violations.",
                  "Campers must follow instructor directions during all activities.",
                ]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#b3f82d]/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 2 */}
            <div>
              <p className="mb-1.5 font-bold text-[#b3f82d]">
                {isAr ? "٢. إرشادات الصحة والسلامة" : "2. Health and Safety Guidelines"}
              </p>
              <ul className="space-y-1.5 ps-3">
                {(isAr ? [
                  "يجب على الوالدين إبلاغ المخيم بأي حالات طبية أو حساسية قبل بدء الأنشطة.",
                  "ستُوفَّر معدات الحماية الشخصية لجميع التجارب المختبرية.",
                  "يجب على المتدربين الإبلاغ الفوري عن أي إصابات لأحد أفراد الطاقم.",
                  "لا يُسمح بتناول الطعام أو الشراب داخل المختبرات.",
                ] : [
                  "Parents must notify the camp of any medical conditions or allergies before sessions begin.",
                  "Personal protective equipment (PPE) will be provided for all lab experiments.",
                  "Campers must immediately report any injuries to a staff member.",
                  "No food or drink is permitted inside laboratory spaces.",
                ]).map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="mt-1 size-1.5 shrink-0 rounded-full bg-[#b3f82d]/60" />
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            {/* Section 3 — Insurance (highlighted) */}
            <div className="rounded-xl border border-amber-400/30 bg-amber-400/10 p-3">
              <p className="mb-1.5 font-bold text-amber-300">
                {isAr ? "٣. التأمين الطبي ⚠️" : "3. Medical Insurance ⚠️"}
              </p>
              <p className="leading-relaxed text-amber-200/80">
                {isAr
                  ? "يجب على الوالدين / الأوصياء توفير معلومات التأمين الطبي الخاص بهم. المخيم غير مسؤول عن تغطية النفقات الطبية الناجمة عن الإصابات أو الحوادث خلال الأنشطة."
                  : "Parents/guardians must provide their own medical insurance information. The camp is not responsible for covering any medical expenses arising from injuries or incidents during camp activities."}
              </p>
            </div>
          </div>
        </div>

        {/* Checkbox row */}
        <label className="flex cursor-pointer items-start gap-3 border-t border-white/10 px-4 py-3.5">
          <div className="relative mt-0.5 shrink-0">
            <input
              type="checkbox"
              checked={agreedCampTerms}
              onChange={(e) => { setAgreedCampTerms(e.target.checked); setShowTermsError(false) }}
              className="sr-only"
            />
            <div className={cn(
              "flex size-5 items-center justify-center rounded border-2 transition-all",
              agreedCampTerms ? "border-[#b3f82d] bg-[#b3f82d]" : "border-white/30 bg-white/5"
            )}>
              {agreedCampTerms && <span className="text-[10px] font-black text-[#32246b]">✓</span>}
            </div>
          </div>
          <span className={cn("text-sm leading-snug", agreedCampTerms ? "text-white" : "text-white/60")}>
            {isAr
              ? "أقر بأنني قرأت وأوافق على قواعد المخيم وشروط الأحكام *"
              : "I have read and agree to the Summer Camp Rules & Terms Contract *"}
          </span>
        </label>
      </div>

      {showTermsError && (
        <p className="mt-2 flex items-center gap-1.5 text-xs text-red-400">
          <AlertCircle className="size-3.5 shrink-0" />
          {isAr ? "يجب الموافقة على الشروط للمتابعة" : "You must agree to the terms to continue"}
        </p>
      )}

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
