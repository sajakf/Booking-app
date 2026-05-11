"use client"

import { useState, use } from "react"
import Link from "next/link"
import Image from "next/image"
import { isValidLocale, t } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { weeks } from "@/lib/mock-data/classrooms"
import {
  MapPin, Calendar, FlaskConical, Microscope, Atom,
  Zap, Leaf, Calculator, Users, Shield, Clock, ChevronDown, X,
} from "lucide-react"
import OTPRegisterForm from "@/components/landing/OTPRegisterForm"
import { useClickSound } from "@/components/ui/ClickSound"
import {
  ScatterElements, ScientistBoy, ScientistGirl,
  FlaskAvatar, RobotAvatar, AtomAvatar, RocketAvatar, MathAvatar, MicroscopeAvatar,
} from "@/components/ui/ScienceAvatars"
import { cn } from "@/lib/utils"

// ── Science Club logo ──────────────────────────────────────────────────────────
function ScienceLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#32246b" />
      <path d="M18 10 h12 v2 l5 14 a8 8 0 1 1-22 0 l5-14 z" fill="none" stroke="#b3f82d" strokeWidth="1.5" strokeLinejoin="round"/>
      <path d="M15.5 26 a8 8 0 1 1 17 0 z" fill="#b3f82d" fillOpacity="0.8"/>
      <circle cx="21" cy="30" r="1.5" fill="white" />
      <circle cx="26" cy="28" r="1" fill="white" />
      <circle cx="24" cy="32" r="1" fill="white" />
    </svg>
  )
}

