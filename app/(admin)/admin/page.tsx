import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createServiceClient } from '@/lib/supabase/server'
import { AdminPanel } from '@/components/admin/AdminPanel'
import { InfraAlert } from '@/components/admin/InfraAlert'
import { getInfraLimits } from '@/lib/utils/infra-limits'
import { Database } from '@/types/database'

type AdminProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'username' | 'email' | 'is_active' | 'role' | 'service_expires_at'
>
type AdminNFCCard = Pick<
  Database['public']['Tables']['nfc_cards']['Row'],
  'id' | 'card_uid' | 'is_active' | 'profile_id' | 'notes'
>

export default async function AdminPage() {
  const { user, profile } = await requireAdmin()
  const supabase = createServiceClient()

  const infraLimits = await getInfraLimits()

  const [
    profilesResult,
    cardsResult,
    { count: totalUsers },
    { count: activeUsers },
    { count: totalCards },
    { count: linkedCards },
  ] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, full_name, username, email, is_active, role, service_expires_at')
      .not('username', 'like', '_tmp_%')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase
      .from('nfc_cards')
      .select('id, card_uid, is_active, profile_id, notes')
      .order('created_at', { ascending: false })
      .limit(100),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).not('username', 'like', '_tmp_%'),
    supabase.from('profiles').select('*', { count: 'exact', head: true }).eq('is_active', true).not('username', 'like', '_tmp_%'),
    supabase.from('nfc_cards').select('*', { count: 'exact', head: true }),
    supabase.from('nfc_cards').select('*', { count: 'exact', head: true }).not('profile_id', 'is', null),
  ])

  return (
    <div className="space-y-2">
      <InfraAlert supabase={infraLimits.supabase} cloudinary={infraLimits.cloudinary} />
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Centro de Gestión</h1>
        <p className="text-sm text-muted-foreground mt-1">
          Bienvenido, {profile?.first_name || 'admin'}.
        </p>
      </div>

      <AdminPanel
        profiles={(profilesResult.data ?? []) as AdminProfile[]}
        cards={(cardsResult.data ?? []) as AdminNFCCard[]}
        currentUserId={user.id}
        stats={{
          totalUsers: totalUsers ?? 0,
          activeUsers: activeUsers ?? 0,
          totalCards: totalCards ?? 0,
          linkedCards: linkedCards ?? 0,
        }}
      />
    </div>
  )
}
