"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { BookingShell } from "@/components/layout/BookingShell"
import { getWorkshop, getSession, getTimeSlot, getDaysForGender } from "@/lib/mock-data/workshops"
import { cn } from "@/lib/utils"
import { Tag, Users, CheckCircle, Sparkles } from "lucide-react"
import { isValidLocale } from "@/lib/i18n"
import type { TranslationKey } from "@/lib/i18n/en"
import type { Locale } from "@/types/i18n"

const SIBLING_DISCOUNT_PERCENT = 10

export default function ReviewPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const { t } = useLocale()
  const isAr = locale === "ar"

  const [promoInput, setPromoInput] = useState(state.promoCode)
  const [promoStatus, setPromoStatus] = useState<"idle" | "loading" | "valid" | "invalid">("idle")
  const [promoMsg, setPromoMsg] = useState("")

  // Guard
  if (!state.child || !state.parent || state.selectedWorkshopIds.length === 0 || !state.selectedSessionId) {
    if (typeof window !== "undefined") router.replace(`/${locale}/book/details`)
    return null
  }

  const workshops = state.selectedWorkshopIds.map((id) => getWorkshop(id)!).filter(Boolean)
  const session = getSession(state.selectedSessionId)!
  const days = getDaysForGender(session, state.child.gender)

  const pricePerDay = workshops.reduce((s, w) => s + w.pricePerSession, 0)
  const subtotal = Math.round(pricePerDay * days.length * 1000) / 1000
  const siblingDiscountAmt = state.hasSibling ? Math.round(subtotal * (SIBLING_DISCOUNT_PERCENT / 100) * 1000) / 1000 : 0
  const total = Math.max(0, Math.round((subtotal - state.promoDiscount - siblingDiscountAmt) * 1000) / 1000)

  const handleApplyPromo = async () => {
    if (!promoInput.trim()) return
    setPromoStatus("loading")
    try {
      const res = await fetch("/api/promo", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoInput, subtotal }),
      })
      const data = await res.json()
      if (data.valid) {
        dispatch({ type: "APPLY_PROMO", code: promoInput.toUpperCase(), discount: data.discount })
        setPromoStatus("valid")
        setPromoMsg(isAr ? data.descriptionAr : data.description)
      } else {
        setPromoStatus("invalid")
        setPromoMsg(t("step5.promo.invalid"))
      }
    } catch {
      setPromoStatus("invalid")
      setPromoMsg(t("step5.promo.invalid"))
    }
  }

  const toggleSibling = () => {
    const next = !state.hasSibling
    const disc = next ? Math.round(subtotal * (SIBLING_DISCOUNT_PERCENT / 100) * 1000) / 1000 : 0
    dispatch({ type: "SET_SIBLING", hasSibling: next, discount: disc })
  }

  const formatDay = (iso: string) => {
    const d = new Date(iso)
    return d.toLocaleDateString(isAr ? "ar-KW" : "en-GB", { weekday: "short", month: "short", day: "numeric" })
  }

  return (
    <BookingShell step={5} backHref={`/${locale}/book/details`}>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t("step5.title")}</h1>
        <p className="mt-1.5 text-blue-200">{t("step5.subtitle")}</p>
      </div>

      {/* Booking summary card */}
      <div className="mb-5 rounded-3xl bg-white/5 border border-white/10 p-5 space-y-4">

        {/* Child */}
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-white/50 shrink-0">{t("step5.child")}</span>
          <span className="text-end font-bold text-white">
            {state.child.gender === "male" ? "👦" : "👧"} {state.child.name} · {state.child.age} {isAr ? "سنة" : "yrs"}
          </span>
        </div>

        {/* Workshops */}
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-white/50 shrink-0">{isAr ? "الورش" : "Workshops"}</span>
          <div className="text-end space-y-1">
            {workshops.map((w) => (
              <div key={w.id} className="flex items-center justify-end gap-1.5">
                <span className="font-semibold" style={{ color: w.color }}>{isAr ? w.nameAr : w.name}</span>
                <span className="rounded-full px-2 py-0.5 text-xs font-medium text-white/50" style={{ backgroundColor: w.color + "22" }}>
                  {getTimeSlot(w.timeSlot) ? (isAr ? getTimeSlot(w.timeSlot)!.labelAr : getTimeSlot(w.timeSlot)!.label) : ""}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Week */}
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-white/50 shrink-0">{isAr ? "الأسبوع" : "Week"}</span>
          <span className="text-end font-bold text-white">
            {isAr ? session.labelAr : session.label} · {isAr ? session.dateRangeAr : session.dateRange}
          </span>
        </div>

        {/* Days */}
        <div className="flex items-start justify-between gap-3 text-sm">
          <span className="text-white/50 shrink-0">{isAr ? "الأيام" : "Days"}</span>
          <div className="text-end text-white/80 space-y-0.5">
            {days.map((d) => (
              <div key={d}>{formatDay(d)}</div>
            ))}
          </div>
        </div>

        {/* Parent */}
        <div className="flex items-start justify-between gap-3 text-sm border-t border-white/10 pt-4">
          <span className="text-white/50 shrink-0">{t("step5.parent")}</span>
          <span className="text-end font-semibold text-white">
            {state.parent.name} · +965 {state.parent.mobile}
          </span>
        </div>
      </div>

      {/* Promo code */}
      <div className="mb-4 rounded-3xl bg-white/5 border border-white/10 p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Tag className="size-4 text-yellow-400" />
          <span className="text-sm font-bold text-white">{t("step5.promo.label")}</span>
        </div>
        <div className="flex gap-2">
          <input
            type="text"
            value={promoInput}
            onChange={(e) => { setPromoInput(e.target.value.toUpperCase()); setPromoStatus("idle") }}
            placeholder={t("step5.promo.placeholder")}
            dir="ltr"
            className="flex-1 rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-2.5 text-sm font-mono uppercase text-white placeholder:text-white/30 outline-none transition focus:border-yellow-400"
          />
          <button
            onClick={handleApplyPromo}
            disabled={promoStatus === "loading"}
            className="rounded-2xl bg-yellow-400/20 border border-yellow-400/40 px-4 py-2.5 text-sm font-bold text-yellow-300 hover:bg-yellow-400/30 transition disabled:opacity-50"
          >
            {promoStatus === "loading" ? "…" : t("step5.promo.apply")}
          </button>
        </div>
        {promoStatus === "valid" && <p className="text-xs text-emerald-400">✓ {promoMsg}</p>}
        {promoStatus === "invalid" && <p className="text-xs text-red-400">{promoMsg}</p>}
      </div>

      {/* Sibling discount toggle */}
      <button
        onClick={toggleSibling}
        className={cn(
          "mb-6 flex w-full items-center gap-3 rounded-3xl border-2 p-4 text-start transition-all",
          state.hasSibling
            ? "border-violet-400 bg-violet-400/10"
            : "border-white/15 bg-white/5 hover:border-white/25"
        )}
      >
        <Users className={cn("size-5 shrink-0", state.hasSibling ? "text-violet-300" : "text-white/40")} />
        <div className="flex-1">
          <p className="text-sm font-semibold text-white">{t("step5.sibling.yes")}</p>
        </div>
        <div className={cn(
          "flex size-5 items-center justify-center rounded-full border-2 transition-colors",
          state.hasSibling ? "border-violet-400 bg-violet-400 text-white" : "border-white/30"
        )}>
          {state.hasSibling && <CheckCircle className="size-3.5" />}
        </div>
      </button>

      {/* Pricing breakdown */}
      <div className="mb-6 rounded-3xl bg-white/5 border border-white/10 p-5 space-y-2.5">
        <PriceLine label={t("step5.subtotal")} amount={subtotal} isAr={isAr} t={t} />
        {state.promoDiscount > 0 && (
          <PriceLine label={`${t("step5.promo_discount")} (${state.promoCode})`} amount={-state.promoDiscount} isDiscount isAr={isAr} t={t} />
        )}
        {siblingDiscountAmt > 0 && (
          <PriceLine label={t("step5.sibling_discount")} amount={-siblingDiscountAmt} isDiscount isAr={isAr} t={t} />
        )}
        <div className="border-t border-white/15 pt-3">
          <div className="flex items-center justify-between">
            <span className="text-base font-extrabold text-white">{t("step5.total")}</span>
            <span className="text-xl font-extrabold text-yellow-400">
              {total.toFixed(3)} {t("currency.kwd")}
            </span>
          </div>
        </div>
      </div>

      <button
        onClick={() => router.push(`/${locale}/book/payment`)}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-4 text-base font-extrabold text-[#0a1628] shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 active:scale-[0.98]"
      >
        <Sparkles className="size-5" />
        {t("step5.continue")}
      </button>
    </BookingShell>
  )
}

function PriceLine({ label, amount, isDiscount, isAr, t }: {
  label: string; amount: number; isDiscount?: boolean; isAr: boolean; t: (k: TranslationKey) => string
}) {
  return (
    <div className="flex items-center justify-between text-sm">
      <span className="text-white/50">{label}</span>
      <span className={cn("font-semibold", isDiscount ? "text-emerald-400" : "text-white")}>
        {isDiscount ? "–" : ""}{Math.abs(amount).toFixed(3)} {t("currency.kwd")}
      </span>
    </div>
  )
}
