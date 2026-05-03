"use client"

import { use, useState } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { BookingShell } from "@/components/layout/BookingShell"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { classrooms, instructors } from "@/lib/mock-data/classrooms"
import { calcSubtotal, applyWeekDiscount, calcTotal } from "@/lib/pricing"
import { cn } from "@/lib/utils"
import { Shield, Loader2, Clock } from "lucide-react"
import type { PaymentMethod } from "@/types/booking"

export default function PaymentPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const router = useRouter()
  const searchParams = useSearchParams()
  const { state, dispatch } = useBooking()
  const { locale, t } = useLocale()

  const [selected, setSelected] = useState<PaymentMethod>("KNET")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")

  const urlError = searchParams.get("error")

  const room = classrooms.find((c) => c.id === state.selectedClassroomId)

  if (!room || !state.child || !state.parent) {
    router.replace(`/${lang}/book/details`)
    return null
  }

  const subtotal = calcSubtotal(room.pricePerDay, state.selectedDays.length)
  const weekDiscount = applyWeekDiscount(subtotal, room.weekDiscount, state.isFullWeek)
  const total = calcTotal(subtotal, weekDiscount, state.promoDiscount, state.siblingDiscount)

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

  const bookingDraft = {
    locale,
    child: state.child,
    parent: state.parent,
    medicalNotes: state.medicalNotes,
    lineItems,
    isFullWeek: state.isFullWeek,
    subtotal,
    weekDiscount,
    promoCode: state.promoCode || null,
    promoDiscount: state.promoDiscount,
    siblingDiscount: state.siblingDiscount,
    total,
    currency: "KWD",
    paymentMethod: selected,
    myFatoorahInvoiceId: null,
    myFatoorahPaymentId: null,
    status: "pending_payment",
    createdAt: new Date().toISOString(),
    confirmedAt: null,
  }

  const handlePay = async () => {
    dispatch({ type: "SET_PAYMENT_METHOD", method: selected })
    setLoading(true)
    setError("")
    try {
      const res = await fetch("/api/payment/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ bookingDraft, paymentMethod: selected, locale }),
      })
      const data = await res.json()
      if (!res.ok || data.error) throw new Error(data.error ?? "Payment failed")
      window.location.href = data.invoiceUrl
    } catch (e) {
      setError(e instanceof Error ? e.message : "Payment initiation failed")
      setLoading(false)
    }
  }

  const roomName = locale === "ar" ? room.nameAr : room.name

  return (
    <BookingShell
      step={5}
      title={t("step6.title")}
      subtitle={t("step6.subtitle")}
      backHref={`/${lang}/book/review`}
    >
      {/* Order summary + seat hold notice */}
      <div className="mb-5 rounded-2xl border border-blue-100 bg-blue-50 p-4">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-700">{roomName}</p>
            <p className="text-xs text-gray-500">{state.selectedDays.length} day(s)</p>
          </div>
          <CurrencyDisplay amount={total} size="lg" className="text-blue-700 font-bold" />
        </div>
        <div className="mt-2 flex items-center gap-1.5 text-xs text-amber-600">
          <Clock className="size-3.5 shrink-0" />
          <span>{t("step6.seat_hold")}</span>
        </div>
      </div>

      {/* Seat expired error */}
      {urlError === "seat_expired" && (
        <div className="mb-4 rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-700">
          ⏱ Your seat hold expired. Please try again — seats are still available.
        </div>
      )}

      {/* ── Zone 1: Pay Now ── */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {t("step6.pay_now_section")}
      </p>
      <button
        onClick={() => setSelected("KNET")}
        className={cn(
          "flex w-full items-center gap-4 rounded-2xl border-2 p-4 text-start transition-all",
          selected === "KNET"
            ? "border-green-500 bg-green-50 shadow-sm"
            : "border-gray-200 bg-white hover:border-green-300",
        )}
      >
        <span className="text-3xl">🏦</span>
        <div className="flex-1">
          <div className="flex flex-wrap items-center gap-2">
            <span className="text-base font-bold text-gray-900">{t("step6.knet.label")}</span>
            <span className="rounded-full bg-blue-100 px-2 py-0.5 text-xs font-semibold text-blue-700">
              Most Popular
            </span>
          </div>
          <p className="text-sm text-gray-600">{t("step6.knet.desc")}</p>
          <p className="mt-0.5 text-xs text-gray-400">{t("step6.knet.otp")}</p>
        </div>
        <RadioDot selected={selected === "KNET"} color="green" />
      </button>

      {/* ── Divider ── */}
      <div className="my-5 flex items-center gap-3">
        <div className="h-px flex-1 bg-gray-200" />
        <span className="text-xs font-medium text-gray-400">
          {locale === "ar" ? "أو ادفع لاحقاً" : "or pay later"}
        </span>
        <div className="h-px flex-1 bg-gray-200" />
      </div>

      {/* ── Zone 2: Pay Later (BNPL) ── */}
      <p className="mb-2 text-xs font-semibold uppercase tracking-wide text-gray-400">
        {t("step6.bnpl.heading")}
      </p>
      <div className="grid grid-cols-2 gap-3">
        {/* Tabby */}
        <button
          onClick={() => setSelected("TABBY")}
          className={cn(
            "flex flex-col items-start gap-2 rounded-2xl border-2 p-3 text-start transition-all",
            selected === "TABBY"
              ? "border-green-500 bg-green-50 shadow-sm"
              : "border-gray-200 bg-white hover:border-green-300",
          )}
        >
          <div className="flex w-full items-start justify-between gap-1">
            <span className="text-2xl">📦</span>
            <RadioDot selected={selected === "TABBY"} color="green" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">{t("step6.tabby.label")}</span>
              <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                0% interest
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">{t("step6.tabby.desc")}</p>
          </div>
        </button>

        {/* Tamara */}
        <button
          onClick={() => setSelected("TAMARA")}
          className={cn(
            "flex flex-col items-start gap-2 rounded-2xl border-2 p-3 text-start transition-all",
            selected === "TAMARA"
              ? "border-green-500 bg-green-50 shadow-sm"
              : "border-gray-200 bg-white hover:border-green-300",
          )}
        >
          <div className="flex w-full items-start justify-between gap-1">
            <span className="text-2xl">🛍️</span>
            <RadioDot selected={selected === "TAMARA"} color="green" />
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-1.5">
              <span className="text-sm font-bold text-gray-900">{t("step6.tamara.label")}</span>
              <span className="rounded-full bg-green-100 px-1.5 py-0.5 text-[10px] font-semibold text-green-700">
                0% interest
              </span>
            </div>
            <p className="mt-0.5 text-xs text-gray-500">{t("step6.tamara.desc")}</p>
          </div>
        </button>
      </div>

      {/* Runtime error */}
      {error && <p className="mt-4 text-sm text-red-600">{error}</p>}

      {/* CTA */}
      <button
        onClick={handlePay}
        disabled={loading}
        className={cn(
          "mt-6 flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-semibold text-white transition-all",
          !loading
            ? "bg-blue-600 shadow-lg shadow-blue-200 hover:bg-blue-700 active:scale-[0.98]"
            : "cursor-not-allowed bg-gray-300",
        )}
      >
        {loading ? (
          <>
            <Loader2 className="size-5 animate-spin" />
            <span>Redirecting…</span>
          </>
        ) : (
          t("step6.proceed")
        )}
      </button>

      {/* Security badges */}
      <p className="mt-3 flex items-center justify-center gap-3 text-xs text-gray-400">
        <span className="flex items-center gap-1">
          <Shield className="size-3.5" />
          {t("step6.secure")}
        </span>
        <span className="rounded border border-gray-200 px-1.5 py-0.5 text-[10px] font-semibold text-gray-500">
          PCI-DSS
        </span>
      </p>
    </BookingShell>
  )
}

function RadioDot({ selected, color }: { selected: boolean; color: "green" | "blue" }) {
  return (
    <div
      className={cn(
        "flex size-5 shrink-0 items-center justify-center rounded-full border-2 transition-colors",
        selected
          ? color === "green"
            ? "border-green-500 bg-green-500 text-white"
            : "border-blue-600 bg-blue-600 text-white"
          : "border-gray-300",
      )}
    >
      {selected && <span className="text-[10px]">✓</span>}
    </div>
  )
}
