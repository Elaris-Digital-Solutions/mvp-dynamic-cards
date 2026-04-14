import { requireAdmin } from '@/lib/auth/requireAdmin'
import { createClient } from '@/lib/supabase/server'
import { UserTable } from '@/components/admin/UserTable'
import Link from 'next/link'

const PAGE_SIZE = 50

interface AdminUsersPageProps {
  searchParams: Promise<{ page?: string }>
}

export default async function AdminUsersPage({ searchParams }: AdminUsersPageProps) {
  const { user } = await requireAdmin()
  const supabase = await createClient()
  const { page: pageParam } = await searchParams
  const page = Math.max(1, parseInt(pageParam ?? '1'))
  const from = (page - 1) * PAGE_SIZE
  const to = from + PAGE_SIZE - 1

  const [{ data: profiles }, { count }] = await Promise.all([
    supabase
      .from('profiles')
      .select('id, username, full_name, email, is_active, role, service_expires_at')
      .order('created_at', { ascending: false })
      .range(from, to) as any,
    supabase
      .from('profiles')
      .select('*', { count: 'exact', head: true }),
  ])

  const totalPages = Math.ceil((count ?? 0) / PAGE_SIZE)

  return (
    <div className="max-w-[1400px]">
      <div className="mb-6 flex flex-col space-y-1">
        <h1 className="text-3xl font-bold text-gray-900 tracking-tight">User Operations Data</h1>
        <p className="text-gray-500 text-sm">
          Control access lifecycles securely dynamically across bounds.
          {count !== null && <span className="ml-2 text-gray-400">({count} total users)</span>}
        </p>
      </div>
      <UserTable profiles={profiles || []} currentUserId={user.id} />
      {totalPages > 1 && (
        <div className="mt-4 flex items-center justify-between text-sm text-gray-600">
          <span>Page {page} of {totalPages}</span>
          <div className="flex gap-2">
            {page > 1 && (
              <Link
                href={`/admin/users?page=${page - 1}`}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition"
              >
                Previous
              </Link>
            )}
            {page < totalPages && (
              <Link
                href={`/admin/users?page=${page + 1}`}
                className="px-3 py-1.5 rounded border border-gray-300 hover:bg-gray-50 transition"
              >
                Next
              </Link>
            )}
          </div>
        </div>
      )}
    </div>
  )
}
