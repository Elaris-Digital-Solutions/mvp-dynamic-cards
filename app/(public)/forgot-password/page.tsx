'use client'

import { useState } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { requestPasswordResetAction } from '@/lib/actions/auth'

const pureWhiteStyle = { color: '#ffffff', opacity: 1, WebkitTextFillColor: '#ffffff' }

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState('')
  const [loading, setLoading] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    const result = await requestPasswordResetAction(email.trim())
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    setSubmitted(true)
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

            <div className="relative z-20 flex flex-col space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-xs tracking-[0.16em] uppercase" style={pureWhiteStyle}>VELTRIX</p>
                <h1 className="text-2xl font-semibold tracking-normal" style={pureWhiteStyle}>Restablecer contraseña</h1>
              </div>

              {submitted ? (
                <div className="space-y-4 text-center py-2">
                  <div className="rounded-lg border border-green-500/30 bg-green-500/10 px-4 py-4">
                    <p className="text-sm text-green-400">
                      Si existe una cuenta con ese correo, recibirás las instrucciones en breve.
                    </p>
                    <p className="text-xs text-green-400/70 mt-1">
                      Revisa también tu carpeta de spam.
                    </p>
                  </div>
                  <Link href="/login" className="block text-sm hover:underline" style={pureWhiteStyle}>
                    ← Volver al login
                  </Link>
                </div>
              ) : (
                <>
                  <p className="text-sm text-center text-white/70">
                    Ingresa tu correo y te enviaremos un enlace para crear una nueva contraseña.
                  </p>

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
                        disabled={loading}
                        className="h-11 rounded-lg border-border/60 bg-background/55 backdrop-blur-sm px-4 !text-white placeholder:!text-white/40 caret-white"
                      />
                    </div>

                    {error && (
                      <p className="text-sm text-red-300" role="alert">{error}</p>
                    )}

                    <Button
                      type="submit"
                      className="w-full h-11 rounded-lg font-semibold uppercase tracking-wide shadow-[0_10px_30px_-16px_rgba(14,44,92,0.75)]"
                      disabled={loading || !email.trim()}
                    >
                      {loading ? 'Enviando...' : 'Enviar enlace'}
                    </Button>
                  </form>

                  <div className="text-center" style={pureWhiteStyle}>
                    <Link href="/login" className="text-sm hover:underline" style={pureWhiteStyle}>
                      ← Volver al login
                    </Link>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
