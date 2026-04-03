import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { NFCCardTable } from '@/components/admin/NFCCardTable'

export default async function AdminCardsPage() {
  await requireAdmin()
  const supabase = await createClient()

  const { data: cards } = await supabase
    .from('nfc_cards')
    .select('*')
    .order('assigned_at', { ascending: false })

  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6 flex flex-col space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">NFC Hardware Network</h1>
        <p className="text-gray-500 text-sm">Bind physical endpoints accurately into your active application layers safely.</p>
      </div>
      <NFCCardTable cards={cards || []} profiles={profiles || []} />
    </div>
  )
}
