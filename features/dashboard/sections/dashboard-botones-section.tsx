'use client'

import { useState, useRef } from 'react'
import type { ComponentType } from 'react'
import { Save, Globe, MessageCircle, GripVertical, Lock, Loader2, FileText, Upload, X, Pencil, Check } from 'lucide-react'
import { IconBrandInstagram, IconBrandLinkedin } from '@tabler/icons-react'
import {
  DndContext,
  closestCenter,
  type DragEndEvent,
  PointerSensor,
  TouchSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core'
import {
  SortableContext,
  useSortable,
  verticalListSortingStrategy,
  arrayMove,
} from '@dnd-kit/sortable'
import { CSS } from '@dnd-kit/utilities'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog'
import type { EditableLink, LinkIcon, SaveStatus } from '@/types/ui.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardBotonesSectionProps = {
  links: EditableLink[]
  linksStatus: SaveStatus
  onRemoveLink: (id: string) => void
  onUpdateLink: (id: string, field: 'title' | 'url' | 'icon', value: string) => void
  onAddLink: (data: { icon: LinkIcon; title: string; url: string }) => void
  onSaveLinks: () => Promise<void>
  onReorderLinks: (orderedIds: string[]) => void
  isPdfUploading: boolean
  deletingPdfId: string | null
  onPdfUpload: (file: File, label: string) => Promise<void>
  onPdfDelete: (buttonId: string) => Promise<void>
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatBytes(bytes: number): string {
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(0)} KB`
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
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
  link: {
    label: 'Sitio Web',
    Icon: Globe,
    urlPrefix: 'https://',
    displayPrefix: 'https://',
    placeholder: 'tudominio.com',
    labelFixed: false,
  },
  brochure: {
    label: 'Brochure',
    Icon: FileText,
    urlPrefix: '',
    displayPrefix: '',
    placeholder: '',
    labelFixed: true,
  },
}

// WhatsApp excluido — se gestiona desde Datos personales
const TYPE_ORDER: LinkIcon[] = ['instagram', 'linkedin', 'link', 'brochure']

// ─── Sortable Button Row ──────────────────────────────────────────────────────

function SortableButtonRow({
  link,
  linksStatus,
  onRemoveLink,
  onUpdateLink,
  deletingPdfId,
}: {
  link: EditableLink
  linksStatus: SaveStatus
  onRemoveLink: (id: string) => void
  onUpdateLink: (id: string, field: 'title' | 'url' | 'icon', value: string) => void
  deletingPdfId?: string | null
}) {
  const [isEditing, setIsEditing] = useState(false)

  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: link.id,
  })

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  }

  const config = LINK_TYPE_CONFIG[link.icon] ?? LINK_TYPE_CONFIG.link
  const { Icon } = config
  const isCustom = link.icon === 'link' || link.icon === 'website'
  const isBrochure = link.icon === 'brochure'
  const displayUrl = link.url.replace(/^https?:\/\//i, '')

  return (
    <div
      ref={setNodeRef}
      style={style}
      className={`rounded-xl border border-border/60 p-4 space-y-3 bg-background ${isDragging ? 'opacity-50' : ''}`}
    >
      <div className="flex items-center justify-between gap-3">
        <div className="flex items-center gap-2 min-w-0">
          <button
            type="button"
            className="touch-none cursor-grab active:cursor-grabbing text-muted-foreground hover:text-foreground transition-colors shrink-0"
            {...attributes}
            {...listeners}
          >
            <GripVertical className="w-4 h-4" />
          </button>
          <Icon className="w-4 h-4 text-muted-foreground shrink-0" />
          <p className="text-sm tracking-[0.15em] uppercase font-semibold truncate">
            {config.label || link.title || 'Otro'}
          </p>
          {link.isManaged && (
            <span className="flex items-center gap-1 text-xs text-muted-foreground shrink-0">
              <Lock className="w-3 h-3" />
              Datos personales
            </span>
          )}
        </div>
        {!link.isManaged && (
          <div className="flex items-center gap-2 shrink-0">
            <Button
              type="button"
              variant={isEditing ? 'default' : 'outline'}
              size="sm"
              onClick={() => setIsEditing((v) => !v)}
              disabled={linksStatus.state === 'saving'}
            >
              {isEditing
                ? <><Check className="w-3.5 h-3.5 mr-1" />Listo</>
                : <><Pencil className="w-3.5 h-3.5 mr-1" />Editar</>}
            </Button>
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => onRemoveLink(link.id)}
              disabled={linksStatus.state === 'saving' || deletingPdfId === link.id}
            >
              {deletingPdfId === link.id
                ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                : 'Eliminar'}
            </Button>
          </div>
        )}
      </div>

      {!link.isManaged && (
        <div className="space-y-3">
          {isEditing ? (
            <>
              {(isCustom || isBrochure) && (
                <div className="space-y-2">
                  <Label>Nombre del botón</Label>
                  <Input
                    value={link.title}
                    onChange={(e) => onUpdateLink(link.id, 'title', e.target.value)}
                    autoFocus
                  />
                </div>
              )}
              {!isBrochure && (
                <div className="space-y-2">
                  <Label>URL de destino</Label>
                  <div className="flex rounded-md shadow-sm">
                    <span className="inline-flex items-center rounded-l-md border border-r-0 border-input bg-muted px-3 text-muted-foreground text-sm font-medium">
                      https://
                    </span>
                    <Input
                      value={displayUrl}
                      onChange={(e) => {
                        const val = e.target.value.replace(/^https?:\/\//i, '').replace(/\s+/g, '')
                        onUpdateLink(link.id, 'url', val ? `https://${val}` : '')
                      }}
                      placeholder="tudominio.com/ruta"
                      className="rounded-l-none"
                      autoFocus={!isCustom}
                    />
                  </div>
                </div>
              )}
            </>
          ) : (
            <>
              {isBrochure && link.title && (
                <p className="text-xs text-muted-foreground truncate pl-1">{link.title}</p>
              )}
              {!isBrochure && displayUrl && (
                <p className="text-xs text-muted-foreground truncate pl-1">
                  https://{displayUrl}
                </p>
              )}
            </>
          )}
        </div>
      )}
    </div>
  )
}

