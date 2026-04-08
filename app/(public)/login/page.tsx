'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { LoginForm } from '@/frontend/components/auth/login-form'

export default function LoginPage() {
  const router = useRouter()

  const handleLogin = async (email: string, password: string) => {
    const supabase = createClient()
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({ email, password })

    if (authError) {
      if (authError.message === 'Invalid login credentials') {
        throw new Error('Credenciales inválidas. Por favor intenta de nuevo.')
      }
      throw new Error(authError.message)
    }

    if (authData.user) {
      const { data } = await supabase
        .from('profiles')
        .select('role')
        .eq('id', authData.user.id)
        .single()
        
      const profile = data as { role: 'admin' | 'user' } | null

      router.refresh()
      if (profile?.role === 'admin') {
        router.push('/admin')
      } else {
        router.push('/dashboard')
      }
    } else {
      router.refresh()
      router.push('/dashboard')
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full">
        <LoginForm onLogin={handleLogin} />
      </div>
    </div>
  )
}
