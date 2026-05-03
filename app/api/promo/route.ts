import { NextRequest, NextResponse } from "next/server"
import { findPromo } from "@/lib/mock-data/promos"
import { applyPromo } from "@/lib/pricing"

export async function POST(req: NextRequest) {
  const { code, subtotal } = await req.json()

  if (!code || typeof code !== "string") {
    return NextResponse.json({ valid: false, discount: 0, message: "No code provided" }, { status: 400 })
  }

  const promo = findPromo(code)
  if (!promo) {
    return NextResponse.json({ valid: false, discount: 0, message: "Invalid promo code" })
  }

  const discount = applyPromo(subtotal ?? 0, promo)
  return NextResponse.json({
    valid: true,
    discount,
    description: promo.description,
    descriptionAr: promo.descriptionAr,
    message: promo.description,
  })
}
