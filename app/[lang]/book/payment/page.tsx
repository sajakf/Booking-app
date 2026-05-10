"use client"

import { use, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { BookingShell } from "@/components/layout/BookingShell"
import { getWorkshop, getSession, getDaysForGender } from "@/lib/mock-data/workshops"
import { cn } from "@/lib/utils"
import { Shield, Loader2, Clock, Sparkles } from "lucide-react"
import { isValidLocale } from "@/lib/i18n"
import type { PaymentMethod } from "@/types/booking"
import type { Locale } from "@/types/i18n"

export default function PaymentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, dispatch } = useBooking()
  const { t } = useLocale()
  const isAr = locale === "ar"

  const [selected, setSelected] = useState<PaymentMethod>("KNET")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const [verifying, setVerifying] = useState(false)
  const [verifyResult, setVerifyResult] = useState<{ reason?: string; status?: string } | null>(null)

  const urlError = searchParams.get("error")
  const urlPaymentId = searchParams.get("paymentId")
  const urlDraftId = searchParams.get("draftId")

  // Guard
  if (!state.child || !state.parent || state.selectedWorkshopIds.length === 0 || !state.selectedSessionId) {
    if (typeof window !== "undefined") router.replace(`/${locale}/book/review`)
    return null
  }

  const workshops = state.selectedWorkshopIds.map((id) => getWorkshop(id)!).filter(Boolean)
  const session = getSession(state.selectedSessionId)!
  const days = getDaysForGender(session, state.child.gender)
  const pricePerDay = workshops.reduce((s, w) => s + w.pricePerSession, 0)
  const subtotal = Math.round(pricePerDay * days.length * 1000) / 1000
  const total = Math.max(0, Math.round((subtotal - state.promoDiscount - state.siblingDiscount) * 1000) / 1000)

  const buildDraft = () => {
    // Build one line item per workshop × per day so the DB has full detail
    const lineItems = workshops.flatMap((w) =>
      days.map((day) => ({
        classroomId: w.id,
        classroomName: w.name,           // EN name — used in MyFatoorah invoice & DB
        classroomNameAr: w.nameAr,
        date: day,
        timeSlotId: w.timeSlot,
        instructorId: "",
        instructorName: "",
        unitPrice: w.pricePerSession,
      }))
    )

    return {
      locale,
      child: state.child,
      parent: state.parent,
      medicalNotes: state.medicalNotes,
      // Resolved items — used by MyFatoorah invoice & stored in DB
      lineItems,
      // Raw IDs — kept for reference
      workshopIds: state.selectedWorkshopIds,
      sessionId: state.selectedSessionId,
      days,
      isFullWeek: days.length >= 5,
      subtotal,
      promoCode: state.promoCode || null,   // string, not nested object
      promoDiscount: state.promoDiscount,
      hasSibling: state.hasSibling,
      siblingDiscount: state.siblingDiscount,
      weekDiscount: 0,
      total,
      currency: "KWD",
      paymentMethod: selected,
      status: "pending_payment",
      createdAt: new Date().toISOString(),
    }
  }

  const handlePay = async () => {
    dispatch({ type: "SET_PAYMENT_METHOD", method: selected })
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingDraft: buildDraft(), paymentMethod: selected, locale }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? "Payment failed")
      window.location.href = data.invoiceUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment initiation failed")
      setLoading(false)
    }
  }

  return (
    <BookingShell step={6} backHref={`/${locale}/book/review`}>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t("step6.title")}</h1>
        <p className="mt-1.5 text-blue-200">{t("step6.subtitle")}</p>
      </div>

      {/* Order summary */}
      <div className="mb-5 rounded-3xl bg-white/5 border border-white/10 p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="font-bold text-white">
              {workshops.map((w) => isAr ? w.nameAr : w.name).join(" + ")}
            </p>
            <p className="text-sm text-white/50 mt-0.5">
              {isAr ? session.labelAr : session.label} · {days.length} {isAr ? "أيام" : "days"}
            </p>
          </div>
          <span className="text-xl font-extrabold text-yellow-400">
            {total.toFixed(3)} {t("currency.kwd")}
          </span>
        </div>
        <div className="mt-3 flex items-center gap-1.5 text-xs text-amber-300/70">
          <Clock className="size-3.5 shrink-0" />
          <span>{t("step6.seat_hold")}</span>
        </div>
      </div>

      {/* Expired seat error */}
      {urlError === "seat_expired" && (
        <div className="mb-4 rounded-2xl border border-amber-400/30 bg-amber-400/10 p-3 text-sm text-amber-300">
          ⏱ {isAr ? "انتهت مدة حجز مقعدك. حاول مرة أخرى." : "Your seat hold expired. Please try again — seats are still available."}
        </div>
      )}

      {/* Payment failed error + recovery */}
      {urlError === "failed" && (
        <div className="mb-4 rounded-2xl border border-red-400/30 bg-red-400/10 p-4 text-sm space-y-3">
          <p className="font-semibold text-red-300">
            ❌ {isAr ? "فشلت عملية الدفع." : "Payment was not completed."}
          </p>

          {/* KNET-specific hint */}
          {selected === "KNET" && !verifyResult && (
            <p className="text-red-200/80 text-xs leading-relaxed">
              {isAr
                ? "للدفع بـ KNET: أدخل رقم البطاقة ← PIN ← رمز OTP بالترتيب لإتمام العملية."
                : "For KNET: you must complete all 3 steps — card number → PIN → OTP — to capture the payment."}
            </p>
          )}

          {/* Verify result message */}
          {verifyResult && (
            <p className="text-amber-200 text-xs">{verifyResult.reason}</p>
          )}

          {/* Verify button — only when we have a paymentId */}
          {urlPaymentId && !verifyResult && (
            <button
              onClick={async () => {
                setVerifying(true)
                try {
                  const params = new URLSearchParams({ paymentId: urlPaymentId, lang: locale })
                  if (urlDraftId) params.set("draftId", urlDraftId)
                  const res = await fetch(`/api/payment/verify?${params}`)
                  // If verify redirects (payment recovered), the fetch follows it
                  if (res.redirected && res.url.includes("/confirmation")) {
                    window.location.href = res.url
                    return
                  }
                  const data = await res.json()
                  setVerifyResult(data)
                } catch {
                  setVerifyResult({ reason: "Could not verify payment status. Please try again." })
                } finally {
                  setVerifying(false)
                }
              }}
              disabled={verifying}
              className="flex items-center gap-2 rounded-xl border border-white/20 bg-white/10 px-3 py-2 text-xs font-semibold text-white hover:bg-white/15 disabled:opacity-50"
            >
              {verifying ? <Loader2 className="size-3.5 animate-spin" /> : "🔍"}
              {verifying
                ? (isAr ? "جاري التحقق…" : "Checking…")
                : (isAr ? "التحقق من حالة الدفع" : "Check payment status")}
            </button>
          )}
        </div>
      )}

      {/* Pay Now */}
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">{t("step6.pay_now_section")}</p>
      <button
        onClick={() => setSelected("KNET")}
        className={cn(
          "flex w-full items-center gap-4 rounded-3xl border-2 p-4 text-start transition-all mb-3",
          selected === "KNET"
            ? "border-emerald-400 bg-emerald-400/10 shadow-lg shadow-emerald-400/15"
            : "border-white/15 bg-white/5 hover:border-white/30"
        )}
      >
        <span className="text-3xl">🏦</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-white">{t("step6.knet.label")}</span>
            <span className="rounded-full bg-emerald-400/20 px-2 py-0.5 text-xs font-semibold text-emerald-300">
              {isAr ? "الأكثر استخداماً" : "Most Popular"}
            </span>
          </div>
          <p className="text-sm text-white/60">{t("step6.knet.desc")}</p>
          <p className="mt-0.5 text-xs text-white/40">{t("step6.knet.otp")}</p>
        </div>
        <RadioDot selected={selected === "KNET"} />
      </button>

      {/* Divider */}
      <div className="my-4 flex items-center gap-3">
        <div className="h-px flex-1 bg-white/10" />
        <span className="text-xs font-semibold text-white/30">{isAr ? "أو ادفع لاحقاً" : "or pay later"}</span>
        <div className="h-px flex-1 bg-white/10" />
      </div>

      {/* BNPL */}
      <p className="mb-2 text-xs font-bold uppercase tracking-widest text-white/40">{t("step6.bnpl.heading")}</p>
      <div className="grid grid-cols-2 gap-3">
        {[
          { method: "TABBY" as PaymentMethod, emoji: "📦", label: t("step6.tabby.label"), desc: t("step6.tabby.desc") },
          { method: "TAMARA" as PaymentMethod, emoji: "🛍️", label: t("step6.tamara.label"), desc: t("step6.tamara.desc") },
        ].map(({ method, emoji, label, desc }) => (
          <button
            key={method}
            onClick={() => setSelected(method)}
            className={cn(
              "flex flex-col items-start gap-2 rounded-3xl border-2 p-4 text-start transition-all",
              selected === method
                ? "border-cyan-400 bg-cyan-400/10 shadow-lg shadow-cyan-400/15"
                : "border-white/15 bg-white/5 hover:border-white/30"
            )}
          >
            <div className="flex w-full items-start justify-between gap-1">
              <span className="text-2xl">{emoji}</span>
              <RadioDot selected={selected === method} />
            </div>
            <div>
              <div className="flex flex-wrap items-center gap-1.5">
                <span className="text-sm font-bold text-white">{label}</span>
                <span className="rounded-full bg-cyan-400/20 px-1.5 py-0.5 text-[10px] font-bold text-cyan-300">0%</span>
              </div>
              <p className="mt-0.5 text-xs text-white/50">{desc}</p>
            </div>
          </button>
        ))}
      </div>

      {error && <p className="mt-4 text-sm text-red-400">{error}</p>}

      {/* CTA */}
      <button
        onClick={handlePay}
        disabled={loading}
        className={cn(
          "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold transition-all",
          !loading
            ? "bg-yellow-400 text-[#0a1628] shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 active:scale-[0.98]"
            : "cursor-not-allowed bg-white/10 text-white/40",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <span>{isAr ? "جاري التحويل…" : "Redirecting…"}</span>
          </>
        ) : (
          <>
            <Sparkles className="size-5" />
            {t("step6.proceed")}
          </>
        )}
      </button>

      {/* Security */}
      <p className="mt-3 flex items-center justify-center gap-2 text-xs text-white/30">
        <Shield className="size-3.5" />
        {t("step6.secure")}
        <span className="rounded border border-white/20 px-1.5 py-0.5 text-[10px] font-bold">PCI-DSS</span>
      </p>

    </BookingShell>
  )
}

function RadioDot({ selected }: { selected: boolean }) {
  return (
    <div className={cn(
      "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
      selected ? "border-yellow-400 bg-yellow-400 text-[#0a1628]" : "border-white/30"
    )}>
      {selected && <span className="text-[10px] font-black">✓</span>}
    </div>
  )
}
