'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

/**
 * Encapsulated logout logic to be passed to the Sidebar component (Phase 3).
 * 
 * Usage:
 *   const { handleLogout } = useLogout()
 *   <Sidebar onLogout={() => handleLogout()} />
 */
export function useLogout() {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return { handleLogout }
}
