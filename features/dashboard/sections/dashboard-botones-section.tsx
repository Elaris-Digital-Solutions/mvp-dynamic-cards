'use client'

import { useState } from 'react'
import type { ComponentType } from 'react'
import { Save, Globe, ExternalLink, MessageCircle } from 'lucide-react'
import { IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import { buildDashboardStatusClass } from '@/features/dashboard/dashboard-status'
import type { EditableLink, LinkIcon, SaveStatus } from '@/types/ui.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardBotonesSectionProps = {
  links: EditableLink[]
  linksStatus: SaveStatus
  onRemoveLink: (id: string) => void
  onUpdateLink: (id: string, field: 'title' | 'url' | 'icon', value: string) => void
  onAddLink: (data: { icon: LinkIcon; title: string; url: string }) => void
  onSaveLinks: () => Promise<void>
}

// ─── Link type config ─────────────────────────────────────────────────────────

type LinkTypeConfig = {
  label: string
  Icon: ComponentType<{ className?: string }>
  urlPrefix: string
  displayPrefix: string
  placeholder: string
  labelFixed: boolean
}

const LINK_TYPE_CONFIG: Record<string, LinkTypeConfig> = {
  instagram: {
    label: 'Instagram',
    Icon: IconBrandInstagram,
    urlPrefix: 'https://instagram.com/',
    displayPrefix: 'instagram.com/',
    placeholder: 'tuusuario',
    labelFixed: true,
  },
  linkedin: {
    label: 'LinkedIn',
    Icon: IconBrandLinkedin,
    urlPrefix: 'https://linkedin.com/in/',
    displayPrefix: 'linkedin.com/in/',
    placeholder: 'tu-nombre',
    labelFixed: true,
  },
  whatsapp: {
    label: 'WhatsApp',
    Icon: MessageCircle,
    urlPrefix: 'https://wa.me/',
    displayPrefix: 'wa.me/',
    placeholder: '521234567890',
    labelFixed: true,
  },
  website: {
    label: 'Sitio Web',
    Icon: Globe,
    urlPrefix: 'https://',
    displayPrefix: 'https://',
    placeholder: 'tudominio.com',
    labelFixed: true,
  },
  link: {
    label: '',
    Icon: ExternalLink,
    urlPrefix: 'https://',
    displayPrefix: 'https://',
    placeholder: 'tudominio.com/ruta',
    labelFixed: false,
  },
}

const TYPE_ORDER: LinkIcon[] = ['instagram', 'linkedin', 'whatsapp', 'website', 'link']

// ─── Add Link Modal ───────────────────────────────────────────────────────────

