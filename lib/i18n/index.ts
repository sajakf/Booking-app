import type { Locale } from "@/types/i18n"
import { en } from "./en"
import { ar } from "./ar"

type Dict = typeof en
type Key = keyof Dict

const dicts: Record<Locale, Dict> = { en, ar }

export function t(key: Key, locale: Locale, vars?: Record<string, string | number>): string {
  const dict = dicts[locale] ?? dicts.en
  let str: string = (dict as Record<string, string>)[key] ?? (en as Record<string, string>)[key] ?? key
  if (vars) {
    for (const [k, v] of Object.entries(vars)) {
      str = str.replace(`{${k}}`, String(v))
    }
  }
  return str
}

export function isValidLocale(locale: string): locale is Locale {
  return locale === "en" || locale === "ar"
}
