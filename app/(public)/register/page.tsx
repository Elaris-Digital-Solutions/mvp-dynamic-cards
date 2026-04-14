'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SignupForm } from '@/components/auth/signup-form'

export default function RegisterPage() {
  const router = useRouter()

  const handleSignup = async (name: string, email: string, password: string, username: string) => {
    if (!username) {
      throw new Error('El nombre de usuario es requerido para tu tarjeta.')
    }

    const supabase = createClient()
    const { error: signUpError } = await supabase.auth.signUp({
      email,
      password,
      options: {
        data: {
          username,
          full_name: name
        }
      }
    })

    if (signUpError) {
      if (signUpError.message.includes('User already registered') || signUpError.message.includes('already exists')) {
        throw new Error('Este email ya está en uso.')
      }
      throw new Error(signUpError.message)
    }

    router.refresh()
    router.push('/dashboard')
  }

  return (
    <div className="flex min-h-screen items-center justify-center p-6 bg-background">
      <div className="w-full">
        <SignupForm onSignup={handleSignup} />
      </div>
    </div>
  )
}
