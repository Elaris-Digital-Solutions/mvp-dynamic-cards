import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { ProfileEditor } from '@/components/dashboard/ProfileEditor'

export default async function ProfileSettingsPage() {
  const { profile } = await requireActiveUser()

  return (
    <div>
      <h1 className="mb-6 text-3xl font-bold">Profile Settings</h1>
      <ProfileEditor profile={profile} />
    </div>
  )
}
