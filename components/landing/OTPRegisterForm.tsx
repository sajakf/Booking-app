"use client"

import { useState, useRef, useEffect } from "react"
import { useRouter } from "next/navigation"
import { t } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import { cn } from "@/lib/utils"
import { ArrowRight, ArrowLeft, RefreshCw, CheckCircle } from "lucide-react"

const KUWAIT_RE = /^[569]\d{7}$/

export default function OTPRegisterForm({ locale }: { locale: Locale }) {
  const router = useRouter()
  const isAr = locale === "ar"
  const ArrowNext = isAr ? ArrowLeft : ArrowRight

  // ── State ────────────────────────────────────────────────────────────────
  const [step, setStep] = useState<"phone" | "otp" | "done">("phone")
  const [phone, setPhone] = useState("")
  const [otp, setOtp] = useState(["", "", "", "", "", ""])
  const [devCode, setDevCode] = useState<string | null>(null)
  const [countdown, setCountdown] = useState(0)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState("")
  const otpRefs = useRef<(HTMLInputElement | null)[]>([])

  const digits = phone.replace(/\D/g, "").slice(0, 8)
  const isValid = KUWAIT_RE.test(digits)

  // countdown timer
  useEffect(() => {
    if (countdown <= 0) return
    const id = setTimeout(() => setCountdown((v) => v - 1), 1000)
    return () => clearTimeout(id)
  }, [countdown])

  // ── Handlers ─────────────────────────────────────────────────────────────
  const sendOTP = async () => {
    if (!isValid) {
      setError(t("hero.phone_hint", locale))
      return
    }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "send", phone: digits }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Failed to send code"); return }
      setDevCode(data.devCode ?? null)
      setStep("otp")
      setCountdown(60)
      setTimeout(() => otpRefs.current[0]?.focus(), 80)
    } catch {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const handleOtpChange = (i: number, val: string) => {
    const d = val.replace(/\D/g, "").slice(-1)
    const next = [...otp]; next[i] = d; setOtp(next)
    if (d && i < 5) otpRefs.current[i + 1]?.focus()
  }

  const handleOtpKey = (i: number, e: React.KeyboardEvent) => {
    if (e.key === "Backspace" && !otp[i] && i > 0) otpRefs.current[i - 1]?.focus()
    if (e.key === "Enter") verifyOTP()
  }

  const verifyOTP = async () => {
    const code = otp.join("")
    if (code.length < 6) { setError(isAr ? "أدخل الرمز المكون من 6 أرقام" : "Enter the 6-digit code"); return }
    setError("")
    setLoading(true)
    try {
      const res = await fetch("/api/auth/otp", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ action: "verify", phone: digits, code, name: "" }),
      })
      const data = await res.json()
      if (!res.ok) { setError(data.error ?? "Verification failed"); return }
      setStep("done")
      setTimeout(() => router.push(`/${locale}/book/child`), 1200)
    } catch {
      setError("Connection error. Please try again.")
    } finally {
      setLoading(false)
    }
  }

  const resend = () => {
    if (countdown > 0) return
    setOtp(["", "", "", "", "", ""])
    setDevCode(null)
    setStep("phone")
    setTimeout(sendOTP, 50)
  }

  // ── SUCCESS ───────────────────────────────────────────────────────────────
  if (step === "done") {
    return (
      <div className="flex flex-col items-center gap-3 py-6 text-center">
        <div className="flex size-16 items-center justify-center rounded-full bg-[#b3f82d]/10">
          <CheckCircle className="size-9 text-[#32246b]" />
        </div>
        <p className="text-lg font-bold text-[#32246b]">
          {isAr ? "تم التحقق! جاري التحويل..." : "Verified! Redirecting..."}
        </p>
      </div>
    )
  }

  // ── PHONE STEP ────────────────────────────────────────────────────────────
  if (step === "phone") {
    return (
      <div className="space-y-3">
        <p className="text-sm font-medium text-gray-600">
          {t("hero.register_sub", locale)}
        </p>

        {/* Phone input */}
        <div className={cn(
          "flex overflow-hidden rounded-2xl border-2 bg-white shadow-sm transition",
          "focus-within:border-[#5356df] focus-within:shadow-md border-[#5356df]/30"
        )}>
          <span className="flex items-center gap-2 border-e-2 border-[#5356df]/20 bg-[#f8f6ff] px-4 text-sm font-bold text-[#32246b] shrink-0">
            🇰🇼 +965
          </span>
          <input
            type="tel"
            inputMode="numeric"
            value={digits}
            onChange={(e) => setPhone(e.target.value.replace(/\D/g, "").slice(0, 8))}
            onKeyDown={(e) => e.key === "Enter" && sendOTP()}
            autoComplete="off"
            dir="ltr"
            placeholder="5X XXX XXXX"
            className="flex-1 bg-transparent px-4 py-4 text-base text-[#1f406b] outline-none placeholder:text-[#5356df]/30"
          />
        </div>

        <p className="text-xs text-gray-400">{t("hero.phone_hint", locale)}</p>

        {error && (
          <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">
            {error}
          </p>
        )}

        <button
          onClick={sendOTP}
          disabled={loading || !isValid}
          className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#32246b] py-4 text-base font-bold text-[#b3f82d] shadow-lg shadow-[#32246b]/20 transition hover:bg-[#5356df] hover:shadow-xl active:scale-[0.98] disabled:opacity-50"
        >
          {loading
            ? <span className="size-5 animate-spin rounded-full border-2 border-[#b3f82d] border-t-transparent" />
            : <>{t("hero.send_otp", locale)} <ArrowNext className="size-5" /></>}
        </button>
      </div>
    )
  }

  // ── OTP STEP ──────────────────────────────────────────────────────────────
  return (
    <div className="space-y-4">
      {/* Back + sent-to line */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => { setStep("phone"); setError(""); setOtp(["","","","","",""]) }}
          className="flex items-center gap-1 text-sm font-medium text-[#5356df]/60 hover:text-[#32246b]"
        >
          <ArrowLeft className="size-3.5" />
          {t("hero.change_number", locale)}
        </button>
        <p className="text-xs text-gray-500">
          {t("hero.otp_sent", locale).replace("{phone}", digits)}
        </p>
      </div>

      {/* Dev mode code */}
      {devCode && (
        <div className="flex items-center gap-2.5 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2.5">
          <span className="text-base">🔧</span>
          <div>
            <p className="text-[11px] font-semibold text-amber-700">Dev — your code:</p>
            <p className="text-xl font-black tracking-widest text-amber-900">{devCode}</p>
          </div>
        </div>
      )}

      {/* OTP boxes */}
      <div className={cn("flex justify-center gap-2", isAr && "flex-row-reverse")}>
        {otp.map((d, i) => (
          <input
            key={i}
            ref={(el) => { otpRefs.current[i] = el }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e) => handleOtpKey(i, e)}
            onFocus={(e) => e.target.select()}
            className={cn(
              "size-11 rounded-xl border-2 bg-white text-center text-lg font-bold text-[#32246b] outline-none shadow-sm transition sm:size-12",
              d ? "border-[#b3f82d] bg-[#b3f82d]/5" : "border-[#5356df]/30",
              "focus:border-[#5356df] focus:ring-2 focus:ring-[#5356df]/20"
            )}
          />
        ))}
      </div>

      {error && (
        <p className="rounded-xl bg-red-50 px-3 py-2 text-sm text-red-600 border border-red-100">
          {error}
        </p>
      )}

      <button
        onClick={verifyOTP}
        disabled={loading || otp.join("").length < 6}
        className="flex w-full items-center justify-center gap-2 rounded-2xl bg-[#32246b] py-4 text-base font-bold text-[#b3f82d] shadow-lg shadow-[#32246b]/20 transition hover:bg-[#5356df] active:scale-[0.98] disabled:opacity-50"
      >
        {loading
          ? <span className="size-5 animate-spin rounded-full border-2 border-[#b3f82d] border-t-transparent" />
          : <>{t("hero.verify_otp", locale)} <CheckCircle className="size-5" /></>}
      </button>

      {/* Resend */}
      <div className="text-center">
        {countdown > 0 ? (
          <p className="text-sm text-gray-400">
            {t("hero.resend_in", locale).replace("{n}", String(countdown))}
          </p>
        ) : (
          <button onClick={resend} className="inline-flex items-center gap-1.5 text-sm font-semibold text-[#5356df] hover:text-[#32246b] hover:underline">
            <RefreshCw className="size-3.5" />
            {t("hero.resend", locale)}
          </button>
        )}
      </div>
    </div>
  )
}
