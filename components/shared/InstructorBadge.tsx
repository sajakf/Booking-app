import { User } from "lucide-react"
import type { Instructor } from "@/types/classroom"
import type { Locale } from "@/types/i18n"

interface InstructorBadgeProps {
  instructor: Instructor
  locale: Locale
  compact?: boolean
}

export function InstructorBadge({ instructor, locale, compact = false }: InstructorBadgeProps) {
  const name = locale === "ar" ? instructor.nameAr : instructor.name
  const specialty = locale === "ar" ? instructor.specialtyAr : instructor.specialty

  if (compact) {
    return (
      <span className="inline-flex items-center gap-1 rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">
        <User className="size-3" />
        {name}
      </span>
    )
  }

  return (
    <div className="flex items-center gap-2">
      <div className="flex size-8 items-center justify-center rounded-full bg-blue-100 text-blue-600">
        <User className="size-4" />
      </div>
      <div>
        <p className="text-sm font-medium text-gray-900">{name}</p>
        <p className="text-xs text-gray-500">{specialty}</p>
      </div>
    </div>
  )
}
