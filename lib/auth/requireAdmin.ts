import { redirect } from 'next/navigation'
import { requireActiveUser } from './requireActiveUser'

export async function requireAdmin() {
  const { user, profile } = await requireActiveUser()

  if (profile.role !== 'admin') {
    redirect('/dashboard')
  }

  return { user, profile }
}
