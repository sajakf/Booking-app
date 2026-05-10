import { NextRequest, NextResponse } from "next/server"
import { db } from "@/lib/db"
import { v4 as uuidv4 } from "uuid"

export async function POST(req: NextRequest) {
  const { bookingDraft, paymentMethod, locale } = await req.json()

  // 1. Persist booking draft so the callback can reconstruct the booking
  const draftId = uuidv4()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000)
  await db.bookingDraft.create({
    data: {
      id: draftId,
      data: JSON.stringify({ ...bookingDraft, locale, expiresAt: expiresAt.toISOString() }),
      expiresAt,
    },
  })

  const baseUrl = process.env.NEXT_PUBLIC_BASE_URL ?? "http://localhost:3000"
  const callbackUrl = `${baseUrl}/api/payment/callback?draftId=${draftId}&lang=${locale}`
  const errorUrl   = `${baseUrl}/${locale}/book/payment?error=failed&draftId=${draftId}`

  // 2. Mock mode — skip real payment, go straight to callback
  const isMock = !process.env.MYFATOORAH_API_KEY || process.env.MYFATOORAH_API_KEY === "test"
  if (isMock) {
    return NextResponse.json({
      invoiceId: "MOCK-123",
      invoiceUrl: `${baseUrl}/api/payment/callback?draftId=${draftId}&lang=${locale}&mock=1&paymentId=MOCK-PAY`,
      mockRef: `MOCK-${draftId.slice(0, 8).toUpperCase()}`,
      expiresAt: expiresAt.toISOString(),
    })
  }

  // 3. Call the Supabase edge function — it holds the MyFatoorah API key as a secret
  const supabaseUrl  = process.env.NEXT_PUBLIC_SUPABASE_URL!
  const supabaseAnon = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  const edgeFnUrl    = `${supabaseUrl}/functions/v1/initiate-payment`

  try {
    const efRes = await fetch(edgeFnUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        apikey: supabaseAnon,
        Authorization: `Bearer ${supabaseAnon}`,
      },
      body: JSON.stringify({
        bookingDraft,
        paymentMethod,
        callbackUrl,
        errorUrl,
        locale,
        draftId,
        expiresAt: expiresAt.toISOString(),
      }),
    })

    const text = await efRes.text()
    let data: { invoiceId?: string; invoiceUrl?: string; error?: string; hint?: string }
    try {
      data = JSON.parse(text)
    } catch {
      console.error("[initiate] Edge function returned non-JSON:", text.slice(0, 200))
      return NextResponse.json({ error: "Payment service unavailable" }, { status: 502 })
    }

    if (!efRes.ok || data.error) {
      console.error("[initiate] Edge function error:", data)
      return NextResponse.json(
        { error: data.error ?? "Payment initiation failed", hint: data.hint },
        { status: efRes.ok ? 500 : efRes.status }
      )
    }

    return NextResponse.json({
      invoiceId: data.invoiceId,
      invoiceUrl: data.invoiceUrl,
      expiresAt: expiresAt.toISOString(),
    })
  } catch (err) {
    console.error("[initiate] Failed to reach edge function:", err)
    return NextResponse.json({ error: "Payment service unreachable" }, { status: 503 })
  }
}
