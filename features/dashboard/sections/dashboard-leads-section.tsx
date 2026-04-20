'use client'

import { useState, useTransition } from 'react'
import { Users, Trash2, Phone } from 'lucide-react'
import { deleteLead } from '@/lib/actions/leads'
import type { Database } from '@/types/database'

type Lead = Database['public']['Tables']['leads']['Row']

interface DashboardLeadsSectionProps {
  leads: Lead[]
}

export function DashboardLeadsSection({ leads: initialLeads }: DashboardLeadsSectionProps) {
  const [leads, setLeads] = useState<Lead[]>(initialLeads)
  const [isPending, startTransition] = useTransition()
  const [deletingId, setDeletingId] = useState<string | null>(null)

  const handleDelete = (id: string) => {
    setDeletingId(id)
    startTransition(async () => {
      const res = await deleteLead(id)
      if (!('error' in res)) {
        setLeads(prev => prev.filter(l => l.id !== id))
      }
      setDeletingId(null)
    })
  }

  return (
    <div>
      <div className="flex items-center gap-2 mb-6">
        <Users className="w-5 h-5 text-muted-foreground" />
        <div>
          <h2 className="text-2xl font-bold">Mis contactos</h2>
          <p className="text-sm text-muted-foreground mt-0.5">
            Personas que te dejaron sus datos desde tu tarjeta.
          </p>
        </div>
      </div>

      {leads.length === 0 ? (
        <div className="border border-dashed rounded-xl p-10 text-center text-muted-foreground space-y-2">
          <Users className="w-8 h-8 mx-auto opacity-30" />
          <p className="text-sm">Aún no tienes contactos.</p>
          <p className="text-xs">Cuando alguien te deje sus datos desde tu tarjeta, aparecerán aquí.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {leads.map(lead => (
            <div
              key={lead.id}
              className="flex items-center justify-between gap-4 rounded-xl border border-border bg-background px-4 py-3.5"
            >
              <div className="flex items-center gap-3 min-w-0">
                <div className="w-9 h-9 rounded-full bg-muted flex items-center justify-center shrink-0 text-sm font-bold uppercase text-muted-foreground">
                  {lead.visitor_name.charAt(0)}
                </div>
                <div className="min-w-0">
                  <p className="font-semibold text-sm truncate">{lead.visitor_name}</p>
                  <a
                    href={`tel:${lead.visitor_phone}`}
                    className="flex items-center gap-1 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <Phone className="w-3 h-3" />
                    {lead.visitor_phone}
                  </a>
                </div>
              </div>

              <div className="flex items-center gap-3 shrink-0">
                <span className="text-xs text-muted-foreground hidden sm:block">
                  {new Date(lead.created_at).toLocaleDateString('es', {
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric',
                  })}
                </span>
                <button
                  onClick={() => handleDelete(lead.id)}
                  disabled={isPending && deletingId === lead.id}
                  className="text-muted-foreground hover:text-destructive transition-colors disabled:opacity-40"
                  aria-label="Eliminar contacto"
                >
                  <Trash2 className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
