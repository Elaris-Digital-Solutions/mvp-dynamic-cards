import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { UserTable } from '@/components/admin/UserTable'

export default async function AdminUsersPage() {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  // Admins bypass RLS implicitly for Profiles or rely on policy <Admin read all profiles>
  const { data: profiles } = await supabase
    .from('profiles')
    .select('*')
    .order('created_at', { ascending: false })

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6 flex flex-col space-y-1">
        <h1 className="text-3xl font-bold text-foreground tracking-tight">Usuarios</h1>
        <p className="text-muted-foreground text-sm">Gestiona los accesos y ciclos de vida de los usuarios.</p>
      </div>
      <UserTable profiles={profiles || []} currentUserId={user.id} />
    </div>
  )
}