// ── Science subject tracks ─────────────────────────────────────────────────────
const SUBJECTS_EN = [
  { icon: FlaskConical, label: "Chemistry Lab",            desc: "Safe, fun experiments with real reactions",  avatar: FlaskAvatar,      facts: ["Water can boil and freeze at the same time!", "Gold is so soft you can mold it with your hands."],  todos: ["Mix safe acid-base reactions", "Create slime polymers", "Grow crystal gardens"] },
  { icon: Microscope,   label: "Biology & Life",           desc: "Explore cells, plants, and living systems",  avatar: MicroscopeAvatar, facts: ["Your body has more bacteria than human cells!", "A single teaspoon of soil has more organisms than Earth's population."], todos: ["Observe cells under microscopes", "Dissect flowers", "Study DNA models"] },
  { icon: Atom,         label: "Physics & Energy",         desc: "Forces, motion, light, and electricity",     avatar: AtomAvatar,       facts: ["Light takes 8 minutes to travel from the Sun to Earth.", "Sound can travel 4x faster through water than air."], todos: ["Build electric circuits", "Explore magnets", "Measure reaction speed"] },
  { icon: Zap,          label: "Electronics & AI",         desc: "Build circuits and discover AI basics",       avatar: RobotAvatar,      facts: ["The first computer weighed 30 tons!", "Your brain processes 11 million bits per second."], todos: ["Program micro:bits", "Wire LED circuits", "Train a simple AI model"] },
  { icon: Leaf,         label: "Earth & Space",            desc: "Planets, weather, and our environment",      avatar: RocketAvatar,     facts: ["A day on Venus is longer than a year on Venus!", "Lightning strikes Earth 100 times per second."], todos: ["Build weather stations", "Model solar system", "Track star patterns"] },
  { icon: Calculator,   label: "Math Puzzles",             desc: "Logic games and problem-solving challenges", avatar: MathAvatar,       facts: ["Pi has been calculated to over 100 trillion digits!", "A googol is 1 followed by 100 zeros."], todos: ["Solve escape-room puzzles", "Explore number patterns", "Design geometric art"] },
]
const SUBJECTS_AR = [
  { icon: FlaskConical, label: "مختبر الكيمياء",           desc: "تجارب آمنة وممتعة مع تفاعلات حقيقية",        avatar: FlaskAvatar,      facts: ["يمكن للماء أن يغلي ويتجمد في نفس الوقت!", "الذهب ليّن جداً لدرجة يمكن عجنه باليدين."], todos: ["خلط تفاعلات الحمض والقاعدة الآمنة", "صنع مادة السليم", "زراعة حدائق الكريستال"] },
  { icon: Microscope,   label: "البيولوجيا والحياة",        desc: "استكشف الخلايا والنباتات وأنظمة الحياة",     avatar: MicroscopeAvatar, facts: ["جسمك يحتوي على بكتيريا أكثر من الخلايا البشرية!", "ملعقة صغيرة من التربة تحتوي على كائنات أكثر من عدد سكان الأرض."], todos: ["مراقبة الخلايا تحت المجهر", "تشريح الزهور", "دراسة نماذج الحمض النووي"] },
  { icon: Atom,         label: "الفيزياء والطاقة",          desc: "القوى والحركة والضوء والكهرباء",             avatar: AtomAvatar,       facts: ["يستغرق الضوء 8 دقائق للانتقال من الشمس إلى الأرض!", "الصوت يسافر 4 مرات أسرع في الماء."], todos: ["بناء دوائر كهربائية", "استكشاف المغناطيس", "قياس سرعة الردود"] },
  { icon: Zap,          label: "الإلكترونيات والذكاء الاصطناعي", desc: "ابنِ دوائر واكتشف أساسيات الذكاء الاصطناعي", avatar: RobotAvatar,  facts: ["وزن أول حاسوب 30 طناً!", "دماغك يعالج 11 مليون بت في الثانية."], todos: ["برمجة مايكروبت", "توصيل دوائر LED", "تدريب نموذج ذكاء اصطناعي"] },
  { icon: Leaf,         label: "الأرض والفضاء",             desc: "الكواكب والطقس وبيئتنا",                    avatar: RocketAvatar,     facts: ["يوم على كوكب الزهرة أطول من سنة على الزهرة!", "البرق يضرب الأرض 100 مرة في الثانية."], todos: ["بناء محطات طقس", "نمذجة المجموعة الشمسية", "تتبع أنماط النجوم"] },
  { icon: Calculator,   label: "ألغاز الرياضيات",           desc: "ألعاب منطقية وتحديات حل المشكلات",          avatar: MathAvatar,       facts: ["تم حساب Pi لأكثر من 100 تريليون رقم!", "الغوغول هو 1 يتبعه 100 صفر."], todos: ["حل ألغاز غرفة الهروب", "استكشاف أنماط الأعداد", "تصميم فن هندسي"] },
]

