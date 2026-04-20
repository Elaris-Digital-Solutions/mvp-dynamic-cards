'use client'

import { updateUserRole, updateUserStatus, updateUserExpiration } from '@/lib/actions/admin'
import { Database } from '@/types/database'
import { useState, useTransition } from 'react'

type AdminProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'username' | 'email' | 'is_active' | 'role' | 'service_expires_at'
>
type AdminNFCCard = Pick<
  Database['public']['Tables']['nfc_cards']['Row'],
  'profile_id' | 'card_uid' | 'is_active'
>

const PAGE_SIZE = 20

export function UserTable({
  profiles,
  currentUserId,
  cards,
}: {
  profiles: AdminProfile[]
  currentUserId: string
  cards?: AdminNFCCard[]
}) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [page, setPage] = useState(0)

  const totalPages = Math.ceil(profiles.length / PAGE_SIZE)
  const paginated = profiles.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    setError(null)
    startTransition(async () => {
      const res = await updateUserStatus(userId, !currentStatus)
      if (res?.error) setError(res.error)
    })
  }

  const handleToggleRole = (userId: string, currentRole: 'user' | 'admin') => {
    if (userId === currentUserId) {
      setError('No puedes cambiar tu propio rol.')
      return
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`¿Confirmas cambiar el rol de este usuario a ${newRole.toUpperCase()}?`)) return

    setError(null)
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res?.error) setError(res.error)
    })
  }

  const handleUpdateExpiration = (userId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const dateStr = formData.get('date') as string || null

    startTransition(async () => {
      const res = await updateUserExpiration(userId, dateStr)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="bg-card border border-border rounded-lg flex flex-col shadow-none">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 font-medium border-b border-destructive/20 rounded-t-lg">
          {error}
        </div>
      )}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-muted border-b border-border text-muted-foreground whitespace-nowrap">
            <tr>
              <th className="px-6 py-4">Usuario</th>
              <th className="px-6 py-4">Estado</th>
              <th className="px-6 py-4">Rol</th>
              {cards && <th className="px-6 py-4">Tarjeta NFC</th>}
              <th className="px-6 py-4 min-w-[200px]">Vencimiento</th>
            </tr>
          </thead>
          <tbody>
            {paginated.map(p => {
              const card = cards?.find(c => c.profile_id === p.id)
              return (
                <tr key={p.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 align-top">
                    <div className="font-semibold text-foreground">
                      {p.full_name || 'Sin nombre'}{' '}
                      <span className="font-normal text-muted-foreground">(@{p.username})</span>
                    </div>
                    <div className="text-muted-foreground text-xs mt-1">{p.email}</div>
                    <div className="text-muted-foreground/60 text-[10px] font-mono mt-1" title={p.id}>
                      {p.id.slice(0, 12)}...
                    </div>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <button
                      onClick={() => handleToggleActive(p.id, p.is_active)}
                      disabled={isPending}
                      className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-full border transition-colors disabled:opacity-50 ${
                        p.is_active
                          ? 'bg-accent/50 text-accent-foreground border-border hover:bg-accent/70'
                          : 'bg-destructive/10 text-destructive border-destructive/20 hover:bg-destructive/20'
                      }`}
                    >
                      {p.is_active ? 'ACTIVO' : 'INACTIVO'}
                    </button>
                  </td>
                  <td className="px-6 py-4 align-top">
                    <button
                      onClick={() => handleToggleRole(p.id, (p.role ?? 'user') as 'user' | 'admin')}
                      disabled={isPending || p.id === currentUserId}
                      className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded border transition-colors disabled:opacity-50 ${
                        p.role === 'admin'
                          ? 'bg-primary/40 text-primary-foreground border-border/60'
                          : 'bg-muted text-muted-foreground border-border/40 hover:bg-muted/70'
                      }`}
                    >
                      {(p.role ?? 'user').toUpperCase()}
                    </button>
                  </td>
                  {cards && (
                    <td className="px-6 py-4 align-top">
                      {card ? (
                        <div className="flex flex-col gap-0.5">
                          <span className={`text-[10px] font-bold uppercase tracking-wider ${card.is_active ? 'text-accent-foreground' : 'text-muted-foreground/60'}`}>
                            {card.is_active ? '● Activa' : '○ Inactiva'}
                          </span>
                          <span className="font-mono text-xs text-foreground">{card.card_uid}</span>
                        </div>
                      ) : (
                        <span className="text-muted-foreground/60 text-xs bg-muted/40 px-2 py-1 rounded font-medium">
                          Sin tarjeta
                        </span>
                      )}
                    </td>
                  )}
                  <td className="px-6 py-4 align-top">
                    <form onSubmit={(e) => handleUpdateExpiration(p.id, e)} className="flex items-center space-x-2">
                      <input
                        type="date"
                        name="date"
                        defaultValue={p.service_expires_at ? p.service_expires_at.split('T')[0] : ''}
                        title={p.service_expires_at || 'Sin vencimiento'}
                        className="border border-border bg-background text-foreground p-1.5 rounded text-xs min-w-[130px] focus:ring-1 focus:ring-ring focus:outline-none"
                      />
                      <button
                        disabled={isPending}
                        type="submit"
                        className="bg-primary text-primary-foreground px-3 py-1.5 rounded text-xs font-medium hover:bg-primary/80 transition disabled:opacity-50"
                      >
                        Guardar
                      </button>
                    </form>
                  </td>
                </tr>
              )
            })}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={cards ? 5 : 4} className="px-6 py-8 text-center text-muted-foreground italic">
                  No se encontraron usuarios.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div className="flex items-center justify-between px-6 py-3 border-t border-border text-sm text-muted-foreground">
          <span>
            {profiles.length} usuarios · página {page + 1} de {totalPages}
          </span>
          <div className="flex gap-2">
            <button
              disabled={page === 0}
              onClick={() => setPage(p => p - 1)}
              className="px-3 py-1.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs transition"
            >
              Anterior
            </button>
            <button
              disabled={page >= totalPages - 1}
              onClick={() => setPage(p => p + 1)}
              className="px-3 py-1.5 rounded border border-border bg-background hover:bg-muted disabled:opacity-40 text-xs transition"
            >
              Siguiente
            </button>
          </div>
        </div>
      )}
    </div>
  )
}
