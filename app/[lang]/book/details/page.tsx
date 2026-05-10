"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { BookingShell } from "@/components/layout/BookingShell"
import { isValidLocale } from "@/lib/i18n"
import { cn } from "@/lib/utils"
import { User, Heart, AlertCircle, Sparkles } from "lucide-react"
import type { Locale } from "@/types/i18n"

const KUWAIT_MOBILE_RE = /^[569]\d{7}$/

export default function DetailsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const { t } = useLocale()
  const isAr = locale === "ar"

  const [parentName, setParentName] = useState(state.parent?.name ?? "")
  const [parentMobile, setParentMobile] = useState(state.parent?.mobile ?? "")
  const [parentEmail, setParentEmail] = useState(state.parent?.email ?? "")
  const [medicalNotes, setMedicalNotes] = useState(state.medicalNotes ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  // Guard — must have previous steps done
  if (!state.child || state.selectedWorkshopIds.length === 0 || !state.selectedSessionId) {
    if (typeof window !== "undefined") {
      if (!state.child) router.replace(`/${locale}/book/child`)
      else if (state.selectedWorkshopIds.length === 0) router.replace(`/${locale}/book/workshops`)
      else router.replace(`/${locale}/book/weeks`)
    }
    return null
  }

  const mobileDigits = parentMobile.replace(/\D/g, "").slice(0, 8)

  const validate = () => {
    const e: Record<string, string> = {}
    if (!parentName.trim() || parentName.trim().length < 2) {
      e.parentName = isAr ? "الاسم مطلوب (حرفان على الأقل)" : "Name is required (min 2 chars)"
    }
    if (!KUWAIT_MOBILE_RE.test(mobileDigits)) {
      e.parentMobile = t("error.phone")
    }
    if (!parentEmail.trim()) {
      e.parentEmail = isAr ? "البريد الإلكتروني مطلوب" : "Email is required"
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(parentEmail.trim())) {
      e.parentEmail = t("error.email")
    }
    return e
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const errs = validate()
    if (Object.keys(errs).length > 0) { setErrors(errs); return }

    dispatch({
      type: "SET_PARENT_DETAILS",
      parent: { name: parentName.trim(), mobile: mobileDigits, email: parentEmail.trim() },
      medicalNotes: medicalNotes.trim(),
    })
    router.push(`/${locale}/book/review`)
  }

  return (
    <BookingShell step={4} backHref={`/${locale}/book/weeks`}>

      {/* Header */}
      <div className="mb-6 text-center">
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">{t("step4.title")}</h1>
        <p className="mt-1.5 text-blue-200">{t("step4.subtitle")}</p>
      </div>

      {/* Child summary pill */}
      <div className="mb-5 flex items-center justify-center">
        <div className="flex items-center gap-2 rounded-2xl bg-white/10 border border-white/15 px-4 py-2">
          <span className="text-lg">{state.child.gender === "male" ? "👦" : "👧"}</span>
          <span className="font-bold text-white">{state.child.name}</span>
          <span className="text-white/50">·</span>
          <span className="text-white/70 text-sm">{state.child.age} {isAr ? "سنة" : "yrs"}</span>
        </div>
      </div>

      <form autoComplete="off" onSubmit={handleSubmit} className="space-y-5">

        {/* Parent info card */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-5 space-y-5">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-violet-400/20">
              <User className="size-4 text-violet-300" />
            </div>
            <h2 className="font-bold text-white">{t("step4.parent.heading")}</h2>
          </div>

          {/* Parent name */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-blue-200">{t("step4.parent.name")}</label>
            <input
              type="text"
              value={parentName}
              onChange={(e) => { setParentName(e.target.value); setErrors((p) => ({ ...p, parentName: "" })) }}
              autoComplete="off"
              dir="auto"
              placeholder={isAr ? "الاسم الكامل لولي الأمر" : "Parent's full name"}
              className={cn(
                "w-full rounded-2xl border-2 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none transition",
                "focus:border-violet-400 focus:bg-white/15",
                errors.parentName ? "border-red-400" : "border-white/20"
              )}
            />
            {errors.parentName && <Err msg={errors.parentName} />}
          </div>

          {/* Mobile */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-blue-200">{t("step4.parent.mobile")}</label>
            <div className="flex overflow-hidden rounded-2xl border-2 border-white/20 bg-white/10 transition focus-within:border-violet-400 focus-within:bg-white/15">
              <span className="flex items-center gap-1.5 border-e border-white/20 bg-white/10 px-4 text-sm font-bold text-white/70 shrink-0">
                🇰🇼 +965
              </span>
              <input
                type="tel"
                inputMode="numeric"
                value={mobileDigits}
                onChange={(e) => { setParentMobile(e.target.value.replace(/\D/g, "").slice(0, 8)); setErrors((p) => ({ ...p, parentMobile: "" })) }}
                autoComplete="off"
                dir="ltr"
                placeholder="5X XXX XXXX"
                className="flex-1 bg-transparent px-4 py-3 text-white placeholder:text-white/30 outline-none"
              />
            </div>
            {errors.parentMobile && <Err msg={errors.parentMobile} />}
          </div>

          {/* Email (optional) */}
          <div className="space-y-1.5">
            <label className="block text-sm font-semibold text-blue-200">
              {t("step4.parent.email")}
              <span className="ml-1 text-red-400">*</span>
            </label>
            <input
              type="email"
              value={parentEmail}
              onChange={(e) => { setParentEmail(e.target.value); setErrors((p) => ({ ...p, parentEmail: "" })) }}
              autoComplete="off"
              dir="ltr"
              placeholder="email@example.com"
              className={cn(
                "w-full rounded-2xl border-2 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none transition",
                "focus:border-violet-400 focus:bg-white/15",
                errors.parentEmail ? "border-red-400" : "border-white/20"
              )}
            />
            {errors.parentEmail && <Err msg={errors.parentEmail} />}
          </div>
        </div>

        {/* Medical notes card */}
        <div className="rounded-3xl bg-white/5 border border-white/10 p-5 space-y-3">
          <div className="flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-red-400/20">
              <Heart className="size-4 text-red-300" />
            </div>
            <h2 className="font-bold text-white">{t("step4.medical.heading")}</h2>
          </div>
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            rows={3}
            dir="auto"
            placeholder={t("step4.medical.placeholder")}
            className="w-full resize-none rounded-2xl border-2 border-white/20 bg-white/10 px-4 py-3 text-white placeholder:text-white/30 outline-none transition focus:border-violet-400 focus:bg-white/15 text-sm"
          />
        </div>

        <button
          type="submit"
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-4 text-base font-extrabold text-[#0a1628] shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 active:scale-[0.98]"
        >
          <Sparkles className="size-5" />
          {t("step4.continue")}
        </button>
      </form>
    </BookingShell>
  )
}

function Err({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle className="size-3.5 shrink-0" />
      {msg}
    </p>
  )
}