// ── Feature cards data ─────────────────────────────────────────────────────────
const FEATURES_EN = [
  { key: "feature1", icon: FlaskConical, avatar: FlaskAvatar,    title: "Hands-On Science",      desc: "Every session is 80% doing, 20% listening. Real experiments, real discoveries.",    facts: ["50+ unique experiments across all subjects", "Every kid gets their own lab kit", "Take-home project each week"] },
  { key: "feature2", icon: Users,        avatar: ScientistBoy,   title: "Expert Instructors",    desc: "Our team holds advanced science degrees and loves working with young minds.",         facts: ["12 certified science educators", "Average 8 years teaching experience", "Bilingual Arabic & English"] },
  { key: "feature3", icon: Shield,       avatar: ScientistGirl,  title: "Small Groups",          desc: "Maximum 8 kids per instructor so every child gets personal attention.",              facts: ["Max 8 students per class", "Individual progress tracking", "Flexible learning pace"] },
  { key: "feature4", icon: Clock,        avatar: RobotAvatar,    title: "Safe Environment",      desc: "Safety is our #1 priority — certified facilities, proper PPE, trained staff.",      facts: ["Certified safety protocols", "First aid trained staff on-site", "Full PPE provided for each session"] },
]
const FEATURES_AR = [
  { key: "feature1", icon: FlaskConical, avatar: FlaskAvatar,    title: "علوم تطبيقية",          desc: "كل جلسة 80% تطبيق و20% استماع. تجارب حقيقية، اكتشافات حقيقية.",                    facts: ["50+ تجربة فريدة عبر جميع المواضيع", "كل طفل يحصل على مجموعة مختبره الخاصة", "مشروع للمنزل كل أسبوع"] },
  { key: "feature2", icon: Users,        avatar: ScientistBoy,   title: "مدربون متخصصون",        desc: "فريقنا يحمل درجات علمية متقدمة ويحب العمل مع العقول الشابة.",                        facts: ["12 معلم علوم معتمد", "متوسط 8 سنوات خبرة تدريس", "ثنائي اللغة عربي وإنجليزي"] },
  { key: "feature3", icon: Shield,       avatar: ScientistGirl,  title: "مجموعات صغيرة",         desc: "حد أقصى 8 أطفال لكل مدرب حتى يحصل كل طفل على اهتمام شخصي.",                        facts: ["حد أقصى 8 طلاب في الفصل", "متابعة تقدم فردي", "وتيرة تعلم مرنة"] },
  { key: "feature4", icon: Clock,        avatar: RobotAvatar,    title: "بيئة آمنة",             desc: "السلامة أولويتنا #1 — منشآت معتمدة، معدات حماية مناسبة، طاقم مدرب.",                facts: ["بروتوكولات سلامة معتمدة", "طاقم مدرب على الإسعافات الأولية في الموقع", "معدات الحماية الشخصية متوفرة لكل جلسة"] },
]

