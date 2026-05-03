"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { BookingShell } from "@/components/layout/BookingShell"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { classrooms, instructors, timeSlots } from "@/lib/mock-data/classrooms"
import { calcSubtotal, applyWeekDiscount, applySiblingDiscount, calcTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import { Tag, Users } from "lucide-react"

export default function ReviewPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const { locale, t } = useLocale()

  const [promoInput, setPromoInput] = useState(state.promoCode)
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle")
  const [promoMsg, setPromoMsg] = useState("")

  const room = classrooms.find((c) => c.id === state.selectedClassroomId)
  const slot = timeSlots.find((s) => s.id === state.selectedTimeSlot)

  if (!room || !state.child || !state.parent) {
    router.replace(`/${lang}/book/details`)
    return null
  }

  const subtotal = calcSubtotal(room.pricePerDay, state.selectedDays.length)
  const weekDiscount = applyWeekDiscount(subtotal, room.weekDiscount, state.isFullWeek)
  const siblingDiscount = applySiblingDiscount(subtotal - weekDiscount, state.hasSibling)
  const total = calcTotal(subtotal, weekDiscount, state.promoDiscount, siblingDiscount)

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoStatus("loading")
    const res = await fetch("/api/promo", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ code: promoInput, subtotal: subtotal - weekDiscount }),
    })
    const data = await res.json()
    if (data.valid) {
      dispatch({ type: "APPLY_PROMO", code: promoInput.toUpperCase(), discount: data.discount })
      setPromoStatus("valid")
      setPromoMsg(locale === "ar" ? data.descriptionAr : data.description)
    } else {
      setPromoStatus("invalid")
      setPromoMsg(t("step5.promo.invalid"))
    }
  }

  const toggleSibling = () => {
    const next = !state.hasSibling
    const disc = applySiblingDiscount(subtotal - weekDiscount, next)
    dispatch({ type: "SET_SIBLING", hasSibling: next, discount: disc })
  }

  // Build line items for the booking draft
  const lineItems = state.selectedDays.map((date) => {
    const day = room.days.find((d) => d.date === date)
    const instructor = instructors.find((i) => i.id === day?.instructorId)
    return {
      classroomId: room.id,
      classroomName: locale === "ar" ? room.nameAr : room.name,
      date,
      timeSlotId: state.selectedTimeSlot ?? "",
      instructorId: day?.instructorId ?? "",
      instructorName: locale === "ar" ? (instructor?.nameAr ?? "") : (instructor?.name ?? ""),
      unitPrice: room.pricePerDay,
    }
  })

  const handleContinue = () => {
    router.push(`/${lang}/book/payment`)
  }

  const slotLabel = locale === "ar" ? slot?.labelAr : slot?.label

  return (
    <BookingShell
      step={4}
      title={t("step5.title")}
      subtitle={t("step5.subtitle")}
      backHref={`/${lang}/book/details`}
    >
      {/* Summary card */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4 space-y-3">
        <SummaryRow label={t("step5.room")} value={locale === "ar" ? room.nameAr : room.name} />
        <SummaryRow
          label={t("step5.dates")}
          value={state.selectedDays.map((d) => new Date(d + "T00:00:00").toLocaleDateString(locale === "ar" ? "ar-KW" : "en-GB", { day: "numeric", month: "short" })).join(" · ")}
        />
        <SummaryRow label={t("step5.time")} value={slotLabel ?? ""} />
        <SummaryRow label={t("step5.child")} value={`${state.child.name}, ${state.child.age} yrs`} />
        <SummaryRow label={t("step5.parent")} value={`${state.parent.name} · ${state.parent.mobile}`} />
      </div>

      {/* Promo code */}
      <div className="mb-4 rounded-2xl border border-gray-200 bg-white p-4">
        <div className="mb-2 flex items-center gap-2">
          <Tag className="size-4 text-gray-500" />
          <span className="text-sm font-medium text-gray-700">{t("step5.promo.label")}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus("idle") }}
            placeholder={t("step5.promo.placeholder")}
            dir="ltr"
            className="flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm font-mono uppercase outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"
          />
          <button
            onClick={handleApplyPromo}
            disabled={promoStatus === "loading"}
            className="rounded-lg bg-gray-900 px-4 py-2 text-sm font-semibold text-white transition hover:bg-gray-700 disabled:opacity-50"
          >
            {promoStatus === "loading" ? "…" : t("step5.promo.apply")}
          </button>
        </div>
        {promoStatus === "valid" && (
          <p className="mt-1.5 text-xs text-green-600">✓ {promoMsg}</p>
        )}
        {promoStatus === "invalid" && (
          <p className="mt-1.5 text-xs text-red-600">{promoMsg}</p>
        )}
      </div>

      {/* Sibling discount */}
      <button
        onClick={toggleSibling}
        className={cn(
          "mb-6 flex w-full items-center gap-3 rounded-2xl border-2 p-4 text-start transition-all",
          state.hasSibling
            ? "border-purple-500 bg-purple-50"
            : "border-gray-200 bg-white hover:border-purple-300",
        )}
      >
        <Users className={cn("size-5 shrink-0", state.hasSibling ? "text-purple-600" : "text-gray-400")} />
        <div className="flex-1">
          <p className="text-sm font-medium text-gray-900">{t("step5.sibling.yes")}</p>
        </div>
        <div className={cn(
          "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
          state.hasSibling ? "border-purple-500 bg-purple-500 text-white" : "border-gray-300"
        )}>
          {state.hasSibling && <span className="text-[10px]">✓</span>}
        </div>
      </button>

      {/* Pricing breakdown */}
      <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 space-y-2">
        <PriceLine label={t("step5.subtotal")} amount={subtotal} />
        {weekDiscount > 0 && (
          <PriceLine label={t("step5.week_discount")} amount={-weekDiscount} isDiscount />
        )}
        {state.promoDiscount > 0 && (
          <PriceLine label={`${t("step5.promo_discount")} (${state.promoCode})`} amount={-state.promoDiscount} isDiscount />
        )}
        {siblingDiscount > 0 && (
          <PriceLine label={t("step5.sibling_discount")} amount={-siblingDiscount} isDiscount />
        )}
        <div className="border-t border-gray-200 pt-2">
          <div className="flex items-center justify-between">
            <span className="font-bold text-gray-900">{t("step5.total")}</span>
            <CurrencyDisplay amount={total} size="lg" className="text-blue-600" />
          </div>
        </div>
      </div>

      <button
        onClick={handleContinue}
        className="w-full rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
      >
        {t("step5.continue")}
      </button>
    </BookingShell>
  )
}

function SummaryRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-start justify-between gap-3 text-sm">
      <span className="shrink-0 text-gray-500">{label}</span>
      <span className="text-end font-medium text-gray-900">{value}</span>
    </div>
  )
}

function PriceLine({ label, amount, isDiscount }: { label: string; amount: number; isDiscount?: boolean }) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-gray-500">{label}</span>
      <span className={cn("font-medium", isDiscount ? "text-green-600" : "text-gray-900")}>
        {isDiscount ? "–" : ""}{Math.abs(amount).toFixed(3)} KD
      </span>
    </div>
  )
}
