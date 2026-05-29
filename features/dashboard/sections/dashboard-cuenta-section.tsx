'use client'

import { useState } from 'react'
import { TriangleAlert, Eye, EyeOff, CheckCircle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { PasswordRequirements } from '@/components/ui/password-requirements'
import { changePasswordAction } from '@/lib/actions/auth'

interface Props {
  username: string
  onDeleteAccount: () => Promise<{ error?: string } | undefined>
}

export function DashboardCuentaSection({ username, onDeleteAccount }: Props) {
  const [showConfirm, setShowConfirm] = useState(false)
  const [confirmText, setConfirmText] = useState('')
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteError, setDeleteError] = useState('')

  const handleDelete = async () => {
    setIsDeleting(true)
    setDeleteError('')
    const result = await onDeleteAccount()
    if (result?.error) {
      setDeleteError('No se pudo eliminar la cuenta. Intenta de nuevo.')
      setIsDeleting(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-4xl font-black tracking-tight">Mi cuenta</h1>
        <p className="mt-1.5 text-muted-foreground text-lg">Configuración y opciones de tu cuenta.</p>
      </div>

      <ChangePasswordSection />

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
            className="border-destructive/50 text-destructive hover:bg-destructive/10 hover:border-destructive hover:text-destructive"
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

            {deleteError && <p className="text-sm text-destructive">{deleteError}</p>}

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

// ─── Password section ─────────────────────────────────────────────────────────

function ChangePasswordSection() {
  return (
    <div className="rounded-xl border border-border/60 overflow-hidden">
      <div className="px-4 py-4">
        <div className="space-y-0.5">
          <p className="font-medium">Cambiar contraseña</p>
          <p className="text-sm text-muted-foreground">
            Necesitás ingresar tu contraseña actual para poder cambiarla.
          </p>
        </div>
      </div>
      <div className="px-4 pb-5 pt-1 border-t border-border/60">
        <ChangePasswordForm />
      </div>
    </div>
  )
}

// ─── Password field with show/hide toggle ─────────────────────────────────────

function PasswordField({
  id,
  label,
  value,
  onChange,
  disabled,
  children,
}: {
  id: string
  label: string
  value: string
  onChange: (v: string) => void
  disabled: boolean
  children?: React.ReactNode
}) {
  const [show, setShow] = useState(false)

  return (
    <div className="space-y-2">
      <Label htmlFor={id}>{label}</Label>
      <div className="relative">
        <Input
          id={id}
          type={show ? 'text' : 'password'}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          disabled={disabled}
          className="pr-10"
        />
        <button
          type="button"
          onClick={() => setShow(s => !s)}
          className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          tabIndex={-1}
        >
          {show ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
      {children}
    </div>
  )
}

// ─── Form ─────────────────────────────────────────────────────────────────────

function ChangePasswordForm() {
  const [current, setCurrent]     = useState('')
  const [next, setNext]           = useState('')
  const [confirm, setConfirm]     = useState('')
  const [isPending, setIsPending] = useState(false)
  const [error, setError]         = useState('')
  const [success, setSuccess]     = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setSuccess(false)
    setIsPending(true)

    const result = await changePasswordAction(current, next, confirm)

    if (result?.error) {
      setError(result.error)
    } else {
      setSuccess(true)
      setCurrent('')
      setNext('')
      setConfirm('')
    }

    setIsPending(false)
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4 max-w-sm mt-2">
      <PasswordField
        id="current-password"
        label="Contraseña actual"
        value={current}
        onChange={setCurrent}
        disabled={isPending}
      />

      <PasswordField
        id="new-password"
        label="Nueva contraseña"
        value={next}
        onChange={setNext}
        disabled={isPending}
      >
        <PasswordRequirements password={next} />
      </PasswordField>

      <PasswordField
        id="confirm-password"
        label="Confirmar nueva contraseña"
        value={confirm}
        onChange={setConfirm}
        disabled={isPending}
      />

      {error   && <p className="text-sm text-destructive">{error}</p>}

      {success && (
        <div className="flex items-center gap-2 text-sm text-green-600 dark:text-green-400">
          <CheckCircle className="w-4 h-4 shrink-0" />
          Contraseña actualizada correctamente.
        </div>
      )}

      <Button
        type="submit"
        disabled={isPending || !current || !next || !confirm}
      >
        {isPending ? 'Actualizando...' : 'Actualizar contraseña'}
      </Button>
    </form>
  )
}
