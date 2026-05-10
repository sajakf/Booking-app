import 'jsr:@supabase/functions-js/edge-runtime.d.ts'

// ─── Sandbox token (public docs: docs.myfatoorah.com/docs/test-token) ─────────
// For production: set MYFATOORAH_API_KEY as a Supabase secret
//   supabase secrets set MYFATOORAH_API_KEY=<your-live-key>
const SANDBOX_KEY =
  'SK_KWT_vVZlnnAqu8jRByOWaRPNId4ShzEDNt256dvnjebuyzo52dXjAfRx2ixW5umjWSUx'

const PAYMENT_METHOD_IDS: Record<string, number> = {
  KNET: 1,
  VISA: 2,
  MASTERCARD: 2,
  APPLEPAY: 3,
  TABBY: 20,
  TAMARA: 30,
}

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' },
  })
}

// ─── Test card reference (shown in error responses for sandbox mode) ──────────
const TEST_CARDS = {
  KNET:       { number: '8888880000000001', pin: '1234', otp: '1234' },
  VISA:       { number: '4508750015741019', cvv: '100',  expiry: '09/30' },
  MASTERCARD: { number: '5123450000000008', cvv: '100',  expiry: '05/21' },
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  // ── Resolve API key: prefer secret, fall back to sandbox key in test mode ──
  const isTest = Deno.env.get('MYFATOORAH_TEST') !== 'false'
  const envKey = Deno.env.get('MYFATOORAH_API_KEY') ?? ''
  const apiKey = envKey.startsWith('SK_') ? envKey : (isTest ? SANDBOX_KEY : '')
  const mfBase = isTest
    ? 'https://apitest.myfatoorah.com'
    : 'https://api.myfatoorah.com'

  if (!apiKey) {
    return json({ error: 'Payment gateway not configured. Set MYFATOORAH_API_KEY secret.' }, 503)
  }

  // ── Parse request ──────────────────────────────────────────────────────────
  let body: {
    bookingDraft: Record<string, unknown>
    paymentMethod?: string
    callbackUrl: string
    errorUrl: string
    locale: string
    draftId: string
    expiresAt: string
  }

  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const { bookingDraft, paymentMethod, callbackUrl, errorUrl, locale, draftId, expiresAt } = body

  if (!draftId || !callbackUrl || !errorUrl) {
    return json({ error: 'Missing required fields: draftId, callbackUrl, errorUrl' }, 400)
  }

  const parent = bookingDraft.parent as Record<string, unknown> | undefined
  const lineItems = bookingDraft.lineItems as Array<{ classroomName: string; unitPrice: number }> | undefined

  const invoiceItems = lineItems?.length
    ? lineItems.map(item => ({ ItemName: item.classroomName, Quantity: 1, UnitPrice: item.unitPrice }))
    : [{ ItemName: 'Camp Booking', Quantity: 1, UnitPrice: Number(bookingDraft.total) }]

  const customerEmail = String(parent?.email ?? '').trim()
  const customerMobile = String(parent?.mobile ?? '').replace('+965', '').trim()

  const mfPayload: Record<string, unknown> = {
    InvoiceValue: Number(bookingDraft.total),
    NotificationOption: 'LNK',
    DisplayCurrencyIso: 'KWD',
    CustomerName: String(parent?.name ?? 'Customer'),
    CallBackUrl: callbackUrl,
    ErrorUrl: errorUrl,
    Language: locale === 'ar' ? 'AR' : 'EN',
    UserDefinedField: draftId,
    InvoiceItems: invoiceItems,
  }

  // Only include email/mobile when non-empty — MyFatoorah rejects empty strings
  if (customerEmail) mfPayload.CustomerEmail = customerEmail
  if (customerMobile) mfPayload.CustomerMobile = customerMobile

  if (paymentMethod && PAYMENT_METHOD_IDS[paymentMethod]) {
    mfPayload.PaymentMethodId = PAYMENT_METHOD_IDS[paymentMethod]
  }

  // ── Call MyFatoorah SendPayment ────────────────────────────────────────────
  let mfRes: Response
  try {
    mfRes = await fetch(`${mfBase}/v2/SendPayment`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${apiKey}`,
        'Content-Type': 'application/json',
        Accept: 'application/json',
      },
      body: JSON.stringify(mfPayload),
    })
  } catch (err) {
    return json({ error: `Network error reaching MyFatoorah: ${err}` }, 502)
  }

  const text = await mfRes.text()
  console.log(`[MF SendPayment] HTTP ${mfRes.status}:`, text.slice(0, 300))

  let mfData: {
    IsSuccess: boolean
    Message?: string
    ValidationErrors?: unknown
    Data?: { InvoiceId: number; InvoiceURL: string }
  }

  try {
    mfData = JSON.parse(text)
  } catch {
    return json({ error: `MyFatoorah returned unexpected response (HTTP ${mfRes.status})` }, 502)
  }

  if (!mfData.IsSuccess || !mfData.Data) {
    const hint = isTest && paymentMethod
      ? ` | Test cards: ${JSON.stringify(TEST_CARDS[paymentMethod as keyof typeof TEST_CARDS] ?? TEST_CARDS.KNET)}`
      : ''
    return json({
      error: mfData.Message || 'Payment initiation failed',
      validationErrors: mfData.ValidationErrors ?? null,
      hint: isTest ? `Sandbox mode. KNET test card: 8888880000000001 | PIN: 1234 | OTP: 1234${hint}` : undefined,
    }, 400)
  }

  return json({
    invoiceId: String(mfData.Data.InvoiceId),
    invoiceUrl: mfData.Data.InvoiceURL,
    draftId,
    expiresAt,
  })
})
