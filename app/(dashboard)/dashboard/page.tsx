import { requireActiveUser } from '@/lib/auth/requireActiveUser'

export default async function DashboardPage() {
  const { profile } = await requireActiveUser()

  return (
    <div>
      <h1 className="mb-4 text-3xl font-bold">Overview</h1>
      <div className="rounded-lg border p-6 text-sm bg-white">
        <p className="mb-2"><strong>Name:</strong> {profile.full_name || 'N/A'}</p>
        <p className="mb-2"><strong>Email:</strong> {profile.email || 'N/A'}</p>
        <p className="mb-2"><strong>Role:</strong> {profile.role}</p>
        <p className="mb-2">
          <strong>Status:</strong>{' '}
          <span className={profile.is_active ? 'text-green-600 font-bold' : 'text-red-600 font-bold'}>
            {profile.is_active ? 'Active' : 'Inactive'}
          </span>
        </p>
      </div>
    </div>
  )
}
