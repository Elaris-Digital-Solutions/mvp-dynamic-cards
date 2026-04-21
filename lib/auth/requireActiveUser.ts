import { redirect } from 'next/navigation'
import { getCurrentProfile } from './getCurrentProfile'
import { requireAuth } from './requireAuth'

export async function requireActiveUser() {
  const user = await requireAuth()

  // BLOQUEANTE 4: verificación de email obligatoria antes de acceder al dashboard
  if (!user.email_confirmed_at) {
    redirect('/verify-email')
  }

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