function AddLinkModal({
  open,
  onClose,
  onConfirm,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (data: { icon: LinkIcon; title: string; url: string }) => void
}) {
  const [step, setStep] = useState<'pick' | 'url'>('pick')
  const [selectedType, setSelectedType] = useState<LinkIcon | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [customLabel, setCustomLabel] = useState('')

  const resetAndClose = () => {
    setStep('pick')
    setSelectedType(null)
    setUrlInput('')
    setCustomLabel('')
    onClose()
  }

  const handleTypeSelect = (type: LinkIcon) => {
    setSelectedType(type)
    setUrlInput('')
    setCustomLabel('')
    setStep('url')
  }

  const handleBack = () => {
    setStep('pick')
    setSelectedType(null)
    setUrlInput('')
  }

  const handleConfirm = () => {
    if (!selectedType) return
    const config = LINK_TYPE_CONFIG[selectedType]
    const title = config.labelFixed ? config.label : customLabel.trim()
    if (!title || !urlInput.trim()) return
    onConfirm({ icon: selectedType, title, url: config.urlPrefix + urlInput.trim() })
    resetAndClose()
  }

  const config = selectedType ? LINK_TYPE_CONFIG[selectedType] : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'pick' ? 'Selecciona el tipo de enlace' : 'Configura el enlace'}
          </DialogTitle>
        </DialogHeader>

        {step === 'pick' && (
          <div className="grid grid-cols-3 gap-3 pt-1">
            {TYPE_ORDER.map((type) => {
              const { label, Icon } = LINK_TYPE_CONFIG[type]
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-border/60 p-4 hover:bg-muted/60 hover:border-primary/40 transition-colors"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{label || 'Otro'}</span>
                </button>
              )
            })}
          </div>
        )}

        {step === 'url' && config && (
          <div className="space-y-4 pt-1">
            <div className="flex items-center gap-2.5 px-3 py-2.5 rounded-lg bg-muted/50">
              <config.Icon className="w-4 h-4 text-muted-foreground shrink-0" />
              <span className="text-sm font-medium">{config.label || 'Otro enlace'}</span>
            </div>

            {!config.labelFixed && (
              <div className="space-y-2">
                <Label>Etiqueta</Label>
                <Input
                  value={customLabel}
                  onChange={(e) => setCustomLabel(e.target.value)}
                  placeholder="ej. Mi portafolio"
                  autoFocus
                />
              </div>
            )}

            <div className="space-y-2">
              <Label>URL de destino</Label>
              <div className="flex rounded-md shadow-sm">
                <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground text-xs font-medium whitespace-nowrap">
                  {config.displayPrefix}
                </span>
                <Input
                  value={urlInput}
                  onChange={(e) => setUrlInput(e.target.value.replace(/\s+/g, ''))}
                  placeholder={config.placeholder}
                  className="rounded-l-none"
                  autoFocus={config.labelFixed}
                  onKeyDown={(e) => e.key === 'Enter' && handleConfirm()}
                />
              </div>
            </div>

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                Atrás
              </Button>
              <Button
                size="sm"
                onClick={handleConfirm}
                disabled={!urlInput.trim() || (!config.labelFixed && !customLabel.trim())}
              >
                Añadir enlace
              </Button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  )
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardBotonesSection({
  links,
  linksStatus,
  onRemoveLink,
  onUpdateLink,
  onAddLink,
  onSaveLinks,
}: DashboardBotonesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 p-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Mis botones</h1>
          <p className="mt-1.5 text-muted-foreground text-lg">
            Gestiona los botones que se muestran en tu perfil publico.
          </p>
        </div>
        <span className="text-sm border border-border rounded-md px-3 py-1 font-semibold">
          {links.length} / 6
        </span>
      </div>

      <div className="space-y-3">
        {links.map((link) => {
          const config = LINK_TYPE_CONFIG[link.icon] ?? LINK_TYPE_CONFIG.link
          const { Icon } = config
          const isCustom = link.icon === 'link'

          return (
            <div key={link.id} className="rounded-xl border border-border/60 p-4 space-y-3">
              <div className="flex items-center justify-between gap-3">
                <div className="flex items-center gap-2">
                  <Icon className="w-4 h-4 text-muted-foreground" />
                  <p className="text-sm tracking-[0.15em] uppercase font-semibold">
                    {config.label || link.title || 'Otro'}
                  </p>
                </div>
                <Button
                  type="button"
                  variant="outline"
                  size="sm"
                  onClick={() => onRemoveLink(link.id)}
                  disabled={linksStatus.state === 'saving'}
                >
                  Eliminar
                </Button>
              </div>

              <div className="space-y-3">
                {isCustom && (
                  <div className="space-y-2">
                    <Label>Etiqueta</Label>
                    <Input
                      value={link.title}
                      onChange={(e) => onUpdateLink(link.id, 'title', e.target.value)}
                    />
                  </div>
                )}
                <div className="space-y-2">
                  <Label>URL de destino</Label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground text-sm font-medium">
                      https://
                    </span>
                    <Input
                      value={link.url.replace(/^https?:\/\//i, '')}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^https?:\/\//i, '').replace(/\s+/g, '')
                        onUpdateLink(link.id, 'url', val ? `https://${val}` : '')
                      }}
                      placeholder="tudominio.com/ruta"
                      className="rounded-l-none"
                    />
                  </div>
                </div>
              </div>
            </div>
          )
        })}
      </div>

      {linksStatus.state !== 'idle' && (
        <p className={`text-sm font-medium ${buildDashboardStatusClass(linksStatus)}`}>
          {linksStatus.message}
        </p>
      )}

      <div className="sticky bottom-4 rounded-xl border border-border/60 bg-background/90 backdrop-blur p-3 flex items-center justify-between gap-3">
        <Button
          variant="outline"
          onClick={() => setModalOpen(true)}
          disabled={linksStatus.state === 'saving' || links.length >= 6}
        >
          + Añadir botón
        </Button>
        <Button
          onClick={() => void onSaveLinks()}
          className="px-6"
          disabled={linksStatus.state === 'saving'}
        >
          <Save className="w-4 h-4 mr-2" />
          {linksStatus.state === 'saving' ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>

      <AddLinkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={onAddLink}
      />
    </div>
  )
}