// ── Lab photos ────────────────────────────────────────────────────────────────
const LABS_EN = [
  { src: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80", label: "Chemistry Lab",    bullets: ["State-of-the-art safety equipment for all ages", "Hands-on experiments with supervised reactions", "Personal lab kits for every student"] },
  { src: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80", label: "Biology Lab",      bullets: ["Professional microscopes available for each student", "Live plant and specimen observation", "Full dissection tools with safety guidance"] },
  { src: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600&q=80", label: "Electronics Lab",  bullets: ["Arduino and micro:bit workstations", "Breadboards and component kits for each student", "AI and robotics introduction modules"] },
]
const LABS_AR = [
  { src: "https://images.unsplash.com/photo-1532187863486-abf9dbad1b69?w=600&q=80", label: "مختبر الكيمياء",   bullets: ["معدات سلامة متطورة لجميع الأعمار", "تجارب عملية مع تفاعلات تحت إشراف", "مجموعات مختبر شخصية لكل طالب"] },
  { src: "https://images.unsplash.com/photo-1576086213369-97a306d36557?w=600&q=80", label: "مختبر الأحياء",    bullets: ["مجاهر احترافية متاحة لكل طالب", "مراقبة نباتات وعينات حية", "أدوات تشريح كاملة مع توجيه السلامة"] },
  { src: "https://images.unsplash.com/photo-1628595351029-c2bf17511435?w=600&q=80", label: "مختبر الإلكترونيات", bullets: ["محطات Arduino و micro:bit", "لوحات breadboard ومجموعات مكونات لكل طالب", "وحدات مقدمة للذكاء الاصطناعي والروبوتات"] },
]

// ── Page component ─────────────────────────────────────────────────────────────
export default function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = use(params)
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const isAr = locale === "ar"
  const playSound = useClickSound()

  const subjects = isAr ? SUBJECTS_AR : SUBJECTS_EN
  const features = isAr ? FEATURES_AR : FEATURES_EN
  const labs = isAr ? LABS_AR : LABS_EN

  const [openFeature, setOpenFeature] = useState<string | null>(null)
  const [openSubject, setOpenSubject] = useState<string | null>(null)
  const [expandedLab, setExpandedLab] = useState<string | null>(null)

  const handleFeatureToggle = (key: string) => {
    playSound()
    setOpenFeature((prev) => (prev === key ? null : key))
  }

  const handleSubjectToggle = (label: string) => {
    playSound()
    setOpenSubject((prev) => (prev === label ? null : label))
  }

  const handleLabToggle = (label: string) => {
    playSound()
    setExpandedLab((prev) => (prev === label ? null : label))
  }

  return (
    <div className="min-h-screen bg-white antialiased" dir={isAr ? "rtl" : "ltr"}>

      {/* ── TOPBAR ──────────────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-40 border-b border-[#32246b]/10 bg-[#32246b]/98 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          <Link href={`/${locale}`} className="flex items-center gap-2.5" onClick={playSound}>
            <ScienceLogo className="size-9 shrink-0" />
            <div className="hidden sm:block">
              <p className="font-display text-sm leading-none text-[#b3f82d] uppercase tracking-widest">
                {isAr ? "نادي العلوم الصيفي" : "Summer Science Club"}
              </p>
              <p className="text-[10px] text-white/50 leading-none mt-0.5">2026</p>
            </div>
          </Link>
          <LanguageToggle />
        </div>
      </header>

      {/* ── HERO ─────────────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-[#32246b] text-white">
        {/* Background photo */}
        <Image
          src="https://images.unsplash.com/photo-1532094349884-543559373ef0?w=1600&q=70"
          alt=""
          fill
          className="object-cover opacity-5"
          priority
          sizes="100vw"
        />

        {/* Scattered science SVG decorations */}
        <ScatterElements />

        {/* Soft glow blobs */}
        <div className="pointer-events-none absolute inset-0 overflow-hidden">
          <div className="absolute -top-20 -left-20 size-96 rounded-full bg-[#5356df]/15 blur-3xl" />
          <div className="absolute top-1/3 -right-24 size-[500px] rounded-full bg-[#b3f82d]/8 blur-3xl" />
          <div className="absolute -bottom-24 left-1/4 size-80 rounded-full bg-[#f51553]/10 blur-3xl" />
        </div>

        <div className="relative mx-auto max-w-6xl px-4 py-16 md:py-24">
          <div className="grid items-center gap-12 lg:grid-cols-2">

            {/* ── Left: Headline ── */}
            <div>
              <div className="mb-5 inline-flex items-center gap-2 rounded-full border border-[#b3f82d]/30 bg-[#b3f82d]/10 px-4 py-1.5 text-sm font-medium text-[#b3f82d] backdrop-blur-sm">
                <Calendar className="size-4" />
                {t("hero.dates", locale)}
              </div>

              <h1 className="font-display mb-4 text-5xl leading-none sm:text-6xl lg:text-7xl text-white">
                {isAr ? (
                  <>
                    نادي العلوم<br />
                    <span className="text-[#b3f82d]">الصيفي 2026</span>
                  </>
                ) : (
                  <>
                    Summer Science<br />
                    <span className="text-[#b3f82d]">Club 2026</span>
                  </>
                )}
              </h1>

              <p className="mb-6 text-lg text-white/70 leading-relaxed">
                {t("hero.tagline", locale)}
              </p>

              <div className="flex flex-wrap gap-3 text-sm">
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/80 border border-white/10">
                  <MapPin className="size-3.5 text-[#b3f82d]" />
                  {t("hero.location", locale)}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/80 border border-white/10">
                  <Users className="size-3.5 text-[#f51553]" />
                  {t("hero.ages_range", locale)}
                </span>
                <span className="flex items-center gap-1.5 rounded-full bg-white/10 px-3 py-1.5 text-white/80 border border-white/10">
                  <Calendar className="size-3.5 text-[#b3f82d]" />
                  {isAr ? weeks[0]?.labelAr : weeks[0]?.label}
                </span>
              </div>

              <div className="mt-8 grid grid-cols-4 gap-4 border-t border-white/10 pt-8">
                {[
                  { value: "300+", label: t("hero.stats.kids", locale) },
                  { value: "50+",  label: t("hero.stats.activities", locale) },
                  { value: "12",   label: t("hero.stats.instructors", locale) },
                  { value: "4.9★", label: t("hero.stats.rating", locale) },
                ].map(({ value, label }) => (
                  <div key={label} className="text-center">
                    <p className="font-display text-3xl text-[#b3f82d]">{value}</p>
                    <p className="mt-0.5 text-xs text-white/50 leading-tight">{label}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* ── Right: Registration Card ── */}
            <div className="lg:flex lg:justify-end">
              <div className="w-full max-w-sm rounded-3xl border border-white/10 bg-white p-7 shadow-2xl shadow-black/40">
                <div className="mb-5 flex items-center gap-3">
                  <div className="flex size-11 items-center justify-center rounded-2xl bg-[#32246b] shadow-lg">
                    <FlaskConical className="size-5 text-[#b3f82d]" />
                  </div>
                  <div>
                    <p className="text-sm font-black text-[#32246b]">
                      {t("hero.register_heading", locale)}
                    </p>
                    <p className="text-xs text-gray-400">
                      {isAr ? "نادي العلوم الصيفي 2026" : "Summer Science Club 2026"}
                    </p>
                  </div>
                </div>
                <OTPRegisterForm locale={locale} />
              </div>
            </div>

          </div>
        </div>
      </section>

      {/* ── CAMP VIDEO PREVIEW ───────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 pt-14 pb-2">
        <div className="overflow-hidden rounded-3xl shadow-xl border border-[#5356df]/15 relative">
          <video
            src="/videos/science-day.mp4"
            autoPlay
            muted
            loop
            playsInline
            className="w-full object-cover max-h-72"
          />
          <div className="pointer-events-none absolute inset-0 rounded-3xl ring-1 ring-inset ring-white/10" />
          <div className="absolute bottom-0 inset-x-0 flex items-end justify-between px-5 py-4 bg-gradient-to-t from-[#32246b]/70 to-transparent">
            <p className="font-display text-xl text-white leading-none">
              {isAr ? "نادي العلوم الصيفي 2026" : "Summer Science Club 2026"}
            </p>
            <span className="rounded-full bg-[#b3f82d] px-3 py-1 text-xs font-bold text-[#32246b]">
              {isAr ? "مجموعات صغيرة" : "Small Groups"}
            </span>
          </div>
        </div>
      </section>

      {/* ── FEATURES (expandable accordion) ──────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="mb-10 text-center">
          <h2 className="font-display mb-2 text-4xl text-[#32246b] sm:text-5xl">
            {isAr ? "لماذا تختارنا؟" : "Why Choose Us?"}
          </h2>
          <p className="text-gray-500">{isAr ? "برنامج علمي يجمع بين المتعة والتعلم الحقيقي" : "Science that's actually fun — for real teens"}</p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2">
          {features.map((f) => {
            const Icon = f.icon
            const AvatarComp = f.avatar
            const isOpen = openFeature === f.key
            return (
              <div
                key={f.key}
                className={cn(
                  "rounded-2xl border bg-white shadow-sm transition-all duration-200",
                  isOpen ? "border-[#5356df] shadow-[#5356df]/10 shadow-lg" : "border-gray-100 hover:border-[#5356df]/30"
                )}
              >
                <button
                  onClick={() => handleFeatureToggle(f.key)}
                  className="flex w-full items-center gap-4 p-5 text-start"
                >
                  <div className={cn(
                    "flex size-12 shrink-0 items-center justify-center rounded-xl transition",
                    isOpen ? "bg-[#32246b]" : "bg-[#f8f6ff]"
                  )}>
                    <Icon className={cn("size-5", isOpen ? "text-[#b3f82d]" : "text-[#5356df]")} />
                  </div>
                  <div className="flex-1 text-start">
                    <p className="font-bold text-[#32246b]">{f.title}</p>
                    <p className="text-xs text-gray-500 leading-relaxed">{f.desc}</p>
                  </div>
                  <ChevronDown className={cn("size-5 text-[#5356df] shrink-0 transition-transform", isOpen && "rotate-180")} />
                </button>
                <div className={cn(
                  "overflow-hidden transition-all duration-300",
                  isOpen ? "max-h-80" : "max-h-0"
                )}>
                  <div className="flex gap-4 border-t border-gray-100 p-5">
                    <div className="shrink-0">
                      <AvatarComp className="size-20" />
                    </div>
                    <ul className="space-y-2">
                      {f.facts.map((fact) => (
                        <li key={fact} className="flex items-start gap-2 text-sm text-gray-700">
                          <span className="mt-0.5 text-[#b3f82d] font-bold">✦</span>
                          {fact}
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </section>

      {/* ── SECURE SPOT CTA ───────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-[#32246b] via-[#5356df] to-[#1f406b] py-20 text-white">
        <div className="mx-auto max-w-xl px-4 text-center">
          <ScienceLogo className="mx-auto mb-6 size-16" />
          <h2 className="font-display mb-3 text-4xl sm:text-5xl">
            {isAr ? "احجز مقعد طفلك الآن" : "Secure Your Child's Spot"}
          </h2>
          <p className="mb-8 text-white/70">
            {t("hero.cta_sub", locale)}
          </p>
          <Link
            href={`/${locale}/signup`}
            onClick={playSound}
            className="inline-flex items-center gap-2 rounded-2xl bg-[#b3f82d] px-10 py-4 text-lg font-bold text-[#32246b] shadow-xl shadow-[#b3f82d]/30 transition hover:opacity-90 hover:scale-105"
          >
            {t("hero.cta", locale)}
          </Link>
        </div>
      </section>

      {/* ── SCIENCE SUBJECTS (expandable) ────────────────────────────────────── */}
      <section className="bg-[#f8f6ff] py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mb-12 text-center">
            <h2 className="font-display mb-2 text-4xl text-[#32246b] sm:text-5xl">
              {t("hero.subjects_title", locale)}
            </h2>
            <p className="text-gray-500">{t("hero.subjects_sub", locale)}</p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {subjects.map((s) => {
              const Icon = s.icon
              const AvatarComp = s.avatar
              const isOpen = openSubject === s.label
              return (
                <div
                  key={s.label}
                  className={cn(
                    "rounded-2xl border bg-white shadow-sm transition-all duration-200",
                    isOpen ? "border-[#32246b] shadow-[#32246b]/10 shadow-lg" : "border-white hover:border-[#5356df]/30 hover:shadow-md"
                  )}
                >
                  <button
                    onClick={() => handleSubjectToggle(s.label)}
                    className="flex w-full items-start gap-4 p-5 text-start"
                  >
                    <div className={cn(
                      "flex size-12 shrink-0 items-center justify-center rounded-xl shadow-sm transition",
                      isOpen ? "bg-[#32246b]" : "bg-[#5356df]"
                    )}>
                      <Icon className="size-6 text-white" />
                    </div>
                    <div className="flex-1 text-start">
                      <p className="font-bold text-[#32246b]">{s.label}</p>
                      <p className="mt-0.5 text-sm text-gray-500 leading-snug">{s.desc}</p>
                    </div>
                    <ChevronDown className={cn("size-4 text-[#5356df] shrink-0 mt-1 transition-transform", isOpen && "rotate-180")} />
                  </button>
                  <div className={cn(
                    "overflow-hidden transition-all duration-300",
                    isOpen ? "max-h-96" : "max-h-0"
                  )}>
                    <div className="border-t border-gray-100 p-5 space-y-3">
                      <div className="flex justify-center">
                        <AvatarComp className="size-20" />
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#5356df] uppercase tracking-wide mb-1">{isAr ? "حقائق مثيرة" : "Fun Facts"}</p>
                        {s.facts.map((fact) => (
                          <p key={fact} className="text-xs text-gray-600 flex gap-1.5 mb-1">
                            <span className="text-[#f51553] font-bold shrink-0">★</span>
                            {fact}
                          </p>
                        ))}
                      </div>
                      <div>
                        <p className="text-xs font-bold text-[#32246b] uppercase tracking-wide mb-1">{isAr ? "ماذا ستفعل" : "What You'll Do"}</p>
                        <ul className="space-y-1">
                          {s.todos.map((todo) => (
                            <li key={todo} className="text-xs text-gray-700 flex gap-1.5">
                              <span className="text-[#b3f82d] font-bold shrink-0">→</span>
                              {todo}
                            </li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ── LAB PHOTOS ───────────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-10 text-center">
          <h2 className="font-display mb-2 text-4xl text-[#32246b] sm:text-5xl">
            {isAr ? "داخل المختبرات" : "Inside Our Labs"}
          </h2>
          <p className="text-gray-500">
            {isAr ? "مساحات مجهزة بالكامل لتجارب العلوم الحقيقية" : "Fully equipped spaces for real science experiments"}
          </p>
        </div>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {labs.map(({ src, label, bullets }) => (
            <div
              key={label}
              className="group relative cursor-pointer overflow-hidden rounded-2xl shadow-md transition hover:shadow-xl"
              onClick={() => handleLabToggle(label)}
            >
              <div className="relative h-52">
                <Image
                  src={src}
                  alt={label}
                  fill
                  className="object-cover transition-transform duration-500 group-hover:scale-105"
                  sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-[#32246b]/80 to-transparent" />
                <p className="absolute bottom-3 start-4 text-sm font-bold text-white">{label}</p>
                <div className="absolute top-3 end-3 flex size-7 items-center justify-center rounded-full bg-[#b3f82d] text-[#32246b] font-bold text-xs">
                  +
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── LAB MODAL ─────────────────────────────────────────────────────────── */}
      {expandedLab && (() => {
        const lab = labs.find((l) => l.label === expandedLab)
        if (!lab) return null
        return (
          <div
            className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 p-4 backdrop-blur-sm"
            onClick={() => setExpandedLab(null)}
          >
            <div
              className="relative w-full max-w-lg overflow-hidden rounded-3xl bg-white shadow-2xl"
              onClick={(e) => e.stopPropagation()}
            >
              <div className="relative h-56">
                <Image src={lab.src} alt={lab.label} fill className="object-cover" sizes="500px" />
                <div className="absolute inset-0 bg-gradient-to-t from-[#32246b]/70 to-transparent" />
                <p className="font-display absolute bottom-4 start-6 text-2xl text-white">{lab.label}</p>
              </div>
              <button
                onClick={() => setExpandedLab(null)}
                className="absolute top-4 end-4 flex size-8 items-center justify-center rounded-full bg-black/50 text-white hover:bg-black/70 transition"
              >
                <X className="size-4" />
              </button>
              <div className="p-6">
                <ul className="space-y-3">
                  {lab.bullets.map((b) => (
                    <li key={b} className="flex items-start gap-3 text-sm text-gray-700">
                      <span className="mt-0.5 flex size-5 shrink-0 items-center justify-center rounded-full bg-[#b3f82d] text-[#32246b] font-bold text-xs">✓</span>
                      {b}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        )
      })()}

      {/* ── FOOTER ──────────────────────────────────────────────────────────── */}
      <footer className="border-t border-[#32246b]/10 bg-[#32246b]">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-3 px-4 py-6 text-sm text-white/60 sm:flex-row">
          <div className="flex items-center gap-2">
            <ScienceLogo className="size-6" />
            <span className="font-semibold text-white/80">
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
