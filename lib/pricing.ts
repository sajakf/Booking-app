import type { PromoCode } from "@/lib/mock-data/promos"
import { SIBLING_DISCOUNT_PERCENT } from "@/lib/mock-data/promos"

export function calcSubtotal(pricePerDay: number, days: number): number {
  return round(pricePerDay * days)
}

export function applyWeekDiscount(subtotal: number, weekDiscountPercent: number, isFullWeek: boolean): number {
  if (!isFullWeek) return 0
  return round(subtotal * (weekDiscountPercent / 100))
}

export function applyPromo(subtotal: number, promo: PromoCode | null): number {
  if (!promo) return 0
  if (promo.type === "percent") return round(subtotal * (promo.value / 100))
  return round(promo.value)
}

export function applySiblingDiscount(subtotal: number, hasSibling: boolean): number {
  if (!hasSibling) return 0
  return round(subtotal * (SIBLING_DISCOUNT_PERCENT / 100))
}

export function calcTotal(
  subtotal: number,
  weekDiscount: number,
  promoDiscount: number,
  siblingDiscount: number,
): number {
  return round(Math.max(0, subtotal - weekDiscount - promoDiscount - siblingDiscount))
}

function round(n: number): number {
  return Math.round(n * 1000) / 1000
}

export function formatKwd(amount: number, locale: "en" | "ar" = "en"): string {
  const formatted = amount.toFixed(3)
  const suffix = locale === "ar" ? "د.ك" : "KD"
  return `${formatted} ${suffix}`
}
