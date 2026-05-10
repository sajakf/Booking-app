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

Deno.serve(async (req: Request) => {
  if (req.method === 'OPTIONS') return new Response('ok', { headers: corsHeaders })

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!,
  )

  let body: { phone?: string; code?: string; name?: string }
  try {
    body = await req.json()
  } catch {
    return json({ error: 'Invalid JSON body' }, 400)
  }

  const phone = normalisePhone(String(body.phone ?? ''))
  const code  = String(body.code ?? '').trim()

  if (!phone || !code) {
    return json({ error: 'Phone and code are required' }, 400)
  }

  // Fetch the latest OTP record for this phone
  const { data: record, error: fetchError } = await supabase
    .from('PhoneOTP')
    .select('*')
    .eq('phone', phone)
    .order('createdAt', { ascending: false })
    .limit(1)
    .single()

  if (fetchError || !record) {
    return json({ error: 'No OTP found. Please request a new code.' }, 400)
  }

  // Check expiry
  if (new Date(record.expiresAt) < new Date()) {
    await supabase.from('PhoneOTP').delete().eq('id', record.id)
    return json({ error: 'Code expired. Please request a new one.' }, 400)
  }

  // Check max attempts
  if (record.attempts >= 5) {
    await supabase.from('PhoneOTP').delete().eq('id', record.id)
    return json({ error: 'Too many incorrect attempts. Please request a new code.' }, 400)
  }

  // Wrong code — increment attempts
  if (record.code !== code) {
    await supabase
      .from('PhoneOTP')
      .update({ attempts: record.attempts + 1 })
      .eq('id', record.id)
    const remaining = 4 - record.attempts
    return json(
      { error: `Incorrect code. ${remaining} attempt${remaining === 1 ? '' : 's'} remaining.` },
      400
    )
  }

  // ✅ Code is correct — clean up OTP
  await supabase.from('PhoneOTP').delete().eq('id', record.id)

  const now = new Date().toISOString()

  // Upsert ParentAccount
  const { data: parent, error: upsertError } = await supabase
    .from('ParentAccount')
    .upsert(
      {
        phone,
        name:            String(body.name ?? ''),
        isVerified:      true,
        phoneVerifiedAt: now,
        updatedAt:       now,
      },
      { onConflict: 'phone', ignoreDuplicates: false }
    )
    .select('id, name, phone, email')
    .single()

  if (upsertError || !parent) {
    console.error('[ParentAccount upsert]', upsertError)
    return json({ error: 'Verified but failed to create account. Please try again.' }, 500)
  }

  console.log(`[verify-otp] Verified ${phone} → ParentAccount ${parent.id}`)
  return json({ verified: true, parent })
})
