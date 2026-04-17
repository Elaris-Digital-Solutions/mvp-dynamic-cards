import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NFCCardTable } from '@/components/admin/NFCCardTable'
import { Database } from '@/types/database'

type NFCCard = Database['public']['Tables']['nfc_cards']['Row']

export default async function AdminCardsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: cards } = await supabase
    .from('nfc_cards')
    .select('*')
    .order('assigned_at', { ascending: false }) as { data: NFCCard[] | null, error: unknown }

  // Only fetch profiles that are actually assigned to cards
  // This prevents the page from crashing when the user base grows beyond hundreds of users
  const profileIds = cards?.map(c => c.profile_id).filter(Boolean) as string[] || []
  const uniqueProfileIds = Array.from(new Set(profileIds))

  let profiles: any[] = []
  if (uniqueProfileIds.length > 0) {
    const { data } = await supabase
      .from('profiles')
      .select('*')
      .in('id', uniqueProfileIds)
    profiles = data || []
  }

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6 flex flex-col space-y-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Tarjetas NFC</h1>
        <p className="text-muted-foreground text-sm">Vincula endpoints físicos a tus capas de aplicación activa.</p>
      </div>
      <NFCCardTable cards={cards || []} profiles={profiles} />
    </div>
  )
}
