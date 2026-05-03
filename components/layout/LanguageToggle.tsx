"use client"

import { useParams, usePathname } from "next/navigation"
import Link from "next/link"
import { Globe } from "lucide-react"
import { useLocale } from "@/hooks/useLocale"

export function LanguageToggle() {
  const pathname = usePathname()
  const params = useParams()
  const { locale, t } = useLocale()

  const currentLang = Array.isArray(params?.lang) ? params.lang[0] : (params?.lang ?? "en")
  const targetLang = currentLang === "en" ? "ar" : "en"
  const targetPath = pathname.replace(`/${currentLang}`, `/${targetLang}`)

  return (
    <Link
      href={targetPath}
      className="inline-flex items-center gap-1.5 rounded-full border border-gray-200 bg-white px-3 py-1.5 text-sm font-medium text-gray-600 shadow-sm transition hover:bg-gray-50 hover:text-gray-900"
    >
      <Globe className="size-4" />
      <span>{t("nav.language")}</span>
    </Link>
  )
}
