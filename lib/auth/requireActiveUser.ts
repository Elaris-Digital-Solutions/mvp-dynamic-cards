import { redirect } from 'next/navigation'
import { getCurrentProfile } from './getCurrentProfile'
import { requireAuth } from './requireAuth'

export async function requireActiveUser() {
  const user = await requireAuth()
  const profile = await getCurrentProfile()

  if (!profile || !profile.is_active) {
    redirect('/inactive')
  }

  return { user, profile }
}
