import { getProfile } from './getProfile'

export async function isAdmin() {
  const profile = await getProfile()
  return profile?.role === 'admin'
}
