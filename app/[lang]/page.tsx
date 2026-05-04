import Link from "next/link"
import Image from "next/image"
import { isValidLocale, t } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { weeks } from "@/lib/mock-data/classrooms"
import {
  MapPin, Calendar, FlaskConical, Microscope, Atom,
  Zap, Leaf, Calculator, Star, Users, Shield, Clock,
} from "lucide-react"
import OTPRegisterForm from "@/components/landing/OTPRegisterForm"

// ── Science Club logo ──────────────────────────────────────────────────────
function ScienceLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#0EA5E9" />
      {/* Flask body */}
      <path d="M18 10 h12 v2 l5 14 a8 8 0 1 1-22 0 l5-14 z" fill="none" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
      {/* Flask liquid */}
      <path d="M15.5 26 a8 8 0 1 1 17 0 z" fill="white" fillOpacity="0.7"/>
      {/* Bubbles */}
      <circle cx="21" cy="30" r="1.5" fill="white" />
      <circle cx="26" cy="28" r="1" fill="white" />
      <circle cx="24" cy="32" r="1" fill="white" />
    </svg>
  )
}

// ── Science subject tracks ─────────────────────────────────────────────────
const SUBJECTS_EN = [
  { icon: FlaskConical, color: "bg-blue-500",    label: "Chemistry Lab",     desc: "Safe, fun experiments with real reactions" },
  { icon: Microscope,   color: "bg-purple-500",  label: "Biology & Life",    desc: "Explore cells, plants, and living systems" },
  { icon: Atom,         color: "bg-cyan-500",    label: "Physics & Energy",  desc: "Forces, motion, light, and electricity" },
  { icon: Zap,          color: "bg-yellow-500",  label: "Electronics & AI",  desc: "Build circuits and discover AI basics" },
  { icon: Leaf,         color: "bg-green-500",   label: "Earth & Space",     desc: "Planets, weather, and our environment" },
  { icon: Calculator,   color: "bg-orange-500",  label: "Math Puzzles",      desc: "Logic games and problem-solving challenges" },
]
const SUBJECTS_AR = [
  { icon: FlaskConical, color: "bg-blue-500",    label: "مختبر الكيمياء",    desc: "تجارب آمنة وممتعة مع تفاعلات حقيقية" },
  { icon: Microscope,   color: "bg-purple-500",  label: "البيولوجيا والحياة", desc: "استكشف الخلايا والنباتات وأنظمة الحياة" },
  { icon: Atom,         color: "bg-cyan-500",    label: "الفيزياء والطاقة",  desc: "القوى والحركة والضوء والكهرباء" },
  { icon: Zap,          color: "bg-yellow-500",  label: "الإلكترونيات والذكاء الاصطناعي", desc: "ابنِ دوائر واكتشف أساسيات الذكاء الاصطناعي" },
  { icon: Leaf,         color: "bg-green-500",   label: "الأرض والفضاء",    desc: "الكواكب والطقس وبيئتنا" },
  { icon: Calculator,   color: "bg-orange-500",  label: "ألغاز الرياضيات",  desc: "ألعاب منطقية وتحديات حل المشكلات" },
]

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const isAr = locale === "ar"

  const subjects = isAr ? SUBJECTS_AR : SUBJECTS_EN

  const features = [
    { icon: FlaskConical, key: "feature1" },
    { icon: Users,        key: "feature2" },
    { icon: Shield,       key: "feature3" },
    { icon: Clock,        key: "feature4" },
  ] as const

  return (
    <div className="min-h-screen bg-white antialiased" dir={isAr ? "rtl" : "ltr"}>

      {/* ── TOPBAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-gray-100 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo + name */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <ScienceLogo className="size-9 shrink-0" />
            <div className="hidden sm:block">
              <p className="text-xs font-bold leading-none text-blue-600 uppercase tracking-wide">
                {isAr ? "نادي العلوم الصيفي" : "Summer Science Club"}
              </p>
              <p className="text-[10px] text-gray-400 leading-none mt-0.5">2026</p>
            </div>
          </Link>

          {/* Language toggle — top right */}
          <LanguageToggle />
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-blue-950 to-cyan-900 text-white">
        {/* Background science photo */}
        <Image
          src="https://images.unsplash.com/photo-1532094349884-543559373ef0?w=1600&q=70"
          alt=""
          fill
          className="object-cover opacity-10"
          priority
          sizes="100vw"
        />

        {/* Decorative floating atoms */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-16 -left-16 size-80 rounded-full bg-cyan-500/10 blur-3xl" />
          <div className="absolute top-1/3 -right-20 size-96 rounded-full bg-blue-500/10 blur-3xl" />
          <div className="absolute -bottom-20 left-1/4 size-72 rounded-full bg-cyan-400/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* ── Left: Headline ── */}
            <div>
              {/* Badge */}
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-cyan-500/30 bg-cyan-500/10 px-4 py-1.5 text-sm font-medium text-cyan-300 backdrop-blur-sm">
                <Calendar className="size-4" />
                {t("hero.dates", locale)}
              </div>

              <h1 className="mb-4 text-4xl font-black leading-tight tracking-tight sm:text-5xl lg:text-6xl">
                {isAr ? (
                  <>
                    نادي العلوم<br />
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">الصيفي 2026</span>
                  </>
                ) : (
                  <>
                    Summer Science<br />
                    <span className="bg-gradient-to-r from-cyan-400 to-blue-400 bg-clip-text text-transparent">Club 2026</span>
                  </>
                )}
              </h1>

              <p className="mb-6 text-lg text-blue-200 leading-relaxed">
                {t("hero.tagline", locale)}
              </p>

              {/* Meta pills */}
              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/80">
                  <MapPin className="size-3.5 text-cyan-400" />
                  {t("hero.location", locale)}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/80">
                  <Users className="size-3.5 text-cyan-400" />
                  {t("hero.ages_range", locale)}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/80">
                  <Calendar className="size-3.5 text-cyan-400" />
                  {isAr ? weeks[0]?.labelAr : weeks[0]?.label}
                </span>
              </div>

              {/* Stats row */}
              <div className="mt-8 grid grid-cols-4 gap-4 border-t border-white/10 pt-8">
                {[
                  { value: "300+", label: t("hero.stats.kids", locale) },
                  { value: "50+",  label: t("hero.stats.activities", locale) },
                  { value: "12",   label: t("hero.stats.instructors", locale) },
                  { value: "4.9★", label: t("hero.stats.rating", locale) },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="text-2xl font-black text-cyan-400">{value}</p>
                    <p className="mt-0.5 text-xs text-blue-300 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Registration Card ── */}
            <div className="lg:flex lg:justify-end">
              <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white/95 p-7 shadow-2xl shadow-black/40 backdrop-blur-xl">
                {/* Card header */}
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-gradient-to-br from-blue-600 to-cyan-500 shadow-lg">
                    <FlaskConical className="size-5 text-white" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-gray-900">
                      {t("hero.register_heading", locale)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isAr ? "نادي العلوم الصيفي 2026" : "Summer Science Club 2026"}
                    </p>
                  </div>
                </div>

                {/* OTP form */}
                <OTPRegisterForm locale={locale} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── WHY CHOOSE US ───────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
          {features.map(({ icon: Icon, key }) => (
            <div key={key} className="rounded-2xl border border-gray-100 bg-white p-5 shadow-sm hover:shadow-md transition">
              <div className="mb-3 inline-flex size-11 items-center justify-center rounded-xl bg-blue-50">
                <Icon className="size-5 text-blue-600" />
              </div>
              <h3 className="mb-1 text-sm font-bold text-gray-900">
                {t(`hero.${key}_title` as never, locale)}
              </h3>
              <p className="text-xs text-gray-500 leading-relaxed">
                {t(`hero.${key}_desc` as never, locale)}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* ── SCIENCE SUBJECTS ────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-slate-50 to-blue-50 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-2 text-3xl font-black text-gray-900 sm:text-4xl">
              {t("hero.subjects_title", locale)}
            </h2>
            <p className="text-gray-500">{t("hero.subjects_sub", locale)}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => {
              const Icon = s.icon
              return (
                <div key={s.label} className="flex items-start gap-4 rounded-2xl border border-white bg-white p-5 shadow-sm transition hover:-translate-y-0.5 hover:shadow-md">
                  <div className={`flex size-12 shrink-0 items-center justify-center rounded-xl ${s.color} shadow-sm`}>
                    <Icon className="size-6 text-white" />
                  </div>
                  <div>
                    <p className="font-bold text-gray-900">{s.label}</p>
                    <p className="mt-0.5 text-sm text-gray-500 leading-snug">{s.desc}</p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── CLASSROOM PHOTOS ────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <h2 className="mb-2 text-3xl font-black text-gray-900 sm:text-4xl">
            {isAr ? "داخل المختبرات" : "Inside Our Labs"}
          </h2>
          <p className="text-gray-500">
            {isAr ? "مساحات مجهزة بالكامل لتجارب العلوم الحقيقية" : "Fully equipped spaces for real science experiments"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            { src: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80", label: isAr ? "مختبر الكيمياء" : "Chemistry Lab" },
            { src: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80", label: isAr ? "مختبر الأحياء" : "Biology Lab" },
            { src: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600&q=80", label: isAr ? "مختبر الإلكترونيات" : "Electronics Lab" },
          ].map(({ src, label }) => (
            <div key={label} className="group relative overflow-hidden rounded-2xl shadow-md">
              <div className="relative h-52">
                <Image
                  src={src}
                  alt={label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                <p className="absolute bottom-3 start-4 text-sm font-bold text-white">{label}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── FINAL CTA ────────────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-slate-900 via-blue-950 to-cyan-900 py-20 text-white">
        <div className="mx-auto max-w-xl px-4 text-center">
          <ScienceLogo className="mx-auto mb-6 size-16" />
          <h2 className="mb-3 text-3xl font-black sm:text-4xl">
            {isAr ? "احجز مقعد طفلك الآن" : "Secure Your Child's Spot"}
          </h2>
          <p className="mb-8 text-blue-200">
            {t("hero.cta_sub", locale)}
          </p>
          <Link
            href={`/${locale}/signup`}
            className="inline-flex items-center gap-2 rounded-2xl bg-gradient-to-r from-cyan-500 to-blue-500 px-10 py-4 text-lg font-bold text-white shadow-xl shadow-cyan-500/30 transition hover:opacity-90 hover:scale-105"
          >
            {t("hero.cta", locale)}
          </Link>
        </div>
      </section>

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-gray-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <ScienceLogo className="size-6" />
            <span className="font-semibold text-gray-700">
              {isAr ? "نادي العلوم الصيفي 2026" : "Summer Science Club 2026"}
            </span>
          </div>
          <span className="flex items-center gap-1">
            <MapPin className="size-3.5" />
            {t("hero.footer.location", locale)}
          </span>
          <span>© 2026 · {t("hero.footer.rights", locale)}</span>
        </div>
      </footer>
    </div>
  )
}
