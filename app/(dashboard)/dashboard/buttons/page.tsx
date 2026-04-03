import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { createClient } from '@/lib/supabase/server'
import { ButtonManager } from '@/components/dashboard/ButtonManager'

export default async function ButtonsSettingsPage() {
  const { profile } = await requireActiveUser()
  const supabase = await createClient()

  const { data: buttons } = await supabase
    .from('action_buttons')
    .select('*')
    .eq('profile_id', profile.id)
    .order('sort_order', { ascending: true })

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Manage Links</h1>
      <ButtonManager buttons={buttons || []} />
    </div>
  )
}
