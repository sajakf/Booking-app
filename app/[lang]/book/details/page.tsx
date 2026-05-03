"use client"

import { use, useState } from "react"
import { useRouter } from "next/navigation"
import { useBooking } from "@/context/BookingContext"
import { useLocale } from "@/hooks/useLocale"
import { BookingShell } from "@/components/layout/BookingShell"
import { PhoneInput } from "@/components/shared/PhoneInput"
import { detailsSchema } from "@/lib/validators"
import { cn } from "@/lib/utils"
import { User, Heart } from "lucide-react"
import { AIChatWidget } from "@/components/shared/AIChatWidget"

function FieldError({ message }: { message?: string }) {
  if (!message) return null
  return <p className="mt-1 text-xs text-red-600">{message}</p>
}

function Label({ children, required }: { children: React.ReactNode; required?: boolean }) {
  return (
    <label className="mb-1.5 block text-sm font-medium text-gray-700">
      {children}
      {required && <span className="ms-0.5 text-red-500">*</span>}
    </label>
  )
}

const inputClass = "w-full rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20"

export default function DetailsPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const router = useRouter()
  const { state, dispatch } = useBooking()
  const { t } = useLocale()

  const [childName, setChildName] = useState(state.child?.name ?? "")
  const [childAge, setChildAge] = useState<number>(state.child?.age ?? 6)
  const [childGender, setChildGender] = useState<"male" | "female">(state.child?.gender ?? "male")
  const [parentName, setParentName] = useState(state.parent?.name ?? "")
  const [parentMobile, setParentMobile] = useState(state.parent?.mobile ?? "")
  const [parentEmail, setParentEmail] = useState(state.parent?.email ?? "")
  const [medicalNotes, setMedicalNotes] = useState(state.medicalNotes ?? "")
  const [errors, setErrors] = useState<Record<string, string>>({})

  if (!state.selectedClassroomId || state.selectedDays.length === 0) {
    router.replace(`/${lang}/book/schedule`)
    return null
  }

  const handleSubmit = () => {
    const result = detailsSchema.safeParse({
      child: { name: childName, age: childAge, gender: childGender },
      parent: { name: parentName, mobile: parentMobile, email: parentEmail },
      medicalNotes,
    })

    if (!result.success) {
      const errs: Record<string, string> = {}
      result.error.issues.forEach((e) => {
        const key = e.path.join(".")
        errs[key] = e.message
      })
      setErrors(errs)
      return
    }

    dispatch({
      type: "SET_CHILD_DETAILS",
      child: result.data.child,
      parent: result.data.parent,
      medicalNotes: result.data.medicalNotes,
    })
    router.push(`/${lang}/book/review`)
  }

  return (
    <BookingShell
      step={3}
      title={t("step4.title")}
      subtitle={t("step4.subtitle")}
      backHref={`/${lang}/book/schedule`}
    >
      <form autoComplete="off" onSubmit={(e) => { e.preventDefault(); handleSubmit() }} className="space-y-6">
        {/* Child info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
              <User className="size-4" />
            </div>
            <h2 className="font-semibold text-gray-900">{t("step4.child.heading")}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label required>{t("step4.child.name")}</Label>
              <input
                type="text"
                value={childName}
                onChange={(e) => setChildName(e.target.value)}
                dir="auto"
                autoComplete="off"
                className={cn(inputClass, errors["child.name"] && "border-red-400")}
                placeholder="e.g. Ahmad Al-Rashidi"
              />
              <FieldError message={errors["child.name"]} />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label required>{t("step4.child.age")}</Label>
                <div className="flex items-center overflow-hidden rounded-lg border border-gray-300 focus-within:border-blue-500 focus-within:ring-2 focus-within:ring-blue-500/20">
                  <button
                    onClick={() => setChildAge((v) => Math.max(1, v - 1))}
                    className="flex size-10 shrink-0 items-center justify-center border-e border-gray-300 bg-gray-50 text-lg font-bold text-gray-600 hover:bg-gray-100"
                  >
                    –
                  </button>
                  <span className="flex-1 text-center text-sm font-semibold">{childAge}</span>
                  <button
                    onClick={() => setChildAge((v) => Math.min(18, v + 1))}
                    className="flex size-10 shrink-0 items-center justify-center border-s border-gray-300 bg-gray-50 text-lg font-bold text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>
                <FieldError message={errors["child.age"]} />
              </div>

              <div>
                <Label required>{t("step4.child.gender")}</Label>
                <div className="flex gap-2">
                  {(["male", "female"] as const).map((g) => (
                    <button
                      key={g}
                      onClick={() => setChildGender(g)}
                      className={cn(
                        "flex-1 rounded-lg border-2 py-2 text-sm font-medium transition-all",
                        childGender === g
                          ? "border-blue-600 bg-blue-50 text-blue-700"
                          : "border-gray-200 bg-white text-gray-600 hover:border-blue-300",
                      )}
                    >
                      {g === "male" ? t("step4.child.gender.male") : t("step4.child.gender.female")}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Parent info */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-purple-100 text-purple-600">
              <User className="size-4" />
            </div>
            <h2 className="font-semibold text-gray-900">{t("step4.parent.heading")}</h2>
          </div>

          <div className="space-y-4">
            <div>
              <Label required>{t("step4.parent.name")}</Label>
              <input
                type="text"
                value={parentName}
                onChange={(e) => setParentName(e.target.value)}
                dir="auto"
                autoComplete="off"
                className={cn(inputClass, errors["parent.name"] && "border-red-400")}
                placeholder="e.g. Mohammed Al-Rashidi"
              />
              <FieldError message={errors["parent.name"]} />
            </div>

            <div>
              <Label required>{t("step4.parent.mobile")}</Label>
              <PhoneInput
                value={parentMobile}
                onChange={setParentMobile}
                error={errors["parent.mobile"]}
              />
            </div>

            <div>
              <Label required>{t("step4.parent.email")}</Label>
              <input
                type="email"
                value={parentEmail}
                onChange={(e) => setParentEmail(e.target.value)}
                dir="ltr"
                autoComplete="off"
                className={cn(inputClass, errors["parent.email"] && "border-red-400")}
                placeholder="parent@example.com"
              />
              <FieldError message={errors["parent.email"]} />
            </div>
          </div>
        </div>

        {/* Medical notes */}
        <div className="rounded-2xl border border-gray-200 bg-white p-4">
          <div className="mb-4 flex items-center gap-2">
            <div className="flex size-8 items-center justify-center rounded-full bg-red-100 text-red-500">
              <Heart className="size-4" />
            </div>
            <h2 className="font-semibold text-gray-900">{t("step4.medical.heading")}</h2>
          </div>
          <textarea
            value={medicalNotes}
            onChange={(e) => setMedicalNotes(e.target.value)}
            rows={3}
            dir="auto"
            placeholder={t("step4.medical.placeholder")}
            className="w-full resize-none rounded-lg border border-gray-300 px-3 py-2.5 text-sm outline-none transition focus:border-blue-500 focus:ring-2 focus:ring-blue-500/20 placeholder:text-gray-400"
          />
        </div>

        <button
          type="submit"
          className="w-full rounded-2xl bg-blue-600 py-4 text-base font-semibold text-white shadow-lg shadow-blue-200 transition hover:bg-blue-700 active:scale-[0.98]"
        >
          {t("step4.continue")}
        </button>
      </form>

      {/* AI chat assistant — always available during registration */}
      <AIChatWidget locale={lang === "ar" ? "ar" : "en"} />
    </BookingShell>
  )
}
