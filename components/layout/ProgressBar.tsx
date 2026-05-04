"use client"

import { useLocale } from "@/hooks/useLocale"
import { cn } from "@/lib/utils"

const STEPS = [
  { key: "step.1" as const, path: "child" },
  { key: "step.2" as const, path: "workshops" },
  { key: "step.3" as const, path: "weeks" },
  { key: "step.4" as const, path: "details" },
  { key: "step.5" as const, path: "review" },
  { key: "step.6" as const, path: "payment" },
]

interface ProgressBarProps {
  currentStep: 1 | 2 | 3 | 4 | 5 | 6
}

export function ProgressBar({ currentStep }: ProgressBarProps) {
  const { t } = useLocale()

  return (
    <div className="flex items-center justify-between px-4">
      {STEPS.map((step, index) => {
        const stepNum = index + 1
        const isCompleted = stepNum < currentStep
        const isActive = stepNum === currentStep
        const isLast = index === STEPS.length - 1

        return (
          <div key={step.key} className="flex flex-1 items-center">
            <div className="flex flex-col items-center gap-1">
              <div
                className={cn(
                  "flex size-7 items-center justify-center rounded-full text-xs font-bold transition-all",
                  isCompleted && "bg-yellow-400 text-navy-900 shadow-sm",
                  isActive && "bg-yellow-400 text-[#0a1628] ring-4 ring-yellow-200 shadow-md scale-110",
                  !isCompleted && !isActive && "bg-white/20 text-white/50 border border-white/20",
                )}
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-semibold sm:block",
                  isActive ? "text-yellow-300" : isCompleted ? "text-yellow-400/70" : "text-white/40",
                )}
              >
                {t(step.key)}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 transition-colors sm:mx-2",
                  isCompleted ? "bg-yellow-400/60" : "bg-white/10",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
