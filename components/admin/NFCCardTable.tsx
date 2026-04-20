'use client'

import { processNFCCard, toggleNFCCard, deleteNFCCard } from '@/lib/actions/admin'
import { Database } from '@/types/database'
import { useState, useTransition, useEffect } from 'react'
import { Plus, X } from 'lucide-react'
import { UserSearchAutocomplete } from '@/components/admin/UserSearchAutocomplete'

type AdminNFCCard = Pick<
  Database['public']['Tables']['nfc_cards']['Row'],
  'id' | 'card_uid' | 'is_active' | 'profile_id' | 'notes'
>
type AdminProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'username'
>

const PAGE_SIZE = 20

export function NFCCardTable({ cards, profiles }: { cards: AdminNFCCard[], profiles: AdminProfile[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [copiedId, setCopiedId] = useState<string | null>(null)
  const [baseUrl, setBaseUrl] = useState('')
  const [page, setPage] = useState(0)
  const [showForm, setShowForm] = useState(false)

  const totalPages = Math.ceil(cards.length / PAGE_SIZE)
  const paginated = cards.slice(page * PAGE_SIZE, (page + 1) * PAGE_SIZE)

  useEffect(() => {
    setBaseUrl(process.env.NEXT_PUBLIC_APP_URL || window.location.origin)
  }, [])

  const handleCopyUrl = async (uid: string) => {
    const fullUrl = `${baseUrl}/nfc/${uid}`
    await navigator.clipboard.writeText(fullUrl)
    setCopiedId(uid)
    setTimeout(() => setCopiedId(null), 2000)
  }

  const handleProcess = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const target = e.currentTarget

    startTransition(async () => {
      const res = await processNFCCard(formData)
      if (res?.error) setError(res.error)
      else { target.reset(); setShowForm(false) }
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    setError(null)
    startTransition(async () => {
      const res = await toggleNFCCard(id, !currentStatus)
      if (res?.error) setError(res.error)
    })
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('¿Eliminar esta tarjeta permanentemente? Esta acción destruye el mapeo de hardware.')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteNFCCard(id)
      if (res?.error) setError(res.error)
    })
  }

  const renderProfileBadge = (profileId: string | null) => {
    if (!profileId) {
      return (
        <span className="text-muted-foreground/60 italic text-xs font-semibold bg-muted/40 px-2 py-1 rounded">
          Sin asignar
        </span>
      )
    }
    const assignedProfile = profiles.find(p => p.id === profileId)
    if (!assignedProfile) {
      return (
        <span className="text-destructive italic text-xs font-semibold bg-destructive/10 px-2 py-1 rounded">
          Mapeo huérfano
        </span>
      )
    }
    return (
      <div className="flex flex-col">
        <div className="font-semibold text-foreground leading-tight">
          {assignedProfile.full_name || `@${assignedProfile.username}`}
        </div>
        <div className="text-muted-foreground/60 text-[11px] font-mono mt-0.5 w-40 truncate" title={assignedProfile.id}>
          {assignedProfile.id}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {error && (
        <div className="bg-destructive/10 text-destructive p-4 rounded font-medium border border-destructive/20">
          {error}
        </div>
      )}

      {/* Header row with count + toggle button */}
      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {cards.length} {cards.length === 1 ? 'tarjeta registrada' : 'tarjetas registradas'}
        </p>
        <button
          type="button"
          onClick={() => setShowForm(v => !v)}
          className="flex items-center gap-2 px-4 py-2 rounded-lg border border-border bg-card hover:bg-muted/50 text-sm font-medium text-foreground transition-colors"
        >
          {showForm ? (
            <><X className="w-4 h-4" /> Cancelar</>
          ) : (
            <><Plus className="w-4 h-4" /> Registrar Tarjeta</>
          )}
        </button>
      </div>

      {/* Collapsible provision form */}
      {showForm && (
        <div className="bg-card rounded-lg border border-border p-6 max-w-5xl">
          <h2 className="text-lg font-bold mb-4 text-foreground border-b border-border pb-3">
            Provisionar / Reasignar Hardware NFC
          </h2>
          <form onSubmit={handleProcess} className="flex flex-col space-y-5 pt-2">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              <div className="flex flex-col">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2 flex items-center">
                  UID de Tarjeta <span className="text-destructive ml-1.5">*</span>
                </label>
                <input
                  required
                  name="card_uid"
                  placeholder="ej. 04:A1:B2..."
                  className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground/50 p-2.5 rounded text-sm focus:ring-1 focus:ring-ring focus:outline-none font-mono transition-colors"
                />
              </div>

              <UserSearchAutocomplete />

              <div className="flex flex-col">
                <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
                  Descripción de la tarjeta
                </label>
                <input
                  name="notes"
                  placeholder="Lote 001 - Negro Mate"
                  className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground/50 p-2.5 rounded text-sm focus:ring-1 focus:ring-ring focus:outline-none transition-colors"
                />
              </div>
            </div>

            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-border/40 pt-5 space-y-4 sm:space-y-0">
              <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer py-1 select-none text-foreground">
                <input
                  type="checkbox"
                  name="is_active"
                  value="true"
                  defaultChecked
                  className="w-4 h-4 rounded border-border accent-primary"
                />
                <span>Desplegar como <span className="font-bold text-accent-foreground">mapa activo</span></span>
              </label>

              <button
                disabled={isPending}
                type="submit"
                className="cursor-pointer disabled:cursor-wait bg-primary hover:bg-primary/80 text-primary-foreground px-8 py-2.5 rounded font-medium transition disabled:opacity-50 tracking-wide text-sm w-full sm:w-auto"
              >
                {isPending ? 'Procesando...' : 'Guardar Configuración'}
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Cards table */}
      <div className="bg-card border border-border rounded-lg overflow-hidden">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-muted border-b border-border text-muted-foreground whitespace-nowrap">
              <tr>
                <th className="px-6 py-4">UID de Hardware</th>
                <th className="px-6 py-4">Estado</th>
                <th className="px-6 py-4">Perfil Vinculado</th>
                <th className="px-6 py-4">Notas</th>
                <th className="px-6 py-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {paginated.map(c => (
                <tr key={c.id} className="border-b border-border/40 hover:bg-muted/30 transition-colors">
                  <td className="px-6 py-4 bg-muted/30 border-r border-border/30 align-top min-w-[280px]">
                    <div className="flex flex-col space-y-2.5">
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">Card ID:</span>
                        <div className="font-mono font-semibold text-foreground">{c.card_uid}</div>
                      </div>
                      <div>
                        <span className="text-[10px] uppercase font-bold text-muted-foreground tracking-wider">URL:</span>
                        <div
                          className="font-mono text-xs text-accent-foreground/80 truncate max-w-[280px] sm:max-w-xs block"
                          title={`${baseUrl}/nfc/${c.card_uid}`}
                        >
                          {baseUrl ? `${baseUrl}/nfc/${c.card_uid}` : `.../nfc/${c.card_uid}`}
                        </div>
                      </div>
                      <button
                        type="button"
                        onClick={() => handleCopyUrl(c.card_uid)}
                        className={`cursor-pointer self-start text-[11px] font-bold uppercase tracking-wider border px-3 py-1.5 rounded transition flex items-center space-x-1 ${
                          copiedId === c.card_uid
                            ? 'bg-accent/60 text-accent-foreground border-border'
                            : 'bg-background hover:bg-muted text-muted-foreground border-border'
                        }`}
                      >
                        {copiedId === c.card_uid ? <span>¡Copiado!</span> : <span>Copiar URL</span>}
                      </button>
                    </div>
                  </td>
                  <td className="px-6 py-4 align-middle">
                    <button
                      onClick={() => handleToggle(c.id, c.is_active ?? false)}
                      disabled={isPending}
                      className={`cursor-pointer disabled:cursor-not-allowed px-3 py-1.5 text-[11px] font-extrabold tracking-wider rounded border transition-colors disabled:opacity-50 ${
                        c.is_active
                          ? 'bg-accent/50 text-accent-foreground border-border hover:bg-accent/70'
                          : 'bg-muted text-muted-foreground/60 border-border/30 hover:bg-muted/70'
                      }`}
                    >
                      {c.is_active ? 'ACTIVA' : 'INACTIVA'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {renderProfileBadge(c.profile_id)}
                  </td>
                  <td className="px-6 py-4 text-xs text-muted-foreground font-medium max-w-[200px] truncate" title={c.notes || ''}>
                    {c.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button
                      onClick={() => handleDelete(c.id)}
                      disabled={isPending}
                      className="cursor-pointer disabled:cursor-not-allowed text-[11px] uppercase tracking-wider font-bold bg-background text-destructive px-3 py-1.5 rounded border border-destructive/30 hover:bg-destructive/10 transition"
                    >
                      Eliminar
                    </button>
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-10 text-center text-muted-foreground font-medium">
                    No hay hardware NFC registrado aún.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>

        {totalPages > 1 && (
          <div className="flex items-center justify-between px-6 py-3 border-t border-border text-sm text-muted-foreground">
            <span>
              {cards.length} tarjetas · página {page + 1} de {totalPages}
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
    </div>
  )
}