// ─── Add Link Modal ───────────────────────────────────────────────────────────

function AddLinkModal({
  open,
  onClose,
  onConfirm,
  onPdfUpload,
  isPdfUploading,
}: {
  open: boolean
  onClose: () => void
  onConfirm: (data: { icon: LinkIcon; title: string; url: string }) => void
  onPdfUpload: (file: File, label: string) => Promise<void>
  isPdfUploading: boolean
}) {
  const [step, setStep] = useState<'pick' | 'url' | 'brochure'>('pick')
  const [selectedType, setSelectedType] = useState<LinkIcon | null>(null)
  const [urlInput, setUrlInput] = useState('')
  const [customLabel, setCustomLabel] = useState('')
  const [pdfFile, setPdfFile] = useState<File | null>(null)
  const [brochureLabel, setBrochureLabel] = useState('Ver brochure')
  const pdfInputRef = useRef<HTMLInputElement>(null)

  const resetAndClose = () => {
    setStep('pick')
    setSelectedType(null)
    setUrlInput('')
    setCustomLabel('')
    setPdfFile(null)
    setBrochureLabel('Ver brochure')
    onClose()
  }

  const handleTypeSelect = (type: LinkIcon) => {
    setSelectedType(type)
    setUrlInput('')
    setCustomLabel('')
    setPdfFile(null)
    setBrochureLabel('Ver brochure')
    setStep(type === 'brochure' ? 'brochure' : 'url')
  }

  const handleBack = () => {
    setStep('pick')
    setSelectedType(null)
    setUrlInput('')
    setPdfFile(null)
    setBrochureLabel('Ver brochure')
  }

  const handleConfirm = () => {
    if (!selectedType) return
    const config = LINK_TYPE_CONFIG[selectedType]
    const title = config.labelFixed ? config.label : customLabel.trim()
    if (!title || !urlInput.trim()) return
    onConfirm({ icon: selectedType, title, url: config.urlPrefix + urlInput.trim() })
    resetAndClose()
  }

  const handlePdfFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.type !== 'application/pdf') {
      alert('Solo se aceptan archivos PDF.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      alert('El archivo no puede superar los 10 MB.')
      return
    }
    setPdfFile(file)
    if (pdfInputRef.current) pdfInputRef.current.value = ''
  }

  const handleBrochureConfirm = async () => {
    if (!pdfFile) return
    try {
      await onPdfUpload(pdfFile, brochureLabel.trim() || 'Ver brochure')
      resetAndClose()
    } catch {
      // onPdfUpload maneja el error internamente — no cerrar el modal
    }
  }

  const config = selectedType ? LINK_TYPE_CONFIG[selectedType] : null

  return (
    <Dialog open={open} onOpenChange={(o) => !o && resetAndClose()}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>
            {step === 'pick' && 'Selecciona el tipo de enlace'}
            {step === 'url' && 'Configura el enlace'}
            {step === 'brochure' && 'Subir brochure'}
          </DialogTitle>
          <DialogDescription className="sr-only">
            {step === 'pick' && 'Elige el tipo de botón que quieres añadir a tu perfil.'}
            {step === 'url' && 'Introduce la URL de destino para este botón.'}
            {step === 'brochure' && 'Sube un archivo PDF para mostrar como brochure.'}
          </DialogDescription>
        </DialogHeader>

        {step === 'pick' && (
          <div className="grid grid-cols-2 gap-3 pt-1">
            {TYPE_ORDER.map((type) => {
              const { label, Icon } = LINK_TYPE_CONFIG[type]
              return (
                <button
                  key={type}
                  onClick={() => handleTypeSelect(type)}
                  className="flex flex-col items-center gap-2.5 rounded-xl border border-border/60 p-4 hover:bg-muted/60 hover:border-primary/40 transition-colors"
                >
                  <Icon className="w-6 h-6" />
                  <span className="text-sm font-medium">{label}</span>
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

        {step === 'brochure' && (
          <div className="space-y-4 pt-1">
            <div className="space-y-2">
              <Label>Nombre del botón</Label>
              <Input
                value={brochureLabel}
                onChange={(e) => setBrochureLabel(e.target.value)}
                placeholder="ej. Ver brochure"
              />
            </div>
            {!pdfFile ? (
              <button
                type="button"
                onClick={() => pdfInputRef.current?.click()}
                className="w-full flex flex-col items-center justify-center gap-3 rounded-xl border-2 border-dashed border-border/60 p-8 text-sm text-muted-foreground hover:border-primary/40 hover:bg-muted/30 transition-colors"
              >
                <Upload className="w-8 h-8" />
                <span>Seleccionar PDF</span>
                <span className="text-xs">Máximo 10 MB</span>
              </button>
            ) : (
              <div className="flex items-center justify-between gap-3 p-3 rounded-lg bg-muted/50">
                <div className="flex items-center gap-2 text-sm text-muted-foreground min-w-0">
                  <FileText className="w-4 h-4 shrink-0" />
                  <span className="truncate">{pdfFile.name}</span>
                  <span className="shrink-0 text-xs">— {formatBytes(pdfFile.size)}</span>
                </div>
                <button
                  type="button"
                  onClick={() => setPdfFile(null)}
                  className="text-muted-foreground hover:text-foreground transition-colors shrink-0"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            )}

            <input
              ref={pdfInputRef}
              type="file"
              accept="application/pdf"
              className="hidden"
              onChange={handlePdfFileChange}
            />

            <div className="flex gap-2 justify-end pt-1">
              <Button variant="ghost" size="sm" onClick={handleBack}>
                Atrás
              </Button>
              <Button
                size="sm"
                onClick={() => void handleBrochureConfirm()}
                disabled={!pdfFile || isPdfUploading}
              >
                {isPdfUploading
                  ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  : 'Subir brochure'
                }
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
  onReorderLinks,
  isPdfUploading,
  deletingPdfId,
  onPdfUpload,
  onPdfDelete,
}: DashboardBotonesSectionProps) {
  const [modalOpen, setModalOpen] = useState(false)

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(TouchSensor, {
      activationConstraint: { delay: 250, tolerance: 5 },
    })
  )

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event
    if (over && active.id !== over.id) {
      const oldIndex = links.findIndex(l => l.id === active.id)
      const newIndex = links.findIndex(l => l.id === over.id)
      const reordered = arrayMove(links, oldIndex, newIndex)
      void onReorderLinks(reordered.map(l => l.id))
    }
  }

  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 p-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Enlaces y redes</h1>
          <p className="mt-1.5 text-muted-foreground text-lg">
            Gestiona los botones que se muestran en tu perfil publico.
          </p>
        </div>
        <span className="text-sm border border-border rounded-md px-3 py-1 font-semibold">
          {links.length} / 6
        </span>
      </div>

      <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
        <SortableContext items={links.map(l => l.id)} strategy={verticalListSortingStrategy}>
          <div className="space-y-3">
            {links.length === 0 ? (
              <p className="text-sm text-muted-foreground text-center py-6">
                Aún no tienes enlaces configurados. Añade tu primer botón para que otros puedan contactarte.
              </p>
            ) : (
              links.map((link) => (
                <SortableButtonRow
                  key={link.id}
                  link={link}
                  linksStatus={linksStatus}
                  onRemoveLink={link.icon === 'brochure' ? () => void onPdfDelete(link.id) : onRemoveLink}
                  onUpdateLink={onUpdateLink}
                  deletingPdfId={deletingPdfId}
                />
              ))
            )}
          </div>
        </SortableContext>
      </DndContext>

      {linksStatus.state === 'error' && (
        <p className="text-sm font-medium text-red-400">
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
          {linksStatus.state === 'saving'
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <Save className="w-4 h-4 mr-2" />}
          {linksStatus.state === 'saving' ? 'Guardando...' : 'Publicar cambios'}
        </Button>
      </div>

      <AddLinkModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        onConfirm={onAddLink}
        onPdfUpload={onPdfUpload}
        isPdfUploading={isPdfUploading}
      />
    </div>
  )
}
