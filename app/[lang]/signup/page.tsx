"use client"

import { use, useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { isValidLocale } from "@/lib/i18n"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import type { Locale } from "@/types/i18n"
import {
  ArrowRight, ArrowLeft, CheckCircle, Phone, User,
  RefreshCw, Telescope, AlertCircle, Loader2, Sparkles,
} from "lucide-react"
import { cn } from "@/lib/utils"

export default function SignupPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const isAr = locale === "ar"
  const router = useRouter()
  const ArrowNext = isAr ? ArrowLeft : ArrowRight

  // ── State ─────────────────────────────────────────────────────────────────
  const [name, setName]   = useState("")
  const [phone, setPhone] = useState("")
  const [step, setStep]   = useState<"form" | "otp" | "done">("form")
  const [otp, setOtp]     = useState(["", "", "", "", "", ""])
  const otpRefs           = useRef<(HTMLInputElement | null)[]>([])
  const [devCode, setDevCode]               = useState<string | null>(null)
  const [resendCountdown, setResendCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError]     = useState("")

  useEffect(() => {
    if (resendCountdown <= 0) return
    const id = setTimeout(() => setResendCountdown((v) => v - 1), 1000)
    return () => clearTimeout(id)
  }, [resendCountdown])

  // ── Helpers ───────────────────────────────────────────────────────────────
  const phoneDigits  = phone.replace(/\D/g, "")
  const isValidPhone = /^[569]\d{7}$/.test(phoneDigits)

  const handleSendOTP = async () => {
    setError("")
    if (!name.trim()) {
      setError(isAr ? "الرجاء إدخال الاسم" : "Please enter your name")
      return
    }
    if (!isValidPhone) {
      setError(isAr ? "أدخل رقماً كويتياً صحيحاً (يبدأ بـ 5 أو 6 أو 9)" : "Enter a valid Kuwait number (starts with 5, 6, or 9)")
      return
    }
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
      setTimeout(() => otpRefs.current[0]?.focus(), 100)
    } catch {
      setError("Something went wrong. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, "").slice(-1)
    const next = [...otp]; next[index] = digit; setOtp(next)
    if (digit && index < 5) otpRefs.current[index + 1]?.focus()
  }

  const handleOtpKeyDown = (index: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) otpRefs.current[index - 1]?.focus()
  }

  const handleVerify = async () => {
    const code = otp.join("")
    if (code.length < 6) { setError(isAr ? "أدخل الرمز المكون من 6 أرقام" : "Enter the 6-digit code"); return }
    setError(""); setLoading(true)
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
    setOtp(["", "", "", "", "", ""]); setError(""); setDevCode(null)
    await handleSendOTP()
  }

  // ── Shared input style (matches booking flow) ─────────────────────────────
  const inputCls = (hasError?: boolean) => cn(
    "w-full rounded-2xl border-2 bg-white/10 px-4 py-3.5 text-white placeholder:text-white/30 outline-none transition",
    "focus:border-yellow-400 focus:bg-white/15",
    hasError ? "border-red-400" : "border-white/20"
  )

  return (
    <div className="flex min-h-screen flex-col bg-[#0a1628]" dir={isAr ? "rtl" : "ltr"}>

      {/* ── Header — identical to BookingShell ── */}
      <header className="sticky top-0 z-20 border-b border-white/10 bg-[#0d1f3c]/95 shadow-lg backdrop-blur">
        <div className="mx-auto flex max-w-2xl items-center justify-between px-4 py-3">
          <Link href={`/${locale}`} className="flex items-center gap-2 text-white transition hover:opacity-80">
            <Telescope className="size-5 text-yellow-400" />
            <span className="hidden text-sm font-bold text-yellow-400 sm:inline">Science Club</span>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      {/* ── Main ── */}
      <main className="mx-auto flex w-full max-w-md flex-1 flex-col justify-center px-4 py-10">

        {/* ── SUCCESS ── */}
        {step === "done" && (
          <div className="rounded-3xl border border-emerald-400/20 bg-emerald-400/10 p-10 text-center">
            <div className="mx-auto mb-4 flex size-20 items-center justify-center rounded-full bg-emerald-400/20 ring-4 ring-emerald-400/30">
              <CheckCircle className="size-10 text-emerald-400" />
            </div>
            <p className="text-2xl font-extrabold text-white">
              {isAr ? "تم التسجيل بنجاح! 🎉" : "You're in! 🎉"}
            </p>
            <p className="mt-2 text-sm text-emerald-300">
              {isAr ? "جاري تحويلك…" : "Redirecting you now…"}
            </p>
          </div>
        )}

        {/* ── STEP 1: Name + Phone ── */}
        {step === "form" && (
          <>
            <div className="mb-8 text-center">
              <div className="mb-4 flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-yellow-400/20 ring-2 ring-yellow-400/40">
                  <Sparkles className="size-8 text-yellow-400" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                {isAr ? "إنشاء حساب" : "Create Account"}
              </h1>
              <p className="mt-2 text-blue-200">
                {isAr ? "أدخل اسمك ورقم هاتفك للمتابعة" : "Enter your name & phone number to continue"}
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur">
              <div className="space-y-5">

                {/* Full Name */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-blue-200">
                    {isAr ? "الاسم الكامل" : "Full Name"}
                  </label>
                  <div className="relative">
                    <User className={cn("absolute top-1/2 -translate-y-1/2 size-4 text-white/30", isAr ? "right-4" : "left-4")} />
                    <input
                      type="text"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                      dir="auto"
                      autoComplete="off"
                      placeholder={isAr ? "الاسم الكامل" : "Your full name"}
                      className={cn(inputCls(), isAr ? "pr-11" : "pl-11")}
                    />
                  </div>
                </div>

                {/* Mobile */}
                <div className="space-y-1.5">
                  <label className="block text-sm font-semibold text-blue-200">
                    {isAr ? "رقم الجوال" : "Mobile Number"}
                  </label>
                  <div className={cn(
                    "flex overflow-hidden rounded-2xl border-2 bg-white/10 transition",
                    "focus-within:border-yellow-400 focus-within:bg-white/15 border-white/20"
                  )}>
                    <span className="flex shrink-0 items-center gap-1.5 border-e border-white/20 bg-white/10 px-4 text-sm font-bold text-white/70">
                      🇰🇼 +965
                    </span>
                    <div className="relative flex flex-1 items-center">
                      <Phone className={cn("absolute size-4 text-white/30", isAr ? "right-4" : "left-4")} />
                      <input
                        type="tel"
                        inputMode="numeric"
                        value={phoneDigits}
                        onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
                        onKeyDown={(e) => e.key === "Enter" && handleSendOTP()}
                        dir="ltr"
                        autoComplete="off"
                        placeholder="5X XXX XXXX"
                        className={cn(
                          "flex-1 bg-transparent py-3.5 text-white outline-none placeholder:text-white/30",
                          isAr ? "pr-11 pl-3" : "pl-11 pr-3"
                        )}
                      />
                    </div>
                  </div>
                  <p className="text-xs text-white/40">
                    {isAr ? "أرقام الجوال الكويتية فقط (تبدأ بـ 5 أو 6 أو 9)" : "Kuwait mobile only (starts with 5, 6, or 9)"}
                  </p>
                </div>

                {error && (
                  <div className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                    <AlertCircle className="size-4 shrink-0" />
                    {error}
                  </div>
                )}

                <button
                  onClick={handleSendOTP}
                  disabled={loading || !name.trim() || phoneDigits.length < 8}
                  className={cn(
                    "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold transition-all",
                    !loading && name.trim() && phoneDigits.length >= 8
                      ? "bg-yellow-400 text-[#0a1628] shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 active:scale-[0.98]"
                      : "cursor-not-allowed bg-white/10 text-white/40"
                  )}
                >
                  {loading
                    ? <Loader2 className="size-5 animate-spin" />
                    : <><Sparkles className="size-5" /> {isAr ? "إرسال رمز التحقق" : "Send OTP"} <ArrowNext className="size-5" /></>}
                </button>
              </div>
            </div>

            <p className="mt-6 text-center text-sm text-white/40">
              {isAr
                ? "إذا كان لديك حساب، أدخل رقمك وسيتم تسجيل دخولك تلقائياً"
                : "Already registered? Enter your number — you'll be signed in automatically"}
            </p>
          </>
        )}

        {/* ── STEP 2: OTP Entry ── */}
        {step === "otp" && (
          <>
            <div className="mb-8 text-center">
              <button
                onClick={() => { setStep("form"); setError(""); setOtp(["","","","","",""]) }}
                className="mb-5 flex items-center gap-1.5 text-sm font-medium text-white/50 transition hover:text-white mx-auto"
              >
                <ArrowLeft className="size-4" />
                {isAr ? "تغيير الرقم" : "Change number"}
              </button>
              <div className="mb-4 flex justify-center">
                <div className="flex size-16 items-center justify-center rounded-full bg-blue-400/20 ring-2 ring-blue-400/40">
                  <Phone className="size-8 text-blue-300" />
                </div>
              </div>
              <h1 className="text-3xl font-extrabold text-white">
                {isAr ? "أدخل رمز التحقق" : "Enter OTP"}
              </h1>
              <p className="mt-2 text-sm text-blue-200">
                {isAr
                  ? <span>أُرسل رمز مكوّن من 6 أرقام إلى <span className="font-bold text-white" dir="ltr">+965 {phoneDigits}</span></span>
                  : <span>We sent a 6-digit code to <span className="font-bold text-white">+965 {phoneDigits}</span></span>
                }
              </p>
            </div>

            <div className="rounded-3xl border border-white/10 bg-white/5 p-6 backdrop-blur space-y-5">

              {/* Dev mode helper */}
              {devCode && (
                <div className="flex items-center gap-3 rounded-2xl border border-amber-400/30 bg-amber-400/10 px-4 py-3">
                  <span className="text-xl">🔧</span>
                  <div>
                    <p className="text-xs font-semibold text-amber-300">Dev mode — OTP code:</p>
                    <p className="text-2xl font-extrabold tracking-widest text-yellow-400">{devCode}</p>
                  </div>
                </div>
              )}

              {/* 6-digit OTP boxes */}
              <div className={cn("flex gap-2 justify-center", isAr && "flex-row-reverse")}>
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
                    className={cn(
                      "size-12 rounded-2xl border-2 bg-white/10 text-center text-xl font-extrabold text-white outline-none transition",
                      digit ? "border-yellow-400 bg-yellow-400/10" : "border-white/20",
                      "focus:border-yellow-400 focus:bg-white/15"
                    )}
                  />
                ))}
              </div>

              {error && (
                <div className="flex items-center gap-2 rounded-2xl border border-red-400/30 bg-red-400/10 px-4 py-3 text-sm text-red-300">
                  <AlertCircle className="size-4 shrink-0" />
                  {error}
                </div>
              )}

              <button
                onClick={handleVerify}
                disabled={loading || otp.join("").length < 6}
                className={cn(
                  "flex w-full items-center justify-center gap-2 rounded-2xl py-4 text-base font-extrabold transition-all",
                  !loading && otp.join("").length >= 6
                    ? "bg-yellow-400 text-[#0a1628] shadow-lg shadow-yellow-400/30 hover:bg-yellow-300 active:scale-[0.98]"
                    : "cursor-not-allowed bg-white/10 text-white/40"
                )}
              >
                {loading
                  ? <Loader2 className="size-5 animate-spin" />
                  : <><CheckCircle className="size-5" /> {isAr ? "تحقق وإنشاء الحساب" : "Verify & Create Account"}</>
                }
              </button>

              {/* Resend */}
              <div className="text-center">
                {resendCountdown > 0 ? (
                  <p className="text-sm text-white/40">
                    {isAr ? `إعادة الإرسال بعد ${resendCountdown}ث` : `Resend in ${resendCountdown}s`}
                  </p>
                ) : (
                  <button
                    onClick={handleResend}
                    className="mx-auto flex items-center gap-1.5 text-sm font-semibold text-yellow-400 hover:text-yellow-300 transition"
                  >
                    <RefreshCw className="size-3.5" />
                    {isAr ? "إعادة إرسال الرمز" : "Resend code"}
                  </button>
                )}
              </div>
            </div>
          </>
        )}
      </main>

      {/* ── Footer — identical to BookingShell ── */}
      <div className="flex h-16 select-none items-center justify-center text-xl tracking-widest text-white/20 pointer-events-none">
        ✦ ✦ ✦ ✦ ✦
      </div>
    </div>
  )
}
