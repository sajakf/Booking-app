import 'jsr:@supabase/functions-js/edge-runtime.d.ts'
import { createClient } from 'jsr:@supabase/supabase-js@2'

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

const KUWAIT_MOBILE_RE = /^[569]\d{7}$/

function normalisePhone(raw: string): string | null {
  const digits = raw.replace(/\D/g, '')
  const local = digits.startsWith('965') && digits.length === 11 ? digits.slice(3) : digits
  if (!KUWAIT_MOBILE_RE.test(local)) return null
  return `+965${local}`
}

function randomCode(): string {
  return String(Math.floor(100000 + Math.random() * 900000))
}

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  const TWILIO_ACCOUNT_SID  = Deno.env.get('TWILIO_ACCOUNT_SID')  ?? ''
  const TWILIO_AUTH_TOKEN   = Deno.env.get('TWILIO_AUTH_TOKEN')   ?? ''
  const TWILIO_PHONE_NUMBER = Deno.env.get('TWILIO_PHONE_NUMBER') ?? ''

  if (!TWILIO_ACCOUNT_SID || !TWILIO_AUTH_TOKEN || !TWILIO_PHONE_NUMBER) {
    return json({ error: 'Twilio not configured. Set TWILIO_ACCOUNT_SID, TWILIO_AUTH_TOKEN, TWILIO_PHONE_NUMBER secrets.' }, 503)
  }

  let body: { phone?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const phone = normalisePhone(String(body.phone ?? ''))
  if (!phone) {
    return json({ error: 'Enter a valid Kuwait mobile number (starts with 5, 6, or 9)' }, 400)
  }

  // Rate limit: max 5 OTP requests per hour per phone
  const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000).toISOString()
  const { count } = await supabase
    .from('PhoneOTP')
    .select('*', { count: 'exact', head: true })
    .eq('phone', phone)
    .gte('createdAt', oneHourAgo)

  if ((count ?? 0) >= 5) {
    return json({ error: 'Too many OTP requests. Please wait an hour before trying again.' }, 429)
  }

  // Delete old OTPs for this phone then create a fresh one
  await supabase.from('PhoneOTP').delete().eq('phone', phone)

  const code      = randomCode()
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000).toISOString() // 10 min

  const { error: insertError } = await supabase.from('PhoneOTP').insert({
    phone,
    code,
    expiresAt,
  })

  if (insertError) {
    console.error('[PhoneOTP insert]', insertError)
    return json({ error: 'Failed to create OTP. Please try again.' }, 500)
  }

  // Send SMS via Twilio
  const credentials = btoa(`${TWILIO_ACCOUNT_SID}:${TWILIO_AUTH_TOKEN}`)
  const messageBody = `Your Science Camp verification code is: ${code}. Valid for 10 minutes. Do not share this code.`

  const twilioRes = await fetch(
    `https://api.twilio.com/2010-04-01/Accounts/${TWILIO_ACCOUNT_SID}/Messages.json`,
    {
      method: 'POST',
      headers: {
        Authorization: `Basic ${credentials}`,
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        To:   phone,
        From: TWILIO_PHONE_NUMBER,
        Body: messageBody,
      }),
    }
  )

  if (!twilioRes.ok) {
    const errText = await twilioRes.text()
    console.error('[Twilio send]', twilioRes.status, errText)
    return json({ error: 'Failed to send SMS. Please try again.' }, 502)
  }

  console.log(`[send-otp] OTP sent to ${phone}`)
  return json({ sent: true })
})
