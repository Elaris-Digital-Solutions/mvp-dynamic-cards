import { createClient } from '@/lib/supabase/server'
import { type User } from '@supabase/supabase-js'

export async function getCurrentUser(): Promise<User | null> {
  const supabase = await createClient()
  try {
    const { data: { user }, error } = await supabase.auth.getUser()
    if (error) throw error
    return user
  } catch (error) {
    return null
  }
}
