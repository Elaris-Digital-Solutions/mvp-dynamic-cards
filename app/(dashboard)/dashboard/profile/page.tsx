import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { ProfileEditor } from '@/components/dashboard/ProfileEditor'

export default async function ProfileSettingsPage() {
  const { user, profile } = await requireActiveUser()

  const meta = user.user_metadata as Record<string, string> | undefined
  const enrichedProfile = {
    ...profile,
    first_name: profile.first_name || meta?.first_name || '',
    last_name: profile.last_name || meta?.last_name || '',
  }

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>
      <ProfileEditor profile={enrichedProfile} />
    </div>
  )
}
