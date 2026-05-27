'use client'

import { useEffect, useState } from 'react'
import { AlertTriangle, X } from 'lucide-react'
import type { InfraLimits } from '@/lib/utils/infra-limits'

const STORAGE_KEY = 'infra-alert-dismissed'

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024)       return `${(bytes / 1024).toFixed(0)} KB`
  if (bytes < 1024 * 1024 * 1024) return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  return `${(bytes / (1024 * 1024 * 1024)).toFixed(2)} GB`
}

export function InfraAlert({ supabase, cloudinary }: InfraLimits) {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    if (!supabase.alert && !cloudinary.alert) return

    const today     = new Date().toISOString().split('T')[0]
    const dismissed = localStorage.getItem(STORAGE_KEY)
    if (dismissed !== today) setVisible(true)
  }, [supabase.alert, cloudinary.alert])

  function dismiss() {
    const today = new Date().toISOString().split('T')[0]
    localStorage.setItem(STORAGE_KEY, today)
    setVisible(false)
  }

  if (!visible) return null

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="bg-card border border-border rounded-xl p-6 max-w-md w-full mx-4 shadow-2xl">

        <div className="flex items-start justify-between gap-3 mb-4">
          <div className="flex items-center gap-2">
            <AlertTriangle className="w-5 h-5 text-amber-500 shrink-0" />
            <h2 className="font-semibold text-foreground">Límite de infraestructura próximo</h2>
          </div>
          <button
            onClick={dismiss}
            className="text-muted-foreground hover:text-foreground transition-colors mt-0.5"
            aria-label="Cerrar"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="space-y-4 text-sm">
          {cloudinary.alert && (
            <ServiceAlert
              label="Imágenes (Cloudinary)"
              percent={cloudinary.percent}
              detail={`${cloudinary.usedCredits.toFixed(1)} de ${cloudinary.limitCredits} créditos utilizados`}
            />
          )}
          {supabase.alert && (
            <ServiceAlert
              label="Almacenamiento de PDFs (Supabase)"
              percent={supabase.percent}
              detail={`${formatBytes(supabase.usedBytes)} de ${formatBytes(supabase.limitBytes)} utilizados`}
            />
          )}
        </div>

        <p className="mt-5 text-xs text-muted-foreground">
          Consultá al equipo técnico para planificar el upgrade antes de que se alcance el límite.
        </p>

        <div className="mt-5 flex justify-end">
          <button
            onClick={dismiss}
            className="text-sm font-medium text-foreground hover:text-muted-foreground transition-colors"
          >
            Entendido — no mostrar hasta mañana
          </button>
        </div>
      </div>
    </div>
  )
}

function ServiceAlert({
  label,
  percent,
  detail,
}: {
  label: string
  percent: number
  detail: string
}) {
  const pct = Math.round(percent * 100)

  return (
    <div className="rounded-lg border border-amber-500/30 bg-amber-500/5 p-3 space-y-2">
      <div className="flex items-center justify-between">
        <span className="font-medium text-foreground">{label}</span>
        <span className="text-amber-500 font-semibold">{pct}%</span>
      </div>
      <div className="h-1.5 w-full rounded-full bg-border overflow-hidden">
        <div
          className="h-full rounded-full bg-amber-500 transition-all"
          style={{ width: `${Math.min(pct, 100)}%` }}
        />
      </div>
      <p className="text-xs text-muted-foreground">{detail}</p>
    </div>
  )
}
