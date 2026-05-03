"use client"

import { useParams } from "next/navigation"
import type { Locale } from "@/types/i18n"
import { t as tFn, isValidLocale } from "@/lib/i18n"
import type { TranslationKey } from "@/lib/i18n/en"

export function useLocale() {
  const params = useParams()
  const rawLang = Array.isArray(params?.lang) ? params.lang[0] : (params?.lang ?? "en")
  const locale: Locale = isValidLocale(rawLang) ? rawLang : "en"

  function t(key: TranslationKey, vars?: Record<string, string | number>): string {
    return tFn(key, locale, vars)
  }

  return { locale, t }
}
