"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLocale } from "@/hooks/useLocale"
import { useBooking } from "@/context/BookingContext"
import type { Booking } from "@/types/booking"
import { CheckCircle, QrCode, MessageCircle, Mail, Sparkles } from "lucide-react"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import dynamic from "next/dynamic"
import { ConfirmationHero } from "@/components/ui/ScienceAvatars"

const QRCodeComponent = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false })

// ── Inline SVG icons for "What to Bring" ──────────────────────────────────────
function WaterBottleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M8 3 h8 v3 l2 3 v11 a2 2 0 0 1-2 2 H8 a2 2 0 0 1-2-2 V9 l2-3 z" fill="#5356df" stroke="#32246b" strokeWidth="1"/>
      <path d="M6 9 h12" stroke="#32246b" strokeWidth="1"/>
      <path d="M10 13 h4 M10 16 h4" stroke="white" strokeWidth="1" strokeLinecap="round"/>
      <rect x="9" y="1" width="6" height="3" rx="1" fill="#32246b"/>
    </svg>
  )
}

function TshirtIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M2 7 L7 4 L9 7 L12 5 L15 7 L17 4 L22 7 L19 11 L17 10 L17 21 H7 V10 L5 11 Z" fill="#b3f82d" stroke="#32246b" strokeWidth="1"/>
    </svg>
  )
}

function AppleIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M12 4 Q14 2 16 3 Q14 5 12 4z" fill="#5356df"/>
      <path d="M12 6 C7 6 5 10 5 14 C5 18 7 21 9 21 C10.5 21 11 20 12 20 C13 20 13.5 21 15 21 C17 21 19 18 19 14 C19 10 17 6 12 6z" fill="#f51553" stroke="#32246b" strokeWidth="0.8"/>
      <path d="M9 9 Q7.5 11 7.5 14" stroke="white" strokeWidth="1" strokeLinecap="round" opacity="0.6"/>
    </svg>
  )
}

function SunIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <circle cx="12" cy="12" r="4" fill="#b3f82d" stroke="#32246b" strokeWidth="1"/>
      {[0,45,90,135,180,225,270,315].map((angle, i) => (
        <line key={i}
          x1={12 + Math.cos(angle*Math.PI/180)*6}
          y1={12 + Math.sin(angle*Math.PI/180)*6}
          x2={12 + Math.cos(angle*Math.PI/180)*9}
          y2={12 + Math.sin(angle*Math.PI/180)*9}
          stroke="#b3f82d" strokeWidth="1.5" strokeLinecap="round"/>
      ))}
    </svg>
  )
}

function StarRocketIcon() {
  return (
    <svg viewBox="0 0 24 24" className="size-5" fill="none">
      <path d="M12 2 C8 2 6 6 6 10 L6 16 L12 18 L18 16 L18 10 C18 6 16 2 12 2z" fill="#f51553" stroke="#32246b" strokeWidth="0.8"/>
      <circle cx="12" cy="10" r="3" fill="#5356df" stroke="white" strokeWidth="1"/>
      <path d="M8 16 L6 20 L12 18 L18 20 L16 16" fill="#32246b"/>
      <path d="M9 18 Q10 22 12 24 Q14 22 15 18" fill="#b3f82d"/>
    </svg>
  )
}

const BRING_ICONS = [WaterBottleIcon, TshirtIcon, AppleIcon, SunIcon, StarRocketIcon]

