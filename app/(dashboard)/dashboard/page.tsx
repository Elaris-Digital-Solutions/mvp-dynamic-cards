import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { createClient } from '@/lib/supabase/server'
import { dbProfileToUIProfile } from '@/lib/utils/adapters'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  const { profile } = await requireActiveUser()
  const supabase = await createClient()

  const [{ data: buttons }, { data: leads }] = await Promise.all([
    supabase
      .from('action_buttons')
      .select('*')
      .eq('profile_id', profile.id)
      .order('sort_order', { ascending: true }),
    supabase
      .from('leads')
      .select('*')
      .eq('profile_id', profile.id)
      .order('created_at', { ascending: false }),
  ])

  const userProfile = dbProfileToUIProfile(profile, buttons || [])

  return (
    <div className="flex-1 w-full relative">
      <DashboardClient
        initialProfile={userProfile}
        isAdmin={profile.role === 'admin'}
        initialLeads={leads || []}
      />
    </div>
  )
}
