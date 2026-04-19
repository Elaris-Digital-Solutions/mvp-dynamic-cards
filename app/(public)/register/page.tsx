'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'
import { SignupForm } from '@/components/auth/signup-form'

export default function RegisterPage() {
  const router = useRouter()

  const handleSignup = async (firstName: string, lastName: string, email: string, password: string, username: string) => {
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
          first_name: firstName,
          last_name: lastName,
          full_name: [firstName, lastName].filter(Boolean).join(' '),
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
    <div className="relative isolate min-h-screen bg-background flex items-center justify-center px-5 sm:px-4 overflow-hidden">
      {/* Hero background layers */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 50%, rgba(62, 119, 198, 0.24) 0%, rgba(33, 74, 130, 0.14) 40%, transparent 74%), linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 30px 30px, 30px 30px',
        }}
      >
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/18 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(95%_80%_at_50%_50%,transparent_56%,rgba(2,8,23,0.2)_100%)]" />
      </div>

      <div className="relative z-10 w-full py-8">
        <SignupForm onSignup={handleSignup} />
      </div>
    </div>
  )
}
