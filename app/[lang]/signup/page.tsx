"use client"

import { use, useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { isValidLocale, t } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import { ArrowRight, ArrowLeft, CheckCircle, Phone, User, RefreshCw } from "lucide-react"
import { cn } from "@/lib/utils"

function CampLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#1D4ED8" />
      <path d="M24 8 L27.5 18H38L29.5 24.5L33 35L24 28.5L15 35L18.5 24.5L10 18H20.5L24 8Z" fill="#FCD34D" />
      <circle cx="24" cy="24" r="6" fill="#1D4ED8" />
      <circle cx="24" cy="24" r="3" fill="#FCD34D" />
    </svg>
  )
}

export default function SignupPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const isAr = locale === "ar"
  const router = useRouter()
  const ArrowNext = isAr ? ArrowLeft : ArrowRight

  // ── Step 1: details ──────────────────────────────────────────────────────
  const [name, setName]   = useState("")
  const [phone, setPhone] = useState("")

  // ── Step 2: OTP ──────────────────────────────────────────────────────────
  const [step, setStep]         = useState<"form" | "otp" | "done">("form")
  const [otp, setOtp]           = useState(["", "", "", "", "", ""])
  const otpRefs                 = useRef<(HTMLInputElement | null)[]>([])
  const [devCode, setDevCode]   = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)

  // ── Shared ───────────────────────────────────────────────────────────────
  const [loading, setLoading]   = useState(false)
  const [error, setError]       = useState("")

  // Countdown timer for resend
  useEffect(() => {
    if (resendCountdown <= 0) return
    const id = setTimeout(() => setResendCountdown((v) => v - 1), 1000)
    return () => clearTimeout(id)
  }, [resendCountdown])

  // ── Helpers ──────────────────────────────────────────────────────────────
  const phoneDigits = phone.replace(/\D/g, "")
  const isValidPhone = /^[569]\d{7}$/.test(phoneDigits)

  const handleSendOTP = async () => {
    setError("")
    if (!name.trim()) { setError(isAr ? "الرجاء إدخال الاسم" : "Please enter your name"); return }
    if (!isValidPhone) { setError(isAr ? "أدخل رقم كويتي صحيح (يبدأ بـ 5 أو 6 أو 9)" : "Enter a valid Kuwait number (starts with 5, 6, or 9)"); return }

    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: phoneDigits }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Something went wrong"); return }
      setDevCode(data.devCode ?? null)
      setStep("otp")
      setResendCountdown(60)
      // Focus first OTP box after render
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otp]
    next[index] = digit
    setOtp(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      otpRefs.current[index - 1]?.focus()
    }
  }

  const handleVerify = async () => {
    const code = otp.join("")
    if (code.length < 6) { setError(isAr ? "أدخل الرمز المكون من 6 أرقام" : "Enter the 6-digit code"); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone: phoneDigits, code, name: name.trim() }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Verification failed"); return }
      setStep("done")
      setTimeout(() => router.push(`/${locale}/book/child`), 1500)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleResend = async () => {
    if (resendCountdown > 0) return
    setOtp(["", "", "", "", "", ""])
    setError("")
    setDevCode(null)
    await handleSendOTP()
  }

  const inputBase = "w-full rounded-xl border border-gray-200 bg-gray-50 py-3.5 text-sm text-gray-900 outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-blue-50 via-indigo-50 to-white" dir={isAr ? "rtl" : "ltr"}>

      {/* ── Left decorative panel ── */}
      <div className="relative hidden overflow-hidden lg:flex lg:w-5/12 bg-gradient-to-br from-indigo-700 via-blue-700 to-blue-600">
        <div className="pointer-events-none absolute -left-24 -top-24 size-72 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -right-24 size-80 rounded-full bg-yellow-300/10 blur-3xl" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-5 p-12 text-white">
          <CampLogo className="size-20" />
          <h2 className="text-center text-3xl font-black">
            {isAr ? "انضم إلى عائلتنا" : "Join Our Family"}
          </h2>
          <p className="text-center text-blue-200 leading-relaxed">
            {isAr
              ? "سجّل أو سجّل دخولك برقم هاتفك فقط — لا كلمة مرور"
              : "Register or sign in with just your phone number — no password"}
          </p>
          <ul className="mt-4 space-y-3 self-start">
            {(isAr
              ? ["تتبع جميع حجوزاتك", "إشعارات فورية على واتساب", "حجز أسرع في المرة القادمة", "إدارة أطفال متعددين"]
              : ["Track all your bookings", "Instant WhatsApp alerts", "Faster checkout next time", "Manage multiple children"]
            ).map((item) => (
              <li key={item} className="flex items-center gap-2.5 text-sm text-blue-100">
                <CheckCircle className="size-4 shrink-0 text-yellow-300" />
                {item}
              </li>
            ))}
          </ul>
        </div>
      </div>

      {/* ── Right: form panel ── */}
      <div className="flex flex-1 items-center justify-center px-6 py-10">
        <div className="w-full max-w-sm">

          {/* Logo (mobile only) */}
          <div className="mb-8 flex flex-col items-center lg:hidden">
            <CampLogo className="mb-2 size-12" />
            <span className="text-sm font-bold text-gray-700">
              {isAr ? "مخيم النجوم الصغيرة" : "Little Stars Camp"}
            </span>
          </div>

          {/* ── SUCCESS ── */}
          {step === "done" && (
            <div className="flex flex-col items-center gap-4 rounded-2xl bg-emerald-50 border border-emerald-100 p-8 text-center">
              <CheckCircle className="size-14 text-emerald-500" />
              <p className="text-xl font-black text-emerald-800">
                {isAr ? "تم التسجيل بنجاح! 🎉" : "Account created! 🎉"}
              </p>
              <p className="text-sm text-emerald-600">
                {isAr ? "جاري تحويلك..." : "Redirecting you now..."}
              </p>
            </div>
          )}

          {/* ── STEP 1: Name + Phone ── */}
          {step === "form" && (
            <>
              <div className="mb-8">
                <h1 className="text-3xl font-black text-gray-900">
                  {isAr ? "إنشاء حساب" : "Create Account"}
                </h1>
                <p className="mt-1 text-gray-500 text-sm">
                  {isAr ? "أدخل اسمك ورقم هاتفك للمتابعة" : "Enter your name and phone number to continue"}
                </p>
              </div>

              <div className="space-y-4">
                {/* Full Name */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {isAr ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <div className="relative">
                    <User className={cn("absolute top-3.5 size-4 text-gray-400", isAr ? "right-3" : "left-3")} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                      required
                      dir="auto"
                      autoComplete="off"
                      placeholder={isAr ? "الاسم الكامل" : "Your full name"}
                      className={cn(inputBase, isAr ? "pr-9" : "pl-9")}
                    />
                  </div>
                </div>

                {/* Phone */}
                <div>
                  <label className="mb-1.5 block text-sm font-medium text-gray-700">
                    {isAr ? "رقم الجوال" : "Mobile Number"}
                  </label>
                  <div className="flex overflow-hidden rounded-xl border border-gray-200 bg-gray-50 transition focus-within:border-blue-500 focus-within:bg-white focus-within:ring-2 focus-within:ring-blue-500/20">
                    <span className="flex items-center gap-1.5 border-e border-gray-200 bg-gray-100 px-3 text-sm font-semibold text-gray-600 shrink-0">
                      🇰🇼 +965
                    </span>
                    <div className="relative flex flex-1 items-center">
                      <Phone className={cn("absolute size-4 text-gray-400", isAr ? "right-3" : "left-3")} />
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                        dir="ltr"
                        autoComplete="off"
                        placeholder="5X XXX XXXX"
                        className={cn("flex-1 bg-transparent py-3.5 text-sm text-gray-900 outline-none placeholder:text-gray-400", isAr ? "pr-9 pl-3" : "pl-9 pr-3")}
                      />
                    </div>
                  </div>
                  <p className="mt-1.5 text-xs text-gray-400">
                    {isAr ? "أرقام الجوال الكويتية فقط (تبدأ بـ 5 أو 6 أو 9)" : "Kuwait mobile only (starts with 5, 6, or 9)"}
                  </p>
                </div>

                {error && (
                  <p className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={loading || !name.trim() || phoneDigits.length < 8}
                  className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 py-4 text-base font-bold text-white shadow-lg shadow-blue-700/30 transition hover:bg-blue-800 active:scale-[0.98] disabled:opacity-60"
                >
                  {loading
                    ? <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                    : <>{isAr ? "إرسال رمز التحقق" : "Send OTP"} <ArrowNext className="size-5" /></>}
                </button>
              </div>

              <p className="mt-6 text-center text-sm text-gray-400">
                {isAr
                  ? "إذا كان لديك حساب، أدخل رقمك وسيتم تسجيل دخولك تلقائياً"
                  : "Already registered? Enter your number — you'll be signed in automatically"}
              </p>
            </>
          )}

          {/* ── STEP 2: OTP Entry ── */}
          {step === "otp" && (
            <>
              <div className="mb-8">
                <button
                  onClick={() => { setStep("form"); setError(""); setOtp(["","","","","",""]) }}
                  className="mb-4 flex items-center gap-1.5 text-sm font-medium text-gray-500 hover:text-gray-800"
                >
                  <ArrowLeft className="size-4" />
                  {isAr ? "تغيير الرقم" : "Change number"}
                </button>
                <h1 className="text-3xl font-black text-gray-900">
                  {isAr ? "أدخل رمز التحقق" : "Enter OTP"}
                </h1>
                <p className="mt-1 text-sm text-gray-500">
                  {isAr
                    ? <>أُرسل رمز مكوّن من 6 أرقام إلى <span className="font-semibold text-gray-800 dir-ltr">+965 {phoneDigits}</span></>
                    : <>We sent a 6-digit code to <span className="font-semibold text-gray-800">+965 {phoneDigits}</span></>}
                </p>
              </div>

              {/* Dev mode helper */}
              {devCode && (
                <div className="mb-5 flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3">
                  <span className="text-lg">🔧</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-800">Dev mode — OTP code:</p>
                    <p className="text-2xl font-black tracking-widest text-amber-900">{devCode}</p>
                  </div>
                </div>
              )}

              {/* 6-digit OTP boxes */}
              <div className={cn("mb-6 flex gap-2 justify-center", isAr && "flex-row-reverse")}>
                {otp.map((digit, i) => (
                  <input
                    key={i}
                    ref={(el) => { otpRefs.current[i] = el }}
                    type="text"
                    inputMode="numeric"
                    maxLength={1}
                    value={digit}
                    onChange={(e) => handleOtpChange(i, e.target.value)}
                    onKeyDown={(e) => handleOtpKeyDown(i, e)}
                    onFocus={(e) => e.target.select()}
                    className="size-12 rounded-xl border-2 border-gray-200 bg-gray-50 text-center text-xl font-bold text-gray-900 outline-none transition focus:border-blue-500 focus:bg-white focus:ring-2 focus:ring-blue-500/20"
                  />
                ))}
              </div>

              {error && (
                <p className="mb-4 rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-600">{error}</p>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || otp.join("").length < 6}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-blue-700 py-4 text-base font-bold text-white shadow-lg shadow-blue-700/30 transition hover:bg-blue-800 active:scale-[0.98] disabled:opacity-60"
              >
                {loading
                  ? <span className="size-5 animate-spin rounded-full border-2 border-white border-t-transparent" />
                  : <>{isAr ? "تحقق وإنشاء الحساب" : "Verify & Create Account"} <CheckCircle className="size-5" /></>}
              </button>

              {/* Resend */}
              <div className="mt-5 text-center">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-gray-400">
                    {isAr ? `إعادة الإرسال بعد ${resendCountdown}ث` : `Resend in ${resendCountdown}s`}
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="flex items-center gap-1.5 mx-auto text-sm font-semibold text-blue-600 hover:underline"
                  >
                    <RefreshCw className="size-3.5" />
                    {isAr ? "إعادة إرسال الرمز" : "Resend code"}
                  </button>
                )}
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  )
}
