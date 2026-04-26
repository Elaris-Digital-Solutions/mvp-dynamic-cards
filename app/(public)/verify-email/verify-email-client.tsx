'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { resendVerificationEmailAction } from '@/lib/actions/auth'

const COOLDOWN_SECONDS = 60
const pureWhiteStyle = { color: '#ffffff', opacity: 1, WebkitTextFillColor: '#ffffff' }

export function VerifyEmailClient({ email }: { email: string }) {
  const [error, setError] = useState('')
  const [sent, setSent] = useState(false)
  const [loading, setLoading] = useState(false)
  const [cooldown, setCooldown] = useState(0)
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null)

  useEffect(() => {
    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current)
    }
  }, [])

  const startCooldown = () => {
    setCooldown(COOLDOWN_SECONDS)
    intervalRef.current = setInterval(() => {
      setCooldown(prev => {
        if (prev <= 1) {
          clearInterval(intervalRef.current!)
          return 0
        }
        return prev - 1
      })
    }, 1000)
  }

  const handleResend = async () => {
    if (cooldown > 0 || !email) return
    setLoading(true)
    setError('')
    setSent(false)

    const result = await resendVerificationEmailAction(email)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSent(true)
    startCooldown()
  }

  return (
    <div className="relative isolate min-h-screen bg-background flex items-center justify-center px-5 sm:px-4 overflow-hidden">
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
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-background/55 backdrop-blur-xl shadow-[0_16px_48px_-24px_rgba(10,28,56,0.85)] p-5 sm:p-7">
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(255,255,255,0.14),rgba(255,255,255,0.035)_60%,rgba(255,255,255,0.015)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_40%,transparent_100%)]" />
              <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_4px)]" />
            </div>

            <div className="relative z-20 flex flex-col space-y-6 text-center">
              <div className="space-y-2">
                <p className="text-xs tracking-[0.16em] uppercase" style={pureWhiteStyle}>VELTRIX</p>
                <h1 className="text-2xl font-semibold tracking-normal" style={pureWhiteStyle}>Revisa tu correo</h1>
              </div>

              <div className="space-y-3" style={pureWhiteStyle}>
                <p>
                  Hemos enviado un enlace de confirmación a{' '}
                  {email ? <strong className="break-all">{email}</strong> : 'tu correo'}.
                </p>
                <p className="text-sm text-white/70">
                  Revisa tu bandeja de entrada y también la carpeta de spam.
                </p>
              </div>

              {sent && (
                <p className="text-sm text-green-400" role="status">
                  Correo reenviado correctamente.
                </p>
              )}

              {error && (
                <p className="text-sm text-red-300" role="alert">{error}</p>
              )}

              {email && (
                <div className="space-y-3 pt-1">
                  <p className="text-xs text-white/50">¿No lo recibiste?</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleResend}
                    disabled={loading || cooldown > 0}
                    className="w-full border-white/20 bg-white/5 hover:bg-white/10 text-white/80 hover:text-white disabled:opacity-40"
                  >
                    {loading
                      ? 'Enviando...'
                      : cooldown > 0
                      ? `Reenviar en ${cooldown}s`
                      : 'Reenviar correo'}
                  </Button>
                </div>
              )}

              <div className="pt-1" style={pureWhiteStyle}>
                <Link href="/login" className="text-sm hover:underline" style={pureWhiteStyle}>
                  ← Volver al login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
