'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LoginFormProps {
  /**
   * Integration point: connect to your auth system.
   * Example: const { login } = useAuth(); <LoginForm onLogin={login} />
   */
  onLogin?: (email: string, password: string) => Promise<void>
  /** Pass isLoading from your auth context to disable the form during sign-in */
  isLoading?: boolean
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LoginForm({ onLogin, isLoading: externalLoading = false }: LoginFormProps) {
  const router = useRouter()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [formError, setFormError] = useState('')
  const [internalLoading, setInternalLoading] = useState(false)

  const isLoading = externalLoading || internalLoading
  const isSubmitDisabled = isLoading || !email.trim() || !password.trim()
  const pureWhiteStyle = { color: '#ffffff', opacity: 1, WebkitTextFillColor: '#ffffff' }

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setFormError('')
    setInternalLoading(true)

    try {
      if (onLogin) {
        await onLogin(email.trim(), password)
      }
      // Default mock behavior: navigate to dashboard
      router.push('/dashboard')
    } catch (error) {
      setFormError(error instanceof Error ? error.message : 'No se pudo iniciar sesión.')
    } finally {
      setInternalLoading(false)
    }
  }

  return (
    <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
      <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-background/55 backdrop-blur-xl shadow-[0_16px_48px_-24px_rgba(10,28,56,0.85)] p-5 sm:p-7">
        <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
          <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(255,255,255,0.14),rgba(255,255,255,0.035)_60%,rgba(255,255,255,0.015)_100%)]" />
          <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_40%,transparent_100%)]" />
          <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_4px)]" />
        </div>

        <div className="relative z-20 flex flex-col space-y-6 opacity-100">
          <div className="space-y-2 text-center">
            <p className="text-xs tracking-[0.16em] uppercase" style={pureWhiteStyle}>VELTRIX</p>
            <h1 className="text-2xl font-semibold tracking-normal" style={pureWhiteStyle}>INICIAR SESIÓN</h1>
            <p style={pureWhiteStyle}>Accede a tu cuenta</p>
          </div>

          <form onSubmit={onSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-xs uppercase tracking-wider" style={pureWhiteStyle}>Email</Label>
              <Input
                id="email"
                type="email"
                placeholder="tu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
                autoComplete="email"
                disabled={isLoading}
                className="h-11 rounded-lg border-border/60 bg-background/55 backdrop-blur-sm px-4 !text-white placeholder:!text-white placeholder:opacity-100 caret-white"
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="password" className="text-xs uppercase tracking-wider" style={pureWhiteStyle}>Contraseña</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
                minLength={8}
                autoComplete="current-password"
                disabled={isLoading}
                className="h-11 rounded-lg border-border/60 bg-background/55 backdrop-blur-sm px-4 !text-white placeholder:!text-white placeholder:opacity-100 caret-white"
              />
            </div>

            {formError && (
              <p className="text-sm text-red-300" role="alert">{formError}</p>
            )}

            <Button
              type="submit"
              className="w-full h-11 rounded-lg font-semibold uppercase tracking-wide shadow-[0_10px_30px_-16px_rgba(14,44,92,0.75)]"
              disabled={isSubmitDisabled}
            >
              {isLoading ? 'Iniciando...' : 'Iniciar Sesión'}
            </Button>
          </form>

          <div className="space-y-3 text-center text-sm pt-2 pb-0.5" style={pureWhiteStyle}>
            <p style={pureWhiteStyle}>
              ¿No tienes cuenta?{' '}
              <Link href="/signup" className="font-semibold hover:underline" style={pureWhiteStyle}>
                Crear cuenta
              </Link>
            </p>
            <p>
              <Link href="/" className="hover:underline" style={pureWhiteStyle}>
                Volver al inicio
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
