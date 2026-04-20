'use client'

import { useEffect, useState, useTransition } from 'react'
import { submitLead } from '@/lib/actions/leads'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from '@/components/ui/dialog'

interface LeadCapturePopupProps {
  profileId: string
  ownerName: string
  isLightTemplate: boolean
}

export function LeadCapturePopup({ profileId, ownerName, isLightTemplate }: LeadCapturePopupProps) {
  const [open, setOpen] = useState(false)
  const [submitted, setSubmitted] = useState(false)
  const [error, setError] = useState('')
  const [name, setName] = useState('')
  const [phone, setPhone] = useState('')
  const [consented, setConsented] = useState(false)
  const [isPending, startTransition] = useTransition()

  const storageKey = `veltrix_lead_shown_${profileId}`

  useEffect(() => {
    if (typeof window === 'undefined') return
    if (localStorage.getItem(storageKey)) return

    const timer = setTimeout(() => setOpen(true), 4000)
    return () => clearTimeout(timer)
  }, [storageKey])

  const handleClose = (nextOpen: boolean) => {
    if (!nextOpen) {
      localStorage.setItem(storageKey, '1')
    }
    setOpen(nextOpen)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError('')

    const formData = new FormData()
    formData.set('profile_id', profileId)
    formData.set('visitor_name', name)
    formData.set('visitor_phone', phone)
    formData.set('consented', consented ? 'true' : 'false')

    startTransition(async () => {
      const res = await submitLead(formData)
      if ('error' in res) {
        setError(res.error)
      } else {
        setSubmitted(true)
        localStorage.setItem(storageKey, '1')
        setTimeout(() => setOpen(false), 2200)
      }
    })
  }

  const bg     = isLightTemplate ? '#ffffff' : '#09101e'
  const border = isLightTemplate ? '#d0dceb' : '#1e2a3d'
  const text   = isLightTemplate ? '#1a2435' : '#e4e8f0'
  const muted  = isLightTemplate ? '#4b5a70' : '#8a96ae'
  const btnBg  = isLightTemplate ? '#101b2e' : '#f2f5f9'
  const btnTxt = isLightTemplate ? '#f4f7fb' : '#111827'

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent
        style={{ backgroundColor: bg, borderColor: border, color: text }}
        className="rounded-2xl border shadow-2xl max-w-sm w-[92vw] px-6 py-6"
      >
        <DialogHeader className="text-center space-y-1">
          <DialogTitle style={{ color: text }} className="text-xl font-bold leading-tight">
            ¿Te gustaría dejarle tus datos a <span className="whitespace-nowrap">{ownerName}?</span>
          </DialogTitle>
          <DialogDescription style={{ color: muted }} className="text-sm">
            Así podrá contactarte directamente.
          </DialogDescription>
        </DialogHeader>

        {submitted ? (
          <div className="mt-4 text-center space-y-1">
            <p className="text-2xl">✓</p>
            <p style={{ color: text }} className="font-semibold">¡Datos enviados!</p>
            <p style={{ color: muted }} className="text-sm">{ownerName} podrá contactarte pronto.</p>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="mt-4 space-y-3">
            <div>
              <label style={{ color: muted }} className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Tu nombre
              </label>
              <input
                required
                value={name}
                onChange={e => setName(e.target.value)}
                placeholder="Juan García"
                style={{ backgroundColor: isLightTemplate ? '#f4f7fb' : '#111827', borderColor: border, color: text }}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:opacity-40"
              />
            </div>

            <div>
              <label style={{ color: muted }} className="block text-xs font-semibold uppercase tracking-wider mb-1">
                Tu teléfono
              </label>
              <input
                required
                type="tel"
                value={phone}
                onChange={e => setPhone(e.target.value)}
                placeholder="+52 55 1234 5678"
                style={{ backgroundColor: isLightTemplate ? '#f4f7fb' : '#111827', borderColor: border, color: text }}
                className="w-full rounded-lg border px-3 py-2 text-sm outline-none focus:ring-1 focus:ring-blue-500 placeholder:opacity-40"
              />
            </div>

            <label className="flex items-start gap-2.5 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={consented}
                onChange={e => setConsented(e.target.checked)}
                className="mt-0.5 w-4 h-4 rounded border-gray-400 accent-blue-600 cursor-pointer"
              />
              <span style={{ color: muted }} className="text-xs leading-relaxed">
                Acepto compartir mis datos con {ownerName} para que pueda contactarme.
              </span>
            </label>

            {error && (
              <p className="text-xs text-red-500">{error}</p>
            )}

            <button
              type="submit"
              disabled={isPending || !consented}
              style={{ backgroundColor: btnBg, color: btnTxt }}
              className="w-full rounded-xl py-2.5 text-sm font-bold uppercase tracking-wide transition-opacity disabled:opacity-40 mt-1"
            >
              {isPending ? 'Enviando...' : 'Enviar mis datos'}
            </button>
          </form>
        )}
      </DialogContent>
    </Dialog>
  )
}
