import Link from "next/link"
import Image from "next/image"
import { isValidLocale, t } from "@/lib/i18n"
import type { Locale } from "@/types/i18n"
import { LanguageToggle } from "@/components/layout/LanguageToggle"
import { classrooms, weeks } from "@/lib/mock-data/classrooms"
import { ChevronRight, ChevronLeft, MapPin, Calendar, Star, Shield, Clock, Users } from "lucide-react"
import VideoSection from "@/components/landing/VideoSection"

// ── Creative camp logo ──────────────────────────────────────────────────────
function CampLogo({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 48 48" fill="none" className={className} aria-hidden>
      <circle cx="24" cy="24" r="22" fill="#1D4ED8" />
      <path d="M24 8 L27.5 18H38L29.5 24.5L33 35L24 28.5L15 35L18.5 24.5L10 18H20.5L24 8Z"
        fill="#FCD34D" />
      <circle cx="24" cy="24" r="6" fill="#1D4ED8" />
      <circle cx="24" cy="24" r="3" fill="#FCD34D" />
    </svg>
  )
}

// ── Activity meta per classroom ─────────────────────────────────────────────
const ACTIVITY_PHOTOS: Record<string, { photo: string; gradient: string }> = {
  "room-robots-boys": {
    photo: "https://images.unsplash.com/photo-1588196749597-9ff075ee6b5b?w=600&q=80",
    gradient: "from-blue-600/80 to-indigo-700/80",
  },
  "room-arts-girls": {
    photo: "https://images.unsplash.com/photo-1596464716127-f2a82984de30?w=600&q=80",
    gradient: "from-pink-500/80 to-rose-600/80",
  },
  "room-lang-girls": {
    photo: "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?w=600&q=80",
    gradient: "from-emerald-500/80 to-teal-600/80",
  },
  "room-sports-boys": {
    photo: "https://images.unsplash.com/photo-1571019614242-c5c5dee9f50b?w=600&q=80",
    gradient: "from-orange-500/80 to-amber-600/80",
  },
}
function activityPhoto(id: string) {
  return ACTIVITY_PHOTOS[id] ?? { photo: "", gradient: "from-blue-600/80 to-indigo-700/80" }
}

