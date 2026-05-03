"use client"

import { use, useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { useLocale } from "@/hooks/useLocale"
import { useBooking } from "@/context/BookingContext"
import { CurrencyDisplay } from "@/components/shared/CurrencyDisplay"
import { InstructorBadge } from "@/components/shared/InstructorBadge"
import { instructors, timeSlots } from "@/lib/mock-data/classrooms"
import type { Booking } from "@/types/booking"
import { CheckCircle, QrCode, MessageCircle, Mail, Package } from "lucide-react"
import dynamic from "next/dynamic"

const QRCodeComponent = dynamic(() => import("qrcode.react").then((m) => m.QRCodeSVG), { ssr: false })

export default function ConfirmationPage({ params, searchParams }: {
  params: Promise<{ lang: string }>
  searchParams: Promise<{ ref?: string }>
}) {
  const { lang } = use(params)
  const { ref } = use(searchParams)
  const router = useRouter()
  const { locale, t } = useLocale()
  const { dispatch } = useBooking()

  const [booking, setBooking] = useState<Booking | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState("")

  useEffect(() => {
    if (!ref) {
      setError("No booking reference")
      setLoading(false)
      return
    }
    fetch(`/api/booking/${ref}`)
      .then((r) => r.json())
      .then((data) => {
        if (data.booking) setBooking(data.booking)
        else setError("Booking not found")
      })
      .catch(() => setError("Failed to load booking"))
      .finally(() => setLoading(false))
  }, [ref])

  const handleBookAnother = () => {
    dispatch({ type: "RESET" })
    router.push(`/${lang}/book/classroom`)
  }

  const baseUrl = typeof window !== "undefined" ? window.location.origin : ""
  const qrUrl = `${baseUrl}/${lang}/book/confirmation?ref=${ref}`

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50">
        <div className="flex flex-col items-center gap-3 text-gray-400">
          <div className="size-10 animate-spin rounded-full border-4 border-gray-200 border-t-blue-600" />
          <p className="text-sm">Loading confirmation…</p>
        </div>
      </div>
    )
  }

  if (error || !booking) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-50 p-4">
        <div className="rounded-2xl border border-red-200 bg-white p-6 text-center">
          <p className="text-red-600 font-medium">{error || "Booking not found"}</p>
          <Link href={`/${lang}`} className="mt-4 inline-block text-sm text-blue-600 underline">
            Go home
          </Link>
        </div>
      </div>
    )
  }

  const slotLabel = booking.lineItems[0]?.timeSlotId === "morning"
    ? (locale === "ar" ? "صباحي · 9:00 ص – 12:00 م" : "Morning · 9:00 AM – 12:00 PM")
    : (locale === "ar" ? "مسائي · 1:00 م – 4:00 م" : "Afternoon · 1:00 PM – 4:00 PM")

  const BRING_ITEMS = [
    t("step7.bring1"),
    t("step7.bring2"),
    t("step7.bring3"),
    t("step7.bring4"),
    t("step7.bring5"),
  ]

  return (
    <div className="min-h-screen bg-gray-50 pb-12">
      {/* Success banner */}
      <div className="bg-gradient-to-r from-blue-600 to-blue-700 px-4 pb-10 pt-10 text-center text-white">
        <CheckCircle className="mx-auto mb-3 size-16 text-white/90" />
        <h1 className="text-2xl font-extrabold">{t("step7.title")}</h1>
        <p className="mt-1 text-blue-200">{t("step7.subtitle")}</p>
        <div className="mt-4 inline-block rounded-2xl bg-white/20 px-6 py-3 font-mono text-xl font-bold tracking-widest">
          {booking.ref}
        </div>
      </div>

      <div className="mx-auto max-w-lg space-y-4 px-4 -mt-5">
        {/* QR code */}
        <div className="rounded-2xl border border-gray-200 bg-white p-6 text-center shadow-sm">
          <QrCode className="mx-auto mb-3 size-6 text-gray-400" />
          <p className="mb-4 text-xs text-gray-500">{t("step7.qr_hint")}</p>
          <div className="flex justify-center">
            <QRCodeComponent value={qrUrl} size={160} level="M" />
          </div>
        </div>

        {/* Notifications sent */}
        <div className="rounded-2xl border border-green-200 bg-green-50 p-4 space-y-2">
          <div className="flex items-center gap-2 text-sm text-green-700">
            <MessageCircle className="size-4 shrink-0" />
            <span>{t("step7.whatsapp", { phone: booking.parent.mobile })}</span>
          </div>
          <div className="flex items-center gap-2 text-sm text-green-700">
            <Mail className="size-4 shrink-0" />
            <span>{t("step7.email", { email: booking.parent.email })}</span>
          </div>
        </div>

        {/* Schedule */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <h2 className="mb-3 font-semibold text-gray-900">{t("step7.schedule")}</h2>
          <div className="space-y-3">
            {booking.lineItems.map((item, idx) => {
              const instructor = instructors.find((i) => i.id === item.instructorId)
              const formattedDate = new Date(item.date + "T00:00:00").toLocaleDateString(
                locale === "ar" ? "ar-KW" : "en-GB",
                { weekday: "long", day: "numeric", month: "long" }
              )
              return (
                <div key={idx} className="rounded-xl border border-gray-100 bg-gray-50 p-3">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-gray-900">{formattedDate}</p>
                      <p className="text-xs text-gray-500">{slotLabel}</p>
                    </div>
                    <CurrencyDisplay amount={item.unitPrice} size="sm" className="text-blue-600" />
                  </div>
                  {instructor && (
                    <div className="mt-2">
                      <InstructorBadge instructor={instructor} locale={locale} compact />
                    </div>
                  )}
                </div>
              )
            })}
          </div>
          <div className="mt-3 border-t border-gray-200 pt-3 flex items-center justify-between">
            <span className="font-bold text-gray-900">{locale === "ar" ? "الإجمالي" : "Total Paid"}</span>
            <CurrencyDisplay amount={booking.total} size="lg" className="text-blue-600" />
          </div>
        </div>

        {/* What to bring */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-3 flex items-center gap-2">
            <Package className="size-5 text-orange-500" />
            <h2 className="font-semibold text-gray-900">{t("step7.bring")}</h2>
          </div>
          <ul className="space-y-1.5">
            {BRING_ITEMS.map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-gray-700">
                <span className="text-green-500">✓</span>
                {item}
              </li>
            ))}
          </ul>
        </div>

        {/* Book another */}
        <button
          onClick={handleBookAnother}
          className="w-full rounded-2xl border-2 border-blue-600 py-4 text-base font-semibold text-blue-600 transition hover:bg-blue-50"
        >
          {t("step7.another")}
        </button>
      </div>
    </div>
  )
}
