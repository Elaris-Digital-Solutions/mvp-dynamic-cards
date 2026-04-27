'use client'

import { useEffect, useRef, useState } from 'react'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { checkUsernameAvailability } from '@/lib/auth/checkUsernameAvailability'
import { updateUsername } from '@/lib/actions/profile'

interface Props {
  onSuccess: (username: string) => void
}

export function UsernameSetupModal({ onSuccess }: Props) {
  const [value, setValue] = useState('')
  const [isAvailable, setIsAvailable] = useState<boolean | null>(null)
  const [isChecking, setIsChecking] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [error, setError] = useState('')
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    const cleaned = value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')

    if (cleaned.length < 3) {
      setIsAvailable(null)
      setIsChecking(false)
      return
    }

    setIsChecking(true)
    setIsAvailable(null)

    if (timerRef.current) clearTimeout(timerRef.current)
    timerRef.current = setTimeout(async () => {
      try {
        const { available } = await checkUsernameAvailability(cleaned)
        setIsAvailable(available)
      } catch {
        setIsAvailable(null)
      } finally {
        setIsChecking(false)
      }
    }, 500)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [value])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')
    setValue(raw)
    setError('')
  }

  const handleSave = async () => {
    setIsSaving(true)
    setError('')
    const res = await updateUsername(value)
    if ('error' in res) {
      setError(res.error)
      setIsSaving(false)
      return
    }
    onSuccess(value)
  }

  const canSubmit = value.length >= 3 && isAvailable === true && !isChecking && !isSaving

  return (
    <Dialog open>
      <DialogContent
        className="sm:max-w-md"
        onPointerDownOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogHeader>
          <DialogTitle>Elegí tu nombre de usuario</DialogTitle>
          <DialogDescription>
            Hubo un conflicto al reservar tu username durante el registro. Elegí uno ahora para continuar — es la URL de tu tarjeta digital.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 pt-2">
          <div className="space-y-2">
            <Label htmlFor="new-username">Nombre de usuario</Label>
            <div className="relative">
              <Input
                id="new-username"
                value={value}
                onChange={handleChange}
                placeholder="ej: juan-garcia"
                disabled={isSaving}
                className="pr-8"
                maxLength={50}
              />
              <div className="absolute right-2.5 top-1/2 -translate-y-1/2">
                {isChecking && <Loader2 className="w-4 h-4 animate-spin text-muted-foreground" />}
                {!isChecking && isAvailable === true && <CheckCircle className="w-4 h-4 text-green-500" />}
                {!isChecking && isAvailable === false && <XCircle className="w-4 h-4 text-destructive" />}
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Solo letras minúsculas, números y guiones. Mínimo 3 caracteres.
            </p>
            {!isChecking && isAvailable === false && (
              <p className="text-xs text-destructive">Este username ya está en uso.</p>
            )}
            {!isChecking && isAvailable === true && (
              <p className="text-xs text-green-600">¡Disponible!</p>
            )}
            {error && <p className="text-xs text-destructive">{error}</p>}
          </div>

          <Button onClick={handleSave} disabled={!canSubmit} className="w-full">
            {isSaving ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Guardando...</> : 'Confirmar username'}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