export default async function LandingPage({ params }: { params: Promise<{ lang: string }> }) {
  const { lang } = await params
  const locale: Locale = isValidLocale(lang) ? lang : "en"
  const isAr = locale === "ar"
  const ChevronNext = isAr ? ChevronLeft : ChevronRight

  const minPrice = Math.min(...classrooms.map((c) => c.pricePerDay))

  const testimonials = isAr
    ? [
        { name: "نورة الصباح",     role: "أم لطفلين",           text: "كان أحمد متحمساً لكل يوم. تطور كثيراً في مهارات الروبوت ويسأل متى يعود!" },
        { name: "محمد العنزي",      role: "والد",                 text: "المدربون محترفون والجو آمن. بنتي أحبّت مشاركة لوحاتها مع الأسرة كل مساء." },
        { name: "لطيفة المطيري",   role: "أم",                   text: "أفضل استثمار لهذا الصيف. تعلّمت ابنتي اللغة وهي تلعب وتضحك." },
      ]
    : [
        { name: "Noura Al-Sabah",   role: "Mother of two",       text: "Ahmad was excited every single morning. He grew so much in robotics and keeps asking when camp starts again!" },
        { name: "Mohammed Al-Enezi",role: "Father",               text: "The instructors are professional and the environment is safe. My daughter loves sharing her artwork every evening." },
        { name: "Latifa Al-Mutairi",role: "Mother",               text: "Best investment of the summer. My daughter learned English while playing and laughing the whole week." },
      ]

  return (
    <div className="min-h-screen bg-white font-sans antialiased">

      {/* ── HEADER ─────────────────────────────────────────────────── */}
      <header className="sticky top-0 z-30 border-b border-white/60 bg-white/95 shadow-sm backdrop-blur-md">
        <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-3">
          {/* Logo */}
          <Link href={`/${locale}`} className="flex items-center gap-2.5">
            <CampLogo className="size-10 shrink-0" />
            <span className="hidden text-sm font-extrabold tracking-tight text-gray-900 sm:block">
              {isAr ? "مخيم النجوم الصغيرة" : "Little Stars Camp"}
            </span>
          </Link>

          {/* Nav actions */}
          <div className="flex items-center gap-2">
            <LanguageToggle />
            <Link
              href={`/${locale}/signup`}
              className="rounded-xl bg-blue-600 px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-blue-700"
            >
              {t("nav.signup", locale)}
            </Link>
          </div>
        </div>
      </header>

      {/* ── HERO ────────────────────────────────────────────────────── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 text-white">
        {/* Background photo with dark overlay */}
        <Image
          src="https://images.unsplash.com/photo-1567427017947-545c5f8d16ad?w=1600&q=80"
          alt=""
          fill
          className="object-cover opacity-15"
          priority
          sizes="100vw"
        />
        {/* Decorative blobs */}
        <div className="pointer-events-none absolute -left-20 -top-20 size-96 rounded-full bg-white/5 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 -right-20 size-96 rounded-full bg-yellow-300/10 blur-3xl" />

        <div className="mx-auto max-w-6xl px-4 py-20 md:py-28">
          <div className="mx-auto max-w-3xl text-center">
            {/* Badge */}
            <div className="mb-5 inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-medium backdrop-blur-sm ring-1 ring-white/20">
              <Calendar className="size-4" />
              {isAr ? weeks[0]?.labelAr : weeks[0]?.label}
            </div>

            <h1 className="mb-4 text-5xl font-black tracking-tight sm:text-6xl lg:text-7xl">
              {isAr ? "مخيم النجوم الصغيرة" : "Little Stars Camp"}
            </h1>

            <p className="mb-3 text-xl font-medium text-blue-100 sm:text-2xl">
              {t("hero.tagline", locale)}
            </p>

            <p className="mb-2 text-base text-blue-200">
              <MapPin className="me-1 inline size-4" />
              {isAr ? "السالمية، الكويت" : "Salmiya, Kuwait"}
            </p>

            <p className="mb-10 text-base text-blue-200">
              {t("hero.price_from", locale)}{" "}
              <span className="text-xl font-bold text-yellow-300">
                {minPrice.toFixed(3)} {isAr ? "د.ك" : "KD"}
              </span>{" "}
              {t("hero.per_day", locale)}
            </p>

            <div className="flex flex-col items-center gap-4 sm:flex-row sm:justify-center">
              <Link
                href={`/${locale}/book/classroom`}
                className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-8 py-4 text-lg font-bold text-gray-900 shadow-lg shadow-yellow-400/30 transition hover:bg-yellow-300 hover:scale-105 active:scale-95"
              >
                {t("hero.cta", locale)}
                <ChevronNext className="size-5" />
              </Link>
              <Link
                href={`/${locale}/signup`}
                className="inline-flex items-center gap-2 rounded-2xl border border-white/30 bg-white/10 px-8 py-4 text-base font-semibold text-white backdrop-blur-sm transition hover:bg-white/20"
              >
                {t("nav.signup", locale)}
                <ChevronNext className="size-5" />
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* ── STATS BAR ────────────────────────────────────────────────── */}
      <section className="border-b border-gray-100 bg-gradient-to-r from-gray-50 to-white">
        <div className="mx-auto grid max-w-4xl grid-cols-2 gap-0 divide-x divide-gray-100 sm:grid-cols-4">
          {[
            { value: "250+", label: t("hero.stats.kids", locale) },
            { value: "8",    label: t("hero.stats.activities", locale) },
            { value: "10",   label: t("hero.stats.instructors", locale) },
            { value: "4.9★", label: t("hero.stats.rating", locale) },
          ].map(({ value, label }) => (
            <div key={label} className="flex flex-col items-center justify-center px-4 py-8 text-center">
              <span className="text-3xl font-black text-blue-700">{value}</span>
              <span className="mt-1 text-xs font-medium text-gray-500">{label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* ── FEATURES ─────────────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-16">
        <div className="grid gap-6 sm:grid-cols-3">
          {[
            { icon: Users,  title: t("hero.feature1", locale), desc: isAr ? "مدربون حاصلون على شهادات معتمدة ولديهم شغف حقيقي بتعليم الأطفال" : "Certified instructors with a genuine passion for teaching young minds" },
            { icon: Shield, title: t("hero.feature2", locale), desc: isAr ? "مجموعات لا تتجاوز 15 طفلاً لضمان الاهتمام الشخصي لكل طفل" : "Groups capped at 15 kids for personalised attention every session" },
            { icon: Clock,  title: t("hero.feature3", locale), desc: isAr ? "برامج صباحية ومسائية تناسب جدول كل عائلة طوال الأسبوع" : "Morning and afternoon sessions to fit every family's schedule all week" },
          ].map(({ icon: Icon, title, desc }) => (
            <div key={title} className="rounded-2xl border border-gray-100 bg-white p-6 shadow-sm transition hover:shadow-md">
              <div className="mb-4 inline-flex size-12 items-center justify-center rounded-xl bg-blue-50">
                <Icon className="size-6 text-blue-600" />
              </div>
              <h3 className="mb-2 text-base font-bold text-gray-900">{title}</h3>
              <p className="text-sm text-gray-500 leading-relaxed">{desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── VIDEO SECTION ─────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-blue-50 to-indigo-50 py-20">
        <div className="mx-auto max-w-4xl px-4">
          <div className="mb-10 text-center">
            <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
              {t("hero.video.title", locale)}
            </h2>
            <p className="text-gray-500">{t("hero.video.subtitle", locale)}</p>
          </div>
          <VideoSection locale={locale} />
        </div>
      </section>

      {/* ── CLASSROOM GALLERY ─────────────────────────────────────────── */}
      <section className="mx-auto max-w-6xl px-4 py-20">
        <div className="mb-12 text-center">
          <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
            {t("hero.classrooms.title", locale)}
          </h2>
          <p className="text-gray-500">{t("hero.classrooms.subtitle", locale)}</p>
        </div>

        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {classrooms.map((room) => {
            const ap = activityPhoto(room.id)
            const name = isAr ? room.nameAr : room.name
            const minSeats = Math.min(...room.days.map((d) => d.seatsRemaining))
            const isFull = minSeats === 0
            const genderLabel = isAr
              ? room.gender === "boys" ? "بنين" : room.gender === "girls" ? "بنات" : "مختلط"
              : room.gender === "boys" ? "Boys" : room.gender === "girls" ? "Girls" : "Mixed"

            return (
              <Link
                key={room.id}
                href={`/${locale}/book/classroom`}
                className="group flex flex-col overflow-hidden rounded-3xl border border-gray-100 bg-white shadow-sm transition-all duration-300 hover:-translate-y-1 hover:shadow-xl"
              >
                {/* Classroom photo */}
                <div className="relative h-48 overflow-hidden">
                  <Image
                    src={ap.photo}
                    alt={name}
                    fill
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                    sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
                  />
                  {/* Subtle gradient overlay so text badges are legible */}
                  <div className={`absolute inset-0 bg-gradient-to-t ${ap.gradient} opacity-40`} />
                  {/* Gender badge */}
                  <span className="absolute end-3 top-3 rounded-full bg-black/40 px-2.5 py-0.5 text-xs font-semibold text-white backdrop-blur-sm">
                    {genderLabel}
                  </span>
                  {/* Seats badge */}
                  {!isFull && minSeats <= 5 && (
                    <span className="absolute start-3 top-3 rounded-full bg-orange-500 px-2.5 py-0.5 text-xs font-bold text-white shadow">
                      {isAr ? `${minSeats} متبقي` : `${minSeats} left`}
                    </span>
                  )}
                  {isFull && (
                    <span className="absolute start-3 top-3 rounded-full bg-red-500 px-2.5 py-0.5 text-xs font-bold text-white shadow">
                      {t("step2.full", locale)}
                    </span>
                  )}
                </div>

                {/* Info */}
                <div className="flex flex-1 flex-col p-4">
                  <h3 className="mb-1 text-sm font-bold text-gray-900 leading-snug">{name}</h3>
                  <p className="mb-3 text-xs text-gray-500">
                    {t("hero.ages", locale)} {room.ageRange[0]}–{room.ageRange[1]}
                  </p>

                  <div className="mt-auto flex items-center justify-between">
                    <div>
                      <span className="text-base font-black text-blue-700">
                        {room.pricePerDay.toFixed(3)}
                      </span>
                      <span className="ms-1 text-xs text-gray-400">
                        {isAr ? "د.ك/يوم" : "KD/day"}
                      </span>
                    </div>
                    <span className="rounded-xl bg-blue-600 px-3 py-1 text-xs font-bold text-white transition group-hover:bg-blue-700">
                      {t("hero.book_now", locale)}
                    </span>
                  </div>
                </div>
              </Link>
            )
          })}
        </div>
      </section>

      {/* ── TESTIMONIALS ──────────────────────────────────────────────── */}
      <section className="bg-gradient-to-br from-yellow-50 via-orange-50 to-amber-50 py-20">
        <div className="mx-auto max-w-5xl px-4">
          <div className="mb-12 text-center">
            <h2 className="mb-3 text-3xl font-black text-gray-900 sm:text-4xl">
              {t("hero.testimonials.title", locale)}
            </h2>
            <p className="text-gray-500">{t("hero.testimonials.subtitle", locale)}</p>
          </div>
          <div className="grid gap-6 sm:grid-cols-3">
            {testimonials.map((item) => (
              <div key={item.name} className="rounded-2xl bg-white p-6 shadow-sm">
                <div className="mb-3 flex gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Star key={i} className="size-4 fill-yellow-400 text-yellow-400" />
                  ))}
                </div>
                <p className="mb-4 text-sm text-gray-700 leading-relaxed">"{item.text}"</p>
                <div className="flex items-center gap-3">
                  {/* Creative avatar */}
                  <div className="flex size-10 items-center justify-center rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 text-sm font-bold text-white">
                    {item.name.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-gray-900">{item.name}</p>
                    <p className="text-xs text-gray-400">{item.role}</p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── FINAL CTA ─────────────────────────────────────────────────── */}
      <section className="bg-gradient-to-r from-blue-700 to-indigo-700 py-20 text-white">
        <div className="mx-auto max-w-2xl px-4 text-center">
          <CampLogo className="mx-auto mb-6 size-16" />
          <h2 className="mb-4 text-3xl font-black sm:text-4xl">
            {isAr ? "ابدأ رحلة طفلك هذا الصيف" : "Start Your Child's Journey This Summer"}
          </h2>
          <p className="mb-8 text-blue-200">
            {isAr
              ? "أماكن محدودة — احجز الآن قبل نفاد المقاعد"
              : "Limited seats available — secure your spot before it's gone"}
          </p>
          <Link
            href={`/${locale}/book/classroom`}
            className="inline-flex items-center gap-2 rounded-2xl bg-yellow-400 px-10 py-4 text-lg font-bold text-gray-900 shadow-xl shadow-yellow-400/30 transition hover:bg-yellow-300 hover:scale-105"
          >
            {t("hero.cta", locale)}
            <ChevronNext className="size-5" />
          </Link>
        </div>
      </section>

      {/* ── FOOTER ────────────────────────────────────────────────────── */}
      <footer className="border-t border-gray-100 bg-white">
        <div className="mx-auto flex max-w-6xl flex-col items-center justify-between gap-4 px-4 py-8 text-sm text-gray-500 sm:flex-row">
          <div className="flex items-center gap-2">
            <CampLogo className="size-6" />
            <span className="font-semibold text-gray-700">
              {isAr ? "مخيم النجوم الصغيرة" : "Little Stars Camp"}
            </span>
          </div>
          <span>
            <MapPin className="me-1 inline size-3.5" />
            {t("hero.footer.location", locale)}
          </span>
          <span>© 2025 · {t("hero.footer.rights", locale)}</span>
        </div>
      </footer>
    </div>
  )
}
