'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ButtonHTMLAttributes } from 'react'

export default function LogoutButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button 
      onClick={handleLogout}
      className={`text-sm font-medium hover:opacity-70 transition-opacity ${className || ''}`}
      {...props}
    >
      Cerrar sesión
    </button>
  )
}
