'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { updatePasswordAction } from '@/lib/actions/auth'

const pureWhiteStyle = { color: '#ffffff', opacity: 1, WebkitTextFillColor: '#ffffff' }

export function ResetForm() {
  const router = useRouter()
  const [password, setPassword] = useState('')
  const [confirm, setConfirm] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const passwordsMatch = password === confirm
  const isDisabled = loading || !password || !confirm || !passwordsMatch || password.length < 8

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    if (!passwordsMatch) {
      setError('Las contraseñas no coinciden.')
      return
    }

    setError('')
    setLoading(true)

    const result = await updatePasswordAction(password)
    setLoading(false)

    if (result.error) {
      setError(result.error)
      return
    }

    router.push('/login?message=Contraseña actualizada correctamente')
  }

  return (
    <form onSubmit={onSubmit} className="space-y-5">
      <div className="space-y-2">
        <Label htmlFor="password" className="text-xs uppercase tracking-wider" style={pureWhiteStyle}>
          Nueva contraseña
        </Label>
        <Input
          id="password"
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          disabled={loading}
          className="h-11 rounded-lg border-border/60 bg-background/55 backdrop-blur-sm px-4 !text-white placeholder:!text-white/40 caret-white"
        />
        {password && password.length < 8 && (
          <p className="text-xs text-red-300">Mínimo 8 caracteres.</p>
        )}
      </div>

      <div className="space-y-2">
        <Label htmlFor="confirm" className="text-xs uppercase tracking-wider" style={pureWhiteStyle}>
          Confirmar contraseña
        </Label>
        <Input
          id="confirm"
          type="password"
          placeholder="••••••••"
          value={confirm}
          onChange={(e) => setConfirm(e.target.value)}
          required
          minLength={8}
          autoComplete="new-password"
          disabled={loading}
          className="h-11 rounded-lg border-border/60 bg-background/55 backdrop-blur-sm px-4 !text-white placeholder:!text-white/40 caret-white"
        />
        {confirm && !passwordsMatch && (
          <p className="text-xs text-red-300">Las contraseñas no coinciden.</p>
        )}
      </div>

      {error && (
        <p className="text-sm text-red-300" role="alert">{error}</p>
      )}

      <Button
        type="submit"
        className="w-full h-11 rounded-lg font-semibold uppercase tracking-wide shadow-[0_10px_30px_-16px_rgba(14,44,92,0.75)]"
        disabled={isDisabled}
      >
        {loading ? 'Actualizando...' : 'Actualizar contraseña'}
      </Button>
    </form>
  )
}
