'use server'

import { headers } from 'next/headers'
import { createClient } from '@/lib/supabase/server'
import { isRateLimited } from '@/lib/utils/rateLimiter'

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
  if (!username) return { available: false }

  const h = await headers()
  const forwarded = h.get('x-forwarded-for')
  const real = h.get('x-real-ip')
  const ip = (forwarded ? forwarded.split(',')[0] : real) ?? 'unknown'

  if (await isRateLimited(`username:${ip}`)) {
    return { available: false }
  }

  const cleanUsername = username.toLowerCase().trim()
  const supabase = await createClient()

  // ilike para comparación case-insensitive robusta aunque el trigger falle
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .ilike('username', cleanUsername)
    .single()

  if (error && error.code === 'PGRST116') return { available: true }
  return { available: false }
}
