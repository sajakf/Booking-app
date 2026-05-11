"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLocale } from "@/hooks/useLocale"
import { useBooking } from "@/context/BookingContext"
import type { Booking } from "@/types/booking"
import { CheckCircle, QrCode, MessageCircle, Mail, Package, Sparkles } from "lucide-react"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import dynamic from "next/dynamic"

const QRCodeComponent = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false })

export default function ConfirmationPage({ params, searchParams }: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { lang } = use(params)
  const { ref } = use(searchParams)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const router = useRouter()
  const { t } = useLocale()
  const { dispatch } = useBooking()
  const isAr = locale === "ar"

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!ref) { setError("No booking reference"); setLoading(false); return }
    fetch(`/api/booking/${ref}`)
      .then((r) => r.json())
      .then((data) => { if (data.booking) setBooking(data.booking); else setError("Booking not found") })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false))
  }, [ref])

  const handleBookAnother = () => {
    dispatch({ type: "RESET" })
    router.push(`/${lang}/book/child`)
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const qrUrl = `${baseUrl}/${lang}/book/confirmation?ref=${ref}`

  const BRING_ITEMS = [
    t("step7.bring1"), t("step7.bring2"), t("step7.bring3"), t("step7.bring4"), t("step7.bring5"),
  ]

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628]">
        <div className="flex flex-col items-center gap-3 text-white/40">
          <div className="size-10 animate-spin rounded-full border-4 border-white/10 border-t-yellow-400" />
          <p className="text-sm">{isAr ? "جاري التحميل…" : "Loading confirmation…"}</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#0a1628] p-4">
        <div className="rounded-3xl border border-white/10 bg-white/5 p-8 text-center">
          <p className="text-red-400 font-medium">{error || "Booking not found"}</p>
          <Link href={`/${lang}`} className="mt-4 inline-block text-sm text-yellow-400 underline">
            {isAr ? "العودة للرئيسية" : "Go home"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-[#0a1628] pb-12">

      {/* Success banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-emerald-600 via-teal-600 to-cyan-700 px-4 pb-16 pt-12 text-center text-white">
        {/* Stars */}
        <div className="absolute inset-0 opacity-10 text-5xl select-none pointer-events-none flex flex-wrap gap-8 p-4">
          {Array.from({ length: 20 }).map((_, i) => <span key={i}>✦</span>)}
        </div>

        <div className="relative">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/30">
            <CheckCircle className="size-10 text-white" />
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{t("step7.title")}</h1>
          <p className="mt-1 text-teal-100">{t("step7.subtitle")}</p>
          <div className="mt-5 inline-block rounded-2xl bg-white/20 px-8 py-3 font-mono text-xl font-extrabold tracking-widest backdrop-blur">
            {booking.ref}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 -mt-6">

        {/* QR code */}
        <div className="rounded-3xl border border-white/10 bg-[#0d1f3c] p-6 text-center shadow-xl">
          <QrCode className="mx-auto mb-3 size-6 text-white/40" />
          <p className="mb-4 text-xs text-white/50">{t("step7.qr_hint")}</p>
          <div className="flex justify-center rounded-2xl bg-white p-4 mx-auto max-w-fit">
            <QRCodeComponent value={qrUrl} size={148} level="M" />
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-emerald-300">
            <MessageCircle className="size-4 shrink-0" />
            <span>{t("step7.whatsapp").replace("{phone}", booking.parent.mobile)}</span>
          </div>
          {booking.parent.email && (
            <div className="flex items-center gap-2 text-sm text-emerald-300">
              <Mail className="size-4 shrink-0" />
              <span>{t("step7.email").replace("{email}", booking.parent.email)}</span>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="rounded-3xl border border-white/10 bg-[#0d1f3c] p-5">
          <h2 className="mb-4 font-bold text-white">{t("step7.schedule")}</h2>
          <div className="space-y-3">
            {booking.lineItems.map((item, idx) => {
              const formattedDate = new Date(item.date + "T00:00:00").toLocaleDateString(
                isAr ? "ar-KW" : "en-GB",
                { weekday: "long", day: "numeric", month: "long" }
              )
              return (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-3">
                  <div>
                    <p className="text-sm font-semibold text-white">{formattedDate}</p>
                    <p className="text-xs text-white/50">{item.classroomName}</p>
                  </div>
                  <span className="text-sm font-bold text-yellow-400">
                    {item.unitPrice.toFixed(3)} {t("currency.kwd")}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 border-t border-white/10 pt-4 flex items-center justify-between">
            <span className="font-bold text-white">{isAr ? "الإجمالي المدفوع" : "Total Paid"}</span>
            <span className="text-xl font-extrabold text-yellow-400">
              {booking.total.toFixed(3)} {t("currency.kwd")}
            </span>
          </div>
        </div>

        {/* What to bring */}
        <div className="rounded-3xl border border-white/10 bg-[#0d1f3c] p-5">
          <div className="mb-3 flex items-center gap-2">
            <Package className="size-5 text-orange-400" />
            <h2 className="font-bold text-white">{t("step7.bring")}</h2>
          </div>
          <ul className="space-y-2">
            {BRING_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-white/80">
                <span className="text-emerald-400">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Book another */}
        <button
          onClick={handleBookAnother}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-4 text-base font-extrabold text-[#0a1628] shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 active:scale-[0.98]"
        >
          <Sparkles className="size-5" />
          {t("step7.another")}
        </button>
      </div>
    </div>
  )
}
