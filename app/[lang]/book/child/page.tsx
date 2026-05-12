"use client"

import { useState, use } from "react"
import { useRouter } from "next/navigation"
import { BookingShell } from "@/components/layout/BookingShell"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { isValidLocale } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import { Rocket, Sparkles, AlertCircle } from "lucide-react"
import { cn } from "@/lib/utils"
import { ScientistBoy, ScientistGirl } from "@/components/ui/ScienceAvatars"

export default function ChildPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const { t } = useLocale()
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const isAr = locale === "ar"

  const [name, setName] = useState(state.child?.name ?? "")
  const [age, setAge] = useState<string>(state.child?.age ? String(state.child.age) : "")
  const [gender, setGender] = useState<"male" | "female" | null>(state.child?.gender ?? null)
  const [errors, setErrors] = useState<{ name?: string; age?: string; gender?: string }>({})

  const validate = () => {
    const e: typeof errors = {}
    if (!name.trim()) e.name = t("error.required")
    const ageNum = parseInt(age)
    if (!age || isNaN(ageNum)) e.age = t("error.required")
    else if (ageNum < 5) e.age = isAr ? "الحد الأدنى للعمر 5 سنوات" : "Minimum age is 5"
    else if (ageNum > 14) e.age = isAr ? "الحد الأقصى للعمر 14 سنة" : "Maximum age is 14"
    if (!gender) e.gender = t("error.required")
    return e
  }

  const handleContinue = () => {
    const e = validate()
    if (Object.keys(e).length > 0) { setErrors(e); return }
    dispatch({ type: "SET_CHILD", child: { name: name.trim(), age: parseInt(age), gender: gender! } })
    router.push(`/${locale}/book/workshops`)
  }

  return (
    <BookingShell step={1} backHref={`/${locale}`}>
      {/* Hero heading */}
      <div className="mb-8 text-center">
        <div className="mb-3 flex justify-center">
          <div className="flex size-16 items-center justify-center rounded-full bg-[#b3f82d]/15 ring-2 ring-[#b3f82d]/30">
            <Rocket className="size-8 text-[#b3f82d]" />
          </div>
        </div>
        <h1 className="text-2xl font-extrabold text-white sm:text-3xl">
          {t("step1.title")}
        </h1>
        <p className="mt-2 text-base text-white/60">{t("step1.subtitle")}</p>
      </div>

      {/* Form card */}
      <div className="rounded-3xl bg-white/5 border border-white/10 p-6 space-y-6">

        {/* Child name */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-blue-200">
            {t("step1.name.label")}
          </label>
          <input
            type="text"
            value={name}
            onChange={(e) => { setName(e.target.value); setErrors((prev) => ({ ...prev, name: undefined })) }}
            placeholder={t("step1.name.placeholder")}
            autoComplete="off"
            className={cn(
              "w-full rounded-2xl border-2 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition",
              "focus:border-violet-400 focus:bg-white/15",
              errors.name ? "border-red-400" : "border-white/20"
            )}
          />
          {errors.name && <ErrorMsg msg={errors.name} />}
        </div>

        {/* Age */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-blue-200">
            {t("step1.age.label")}
          </label>
          <div className="relative">
            <input
              type="number"
              min={5}
              max={14}
              value={age}
              onChange={(e) => { setAge(e.target.value); setErrors((prev) => ({ ...prev, age: undefined })) }}
              placeholder={t("step1.age.placeholder")}
              className={cn(
                "w-full rounded-2xl border-2 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition",
                "focus:border-violet-400 focus:bg-white/15",
                errors.age ? "border-red-400" : "border-white/20"
              )}
            />
            <span className="absolute end-4 top-1/2 -translate-y-1/2 text-sm text-white/40">
              {isAr ? "سنة" : "yrs"}
            </span>
          </div>
          {errors.age
            ? <ErrorMsg msg={errors.age} />
            : <p className="text-xs text-white/40">{t("step1.age_hint")}</p>
          }
        </div>

        {/* Gender */}
        <div className="space-y-2">
          <label className="block text-sm font-bold text-blue-200">
            {t("step1.gender.label")}
          </label>
          <div className="grid grid-cols-2 gap-3">
            {(["male", "female"] as const).map((g) => {
              const isSelected = gender === g
              return (
                <button
                  key={g}
                  onClick={() => { setGender(g); setErrors((prev) => ({ ...prev, gender: undefined })) }}
                  className={cn(
                    "relative flex flex-col items-center gap-2 rounded-2xl border-2 py-4 pt-4 pb-3 transition-all",
                    isSelected
                      ? "border-[#b3f82d] bg-[#b3f82d]/10 scale-[1.02] shadow-lg shadow-[#b3f82d]/15"
                      : "border-white/15 bg-white/5 hover:border-white/30 hover:bg-white/10"
                  )}
                >
                  {g === "male"
                    ? <ScientistBoy className="h-32 w-auto object-contain" style={{ mixBlendMode: "normal" }} />
                    : <ScientistGirl className="h-32 w-auto object-contain" style={{ mixBlendMode: "normal" }} />
                  }
                  <span className={cn("text-sm font-bold", isSelected ? "text-[#b3f82d]" : "text-white/60")}>
                    {g === "male" ? (isAr ? "ولد" : "Boy") : (isAr ? "بنت" : "Girl")}
                  </span>
                  {isSelected && (
                    <span className="absolute top-2 end-2 flex size-5 items-center justify-center rounded-full bg-[#b3f82d] text-[10px] text-[#0d1133] font-black">
                      ✓
                    </span>
                  )}
                </button>
              )
            })}
          </div>
          {errors.gender && <ErrorMsg msg={errors.gender} />}
        </div>

      </div>

      {/* CTA */}
      <div className="mt-6">
        <button
          onClick={handleContinue}
          className="group flex w-full items-center justify-center gap-2 rounded-2xl bg-yellow-400 py-4 text-base font-extrabold text-[#0d1133] shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 active:scale-[0.98]"
        >
          <Sparkles className="size-5 group-hover:rotate-12 transition-transform" />
          {t("step1.continue")}
        </button>
      </div>
    </BookingShell>
  )
}

function ErrorMsg({ msg }: { msg: string }) {
  return (
    <p className="flex items-center gap-1.5 text-xs text-red-400">
      <AlertCircle className="size-3.5 shrink-0" />
      {msg}
    </p>
  )
}
