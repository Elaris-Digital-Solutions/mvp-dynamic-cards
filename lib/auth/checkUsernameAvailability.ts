'use server'

import { createClient } from '@/lib/supabase/server'

export async function checkUsernameAvailability(username: string): Promise<{ available: boolean }> {
  if (!username) return { available: false }

  const cleanUsername = username.toLowerCase().trim()

  const supabase = await createClient()

  // We check the profiles table for the username.
  const { data, error } = await supabase
    .from('profiles')
    .select('username')
    .eq('username', cleanUsername)
    .single()

  // PGRST116 indicates 0 rows returned from .single(), meaning the username is available
  if (error && error.code === 'PGRST116') {
    return { available: true }
  }

  // If we found data, or encountered any other error, we conservatively say it's not available
  return { available: false }
}
