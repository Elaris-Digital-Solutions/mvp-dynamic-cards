import { getProfile } from '@/lib/auth/getProfile'

export default async function AdminPage() {
  const profile = await getProfile()

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Admin Dashboard</h1>
      <div className="rounded-lg border bg-white p-6 text-sm">
        <p>Welcome, Admin {profile?.username || 'Unknown'}</p>
      </div>
    </div>
  )
}
