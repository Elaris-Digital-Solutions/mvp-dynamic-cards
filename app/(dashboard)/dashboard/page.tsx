import { getProfile } from '@/lib/auth/getProfile'

export default async function DashboardPage() {
  const profile = await getProfile()

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Overview</h1>
      <div className="rounded-lg border p-6 text-sm">
        <p><strong>ID:</strong> {profile?.id || 'No Profile'}</p>
        <p><strong>Username:</strong> {profile?.username || 'N/A'}</p>
        <p><strong>Email:</strong> {profile?.email || 'N/A'}</p>
      </div>
    </div>
  )
}
