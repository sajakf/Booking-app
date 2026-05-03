export type PromoType = "percent" | "fixed"

export interface PromoCode {
  code: string
  type: PromoType
  value: number
  description: string
  descriptionAr: string
}

export const PROMO_CODES: PromoCode[] = [
  { code: "CAMP10", type: "percent", value: 10, description: "10% discount", descriptionAr: "خصم 10%" },
  { code: "EARLY25", type: "fixed", value: 2.5, description: "2.500 KD off", descriptionAr: "خصم 2.500 د.ك" },
  { code: "WELCOME", type: "percent", value: 15, description: "15% discount", descriptionAr: "خصم 15%" },
]

export const SIBLING_DISCOUNT_PERCENT = 10

export function findPromo(code: string): PromoCode | undefined {
  return PROMO_CODES.find((p) => p.code.toUpperCase() === code.toUpperCase().trim())
}
