import { redirect } from 'next/navigation'
import { requireAuth } from '@/lib/auth/requireAuth'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'
import { createClient } from '@/lib/supabase/server'
import { dbProfileToUIProfile } from '@/lib/utils/adapters'
import DashboardClient from '@/components/dashboard/DashboardClient'

export default async function DashboardPage() {
  // Step 1: verify auth (single Supabase getUser call, cached for the rest of the request)
  const user = await requireAuth()

  // Step 2: profile validation + buttons fetch in parallel — both only need user.id
  const supabase = await createClient()
  const [profile, { data: buttons }] = await Promise.all([
    getCurrentProfile(),
    (supabase as any)
      .from('action_buttons')
      .select('*')
      .eq('profile_id', user.id)
      .order('sort_order', { ascending: true }),
  ])

  if (!profile || !profile.is_active) redirect('/inactive')
  if (profile.service_expires_at && new Date(profile.service_expires_at) < new Date()) {
    redirect('/inactive')
  }

  const userProfile = dbProfileToUIProfile(profile, buttons || [])

  return (
    <div className="flex-1 w-full relative">
      <DashboardClient initialProfile={userProfile} isAdmin={profile.role === 'admin'} />
    </div>
  )
}
