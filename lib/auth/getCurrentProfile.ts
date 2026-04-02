import { createClient } from '@/lib/supabase/server'
import { getCurrentUser } from './getCurrentUser'
import { Database } from '@/types/database'

export type Profile = Database['public']['Tables']['profiles']['Row']

export async function getCurrentProfile(): Promise<Profile | null> {
  const user = await getCurrentUser()
  if (!user) return null

  const supabase = await createClient()
  try {
    const { data, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single()

    if (error) throw error
    return data as Profile
  } catch (error) {
    console.error("Error fetching current profile:", error)
    return null
  }
}
