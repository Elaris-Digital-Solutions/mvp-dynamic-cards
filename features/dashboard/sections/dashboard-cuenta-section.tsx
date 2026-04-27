'use client'

import { useState } from 'react'
import { TriangleAlert } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'

interface Props {
  username: string
  onDeleteAccount: () => Promise<void>
}

export function DashboardCuentaSection({ username, onDeleteAccount }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [error, setError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setError('')
    try {
      await onDeleteAccount()
    } catch {
      setError('No se pudo eliminar la cuenta. Intenta de nuevo.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Mi cuenta</h1>
        <p className="mt-1.5 text-muted-foreground text-lg">Configuración y opciones de tu cuenta.</p>
      </div>

      <div className="rounded-xl border border-destructive/40 p-4 space-y-4">
        <div className="flex items-center gap-2 text-destructive">
          <TriangleAlert className="w-4 h-4 shrink-0" />
          <p className="text-sm tracking-[0.2em] uppercase font-semibold">Zona de peligro</p>
        </div>

        <div className="space-y-1">
          <p className="font-medium">Eliminar mi cuenta</p>
          <p className="text-sm text-muted-foreground">
            Esta acción es permanente e irreversible. Se eliminarán tu perfil, botones, imágenes y todos los datos asociados.
          </p>
        </div>

        {!showConfirm ? (
          <Button
            variant="outline"
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive"
            onClick={() => setShowConfirm(true)}
          >
            Eliminar mi cuenta
          </Button>
        ) : (
          <div className="space-y-4 rounded-lg border border-destructive/30 bg-destructive/5 p-4">
            <p className="text-sm">
              Para confirmar, escribí{' '}
              <span className="font-mono font-bold text-destructive">{username}</span>{' '}
              en el campo de abajo.
            </p>

            <div className="space-y-2">
              <Label htmlFor="confirm-username">Nombre de usuario</Label>
              <Input
                id="confirm-username"
                value={confirmText}
                onChange={(e) => setConfirmText(e.target.value)}
                placeholder={username}
                disabled={isDeleting}
              />
            </div>

            {error && <p className="text-sm text-destructive">{error}</p>}

            <div className="flex gap-3">
              <Button
                variant="destructive"
                disabled={confirmText !== username || isDeleting}
                onClick={handleDelete}
              >
                {isDeleting ? 'Eliminando...' : 'Confirmar eliminación'}
              </Button>
              <Button
                variant="outline"
                onClick={() => { setShowConfirm(false); setConfirmText('') }}
                disabled={isDeleting}
              >
                Cancelar
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
