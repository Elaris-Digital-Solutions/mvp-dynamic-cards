'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { ButtonHTMLAttributes, useState } from 'react'

export default function LogoutButton({ className, ...props }: ButtonHTMLAttributes<HTMLButtonElement>) {
  const router = useRouter()
  const supabase = createClient()
  const [isPending, setIsPending] = useState(false)

  const handleLogout = async () => {
    setIsPending(true)
    await supabase.auth.signOut()
    router.push('/login')
    router.refresh()
  }

  return (
    <button
      onClick={handleLogout}
      disabled={isPending}
      className={`text-sm font-medium transition-opacity disabled:opacity-50 disabled:cursor-not-allowed hover:opacity-70 ${className || ''}`}
      {...props}
    >
      {isPending ? 'Cerrando sesión…' : 'Cerrar sesión'}
    </button>
  )
}
