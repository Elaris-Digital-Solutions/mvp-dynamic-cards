import { createClient } from '@/lib/supabase/server'
import { getUser } from './getUser'
import { Database } from '@/types/database'

type Profile = Database['public']['Tables']['profiles']['Row']

export async function getProfile(): Promise<Profile | null> {
  const user = await getUser()
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
    console.error("Error fetching profile:", error)
    return null
  }
}