// ── Floating science decoration elements ─────────────────────────────────────
function FloatingElements() {
  const items = [
    { x: "5%",  y: "8%",  size: 24, color: "#b3f82d", type: "star" },
    { x: "90%", y: "5%",  size: 20, color: "#f51553", type: "star" },
    { x: "2%",  y: "40%", size: 18, color: "#5356df", type: "atom" },
    { x: "93%", y: "35%", size: 22, color: "#b3f82d", type: "atom" },
    { x: "8%",  y: "72%", size: 16, color: "#f51553", type: "star" },
    { x: "88%", y: "68%", size: 20, color: "#b3f82d", type: "star" },
  ]
  return (
    <div className="pointer-events-none absolute inset-0 overflow-hidden">
      {items.map((item, i) => (
        <div key={i} style={{ position: "absolute", left: item.x, top: item.y, opacity: 0.2 }}>
          {item.type === "star" ? (
            <svg width={item.size} height={item.size} viewBox="0 0 40 40">
              <path d="M20 3 l3.5 10.5 L34 13.5 l-8.5 7 3 11 L20 26 l-8.5 5.5 3-11-8.5-7 10.5-.5z" fill={item.color} />
            </svg>
          ) : (
            <svg width={item.size} height={item.size} viewBox="0 0 70 70">
              <circle cx="35" cy="35" r="8" fill={item.color} />
              <ellipse cx="35" cy="35" rx="30" ry="10" stroke={item.color} strokeWidth="2.5" fill="none" />
              <ellipse cx="35" cy="35" rx="30" ry="10" stroke={item.color} strokeWidth="2.5" fill="none" transform="rotate(60 35 35)" />
              <ellipse cx="35" cy="35" rx="30" ry="10" stroke={item.color} strokeWidth="2.5" fill="none" transform="rotate(-60 35 35)" />
            </svg>
          )}
        </div>
      ))}
    </div>
  )
}

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
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6ff]">
        <div className="flex flex-col items-center gap-3 text-[#32246b]/40">
          <div className="size-10 animate-spin rounded-full border-4 border-[#32246b]/10 border-t-[#5356df]" />
          <p className="text-sm">{isAr ? "جاري التحميل…" : "Loading confirmation…"}</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-[#f8f6ff] p-4">
        <div className="rounded-3xl border border-[#32246b]/10 bg-white p-8 text-center shadow-sm">
          <p className="text-red-500 font-medium">{error || "Booking not found"}</p>
          <Link href={`/${lang}`} className="mt-4 inline-block text-sm text-[#5356df] underline">
            {isAr ? "العودة للرئيسية" : "Go home"}
          </Link>
        </div>
      </div>
    )
  }

  return (
    <div className="relative min-h-screen bg-[#f8f6ff] pb-12" dir={isAr ? "rtl" : "ltr"}>
      <FloatingElements />

      {/* Success banner */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#32246b] via-[#5356df] to-[#1f406b] px-4 pb-16 pt-12 text-center text-white">
        {/* Stars background */}
        <div className="absolute inset-0 opacity-10 text-5xl select-none pointer-events-none flex flex-wrap gap-8 p-4">
          {Array.from({ length: 20 }).map((_, i) => <span key={i}>✦</span>)}
        </div>

        <div className="relative">
          <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-[#b3f82d]/40">
            <CheckCircle className="size-10 text-[#b3f82d]" />
          </div>
          <h1 className="text-2xl font-extrabold sm:text-3xl">{t("step7.title")}</h1>
          <p className="mt-1 text-white/70">{t("step7.subtitle")}</p>
          <div className="mt-5 inline-block rounded-2xl bg-[#b3f82d]/20 border border-[#b3f82d]/40 px-8 py-3 font-mono text-xl font-extrabold tracking-widest text-[#b3f82d] backdrop-blur">
            {booking.ref}
          </div>
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 -mt-6 relative z-10">

        {/* Celebration hero illustration */}
        <ConfirmationHero className="w-full rounded-3xl shadow-xl" />

        {/* QR code */}
        <div className="rounded-3xl border border-[#5356df]/10 bg-white p-6 text-center shadow-sm">
          <QrCode className="mx-auto mb-3 size-6 text-[#5356df]/40" />
          <p className="mb-4 text-xs text-[#32246b]/50">{t("step7.qr_hint")}</p>
          <div className="flex justify-center rounded-2xl bg-white p-4 mx-auto max-w-fit border border-[#5356df]/10">
            <QRCodeComponent value={qrUrl} size={148} level="M" />
          </div>
        </div>

        {/* Notifications */}
        <div className="rounded-3xl border border-[#b3f82d]/30 bg-[#b3f82d]/10 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-[#32246b]">
            <MessageCircle className="size-4 shrink-0 text-[#5356df]" />
            <span>{t("step7.whatsapp").replace("{phone}", booking.parent.mobile)}</span>
          </div>
          {booking.parent.email && (
            <div className="flex items-center gap-2 text-sm text-[#32246b]">
              <Mail className="size-4 shrink-0 text-[#5356df]" />
              <span>{t("step7.email").replace("{email}", booking.parent.email)}</span>
            </div>
          )}
        </div>

        {/* Schedule */}
        <div className="rounded-3xl border border-[#5356df]/10 bg-white p-5 shadow-sm">
          <h2 className="mb-4 font-bold text-[#32246b]">{t("step7.schedule")}</h2>
          <div className="space-y-3">
            {booking.lineItems.map((item, idx) => {
              const formattedDate = new Date(item.date + "T00:00:00").toLocaleDateString(
                isAr ? "ar-KW" : "en-GB",
                { weekday: "long", day: "numeric", month: "long" }
              )
              return (
                <div key={idx} className="flex items-center justify-between rounded-2xl border border-[#5356df]/10 bg-[#f8f6ff] p-3">
                  <div>
                    <p className="text-sm font-semibold text-[#32246b]">{formattedDate}</p>
                    <p className="text-xs text-[#5356df]/70">{item.classroomName}</p>
                  </div>
                  <span className="text-sm font-bold text-[#5356df]">
                    {item.unitPrice.toFixed(3)} {t("currency.kwd")}
                  </span>
                </div>
              )
            })}
          </div>
          <div className="mt-4 border-t border-[#5356df]/10 pt-4 flex items-center justify-between">
            <span className="font-bold text-[#32246b]">{isAr ? "الإجمالي المدفوع" : "Total Paid"}</span>
            <span className="text-xl font-extrabold text-[#32246b]">
              {booking.total.toFixed(3)} {t("currency.kwd")}
            </span>
          </div>
        </div>

        {/* What to bring */}
        <div className="rounded-3xl border border-[#5356df]/10 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center gap-2">
            <span className="flex size-8 items-center justify-center rounded-xl bg-[#32246b]">
              <svg viewBox="0 0 24 24" className="size-4" fill="none">
                <path d="M5 8 h14 l-1 12 H6 z" fill="#b3f82d" stroke="#32246b" strokeWidth="1"/>
                <path d="M8 8 V6 a4 4 0 0 1 8 0 v2" stroke="#32246b" strokeWidth="1.5" fill="none"/>
              </svg>
            </span>
            <h2 className="font-bold text-[#32246b]">{t("step7.bring")}</h2>
          </div>
          <ul className="space-y-2.5">
            {BRING_ITEMS.map((item, i) => {
              const IconComp = BRING_ICONS[i]
              return (
                <li key={item} className="flex items-center gap-3 text-sm text-[#32246b]/80">
                  <span className="shrink-0">{IconComp && <IconComp />}</span>
                  {item}
                </li>
              )
            })}
          </ul>
        </div>

        {/* Book another */}
        <button
          onClick={handleBookAnother}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#32246b] py-4 text-base font-extrabold text-[#b3f82d] shadow-lg shadow-[#32246b]/20 transition hover:bg-[#5356df] active:scale-[0.98]"
        >
          <Sparkles className="size-5" />
          {t("step7.another")}
        </button>
      </div>
    </div>
  )
}
