"use client"

import { useLocale } from "@/hooks/useLocale"
import { cn } from "@/lib/utils"

const STEPS = [
  { key: "step.1" as const, path: "classroom" },
  { key: "step.2" as const, path: "schedule" },
  { key: "step.3" as const, path: "details" },
  { key: "step.4" as const, path: "review" },
  { key: "step.5" as const, path: "payment" },
  { key: "step.6" as const, path: "confirmation" },
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
                  "flex size-7 items-center justify-center rounded-full text-xs font-semibold transition-colors",
                  isCompleted && "bg-blue-600 text-white",
                  isActive && "bg-blue-600 text-white ring-4 ring-blue-100",
                  !isCompleted && !isActive && "bg-gray-200 text-gray-500",
                )}
              >
                {isCompleted ? "✓" : stepNum}
              </div>
              <span
                className={cn(
                  "hidden text-[10px] font-medium sm:block",
                  isActive ? "text-blue-600" : "text-gray-400",
                )}
              >
                {t(step.key)}
              </span>
            </div>
            {!isLast && (
              <div
                className={cn(
                  "mx-1 h-0.5 flex-1 transition-colors sm:mx-2",
                  isCompleted ? "bg-blue-600" : "bg-gray-200",
                )}
              />
            )}
          </div>
        )
      })}
    </div>
  )
}
