import { Save } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { buildDashboardStatusClass } from '@/features/dashboard/dashboard-status'
import type { EditableLink, LinkIcon, SaveStatus } from '@/types/ui.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardBotonesSectionProps = {
  links: EditableLink[]
  linksStatus: SaveStatus
  onRemoveLink: (id: string) => void
  onUpdateLink: (id: string, field: 'title' | 'url' | 'icon', value: string) => void
  onAddLink: () => void
  onSaveLinks: () => Promise<void>
}

const ICON_OPTIONS: LinkIcon[] = ['instagram', 'linkedin', 'whatsapp', 'website', 'link']

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardBotonesSection({
  links,
  linksStatus,
  onRemoveLink,
  onUpdateLink,
  onAddLink,
  onSaveLinks,
}: DashboardBotonesSectionProps) {
  return (
    <div className="space-y-6">
      <div className="rounded-xl border border-border/60 p-4 flex items-start justify-between gap-4">
        <div>
          <h1 className="text-4xl font-black tracking-tight">Mis botones</h1>
          <p className="mt-1.5 text-muted-foreground text-lg">
            Gestiona los botones que se muestran en tu perfil publico.
          </p>
        </div>
        <span className="text-sm border border-border rounded-md px-3 py-1 font-semibold">{links.length} / 6</span>
      </div>

      <div className="space-y-3">
        {links.map((link, idx) => (
          <div key={link.id} className="rounded-xl border border-border/60 p-4 space-y-3">
            <div className="flex items-center justify-between gap-3">
              <p className="text-sm tracking-[0.2em] uppercase font-semibold">Boton #{idx + 1}</p>
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
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div className="space-y-2">
                <Label>Etiqueta</Label>
                <Input value={link.title} onChange={(e) => onUpdateLink(link.id, 'title', e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>URL de destino</Label>
                <div className="relative flex rounded-md shadow-sm">
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
              <div className="space-y-2 md:col-span-2">
                <Label>Icono</Label>
                <select
                  value={link.icon}
                  onChange={(e) => onUpdateLink(link.id, 'icon', e.target.value)}
                  className="w-full h-10 rounded-md border border-input bg-background px-3"
                >
                  {ICON_OPTIONS.map((icon) => (
                    <option key={icon} value={icon}>{icon}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      {linksStatus.state !== 'idle' && (
        <p className={`text-sm font-medium ${buildDashboardStatusClass(linksStatus)}`}>
          {linksStatus.message}
        </p>
      )}

      <div className="sticky bottom-4 rounded-xl border border-border/60 bg-background/90 backdrop-blur p-3 flex items-center justify-between gap-3">
        <Button variant="outline" onClick={onAddLink} disabled={linksStatus.state === 'saving'}>
          + Anadir boton
        </Button>
        <Button onClick={() => void onSaveLinks()} className="px-6" disabled={linksStatus.state === 'saving'}>
          <Save className="w-4 h-4 mr-2" />
          {linksStatus.state === 'saving' ? 'Guardando...' : 'Guardar cambios'}
        </Button>
      </div>
    </div>
  )
}
