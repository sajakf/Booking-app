"use client"

import { useState } from "react"
import { Play, X, Cpu, Palette, BookOpen, Zap } from "lucide-react"
import type { Locale } from "@/types/i18n"

const CAMP_VIDEO_URL = process.env.NEXT_PUBLIC_CAMP_VIDEO_URL ?? ""

const HIGHLIGHTS = [
  { icon: Cpu,      color: "bg-blue-500",    labelEn: "Robotics Lab",      labelAr: "مختبر الروبوتات" },
  { icon: Palette,  color: "bg-pink-500",    labelEn: "Arts Studio",       labelAr: "استوديو الفنون" },
  { icon: BookOpen, color: "bg-emerald-500", labelEn: "Language Hub",      labelAr: "مركز اللغة" },
  { icon: Zap,      color: "bg-orange-500",  labelEn: "Sports Academy",    labelAr: "أكاديمية الرياضة" },
]

export default function VideoSection({ locale }: { locale: Locale }) {
  const [playing, setPlaying] = useState(false)
  const isAr = locale === "ar"

  return (
    <div className="overflow-hidden rounded-3xl shadow-2xl">
      {playing && CAMP_VIDEO_URL ? (
        /* ── Real video or YouTube embed ── */
        <div className="relative aspect-video bg-black">
          {CAMP_VIDEO_URL.includes("youtube") || CAMP_VIDEO_URL.includes("youtu.be") ? (
            <iframe
              src={CAMP_VIDEO_URL.replace("watch?v=", "embed/") + "?autoplay=1"}
              className="size-full"
              allow="autoplay; fullscreen"
              allowFullScreen
            />
          ) : (
            <video
              src={CAMP_VIDEO_URL}
              className="size-full object-cover"
              autoPlay
              controls
              playsInline
            />
          )}
          <button
            onClick={() => setPlaying(false)}
            className="absolute end-3 top-3 flex size-9 items-center justify-center rounded-full bg-black/60 text-white transition hover:bg-black/80"
            aria-label="Close video"
          >
            <X className="size-4" />
          </button>
        </div>
      ) : (
        /* ── Beautiful poster / placeholder ── */
        <div className="relative aspect-video bg-gradient-to-br from-blue-700 via-indigo-700 to-violet-800">
          {/* Decorative grid */}
          <div
            className="absolute inset-0 opacity-10"
            style={{
              backgroundImage:
                "linear-gradient(rgba(255,255,255,.3) 1px,transparent 1px),linear-gradient(90deg,rgba(255,255,255,.3) 1px,transparent 1px)",
              backgroundSize: "40px 40px",
            }}
          />

          {/* Floating activity bubbles */}
          <div className="absolute inset-0 overflow-hidden">
            {HIGHLIGHTS.map((h, i) => {
              const Icon = h.icon
              const positions = [
                "left-[10%] top-[15%]",
                "right-[12%] top-[20%]",
                "left-[15%] bottom-[20%]",
                "right-[10%] bottom-[15%]",
              ]
              return (
                <div
                  key={h.labelEn}
                  className={`absolute ${positions[i]} flex flex-col items-center gap-1.5 opacity-80`}
                >
                  <div className={`flex size-12 items-center justify-center rounded-2xl ${h.color} shadow-lg ring-2 ring-white/30 sm:size-14`}>
                    <Icon className="size-6 text-white sm:size-7" />
                  </div>
                  <span className="rounded-full bg-black/30 px-2 py-0.5 text-xs font-medium text-white backdrop-blur-sm">
                    {isAr ? h.labelAr : h.labelEn}
                  </span>
                </div>
              )
            })}
          </div>

          {/* Centre play button */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
            <button
              onClick={() => setPlaying(true)}
              className="group mb-4 flex size-20 items-center justify-center rounded-full bg-white/20 ring-4 ring-white/40 backdrop-blur-sm transition hover:scale-110 hover:bg-white/30 sm:size-24"
              aria-label={isAr ? "شاهد قصتنا" : "Watch Our Story"}
            >
              <Play className="ms-1 size-8 fill-white text-white drop-shadow sm:size-10" />
            </button>
            <p className="text-lg font-bold text-white drop-shadow">
              {isAr ? "شاهد قصتنا" : "Watch Our Story"}
            </p>
            <p className="mt-1 text-sm text-blue-200">
              {isAr ? "سيتوفر قريباً · صيف 2026" : "Coming soon · Summer 2026"}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}
