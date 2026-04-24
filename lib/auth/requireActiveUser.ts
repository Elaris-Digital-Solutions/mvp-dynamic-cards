import { redirect } from 'next/navigation'
import { getCurrentProfile } from './getCurrentProfile'
import { requireAuth } from './requireAuth'

export async function requireActiveUser() {
  const user = await requireAuth()

  const profile = await getCurrentProfile()

  if (!profile || !profile.is_active) {
    redirect('/inactive')
  }

  // BLOQUEANTE 3: aplicar vencimiento de servicio
  if (profile.service_expires_at && new Date(profile.service_expires_at) < new Date()) {
    redirect('/inactive')
  }

  return { user, profile }
}
