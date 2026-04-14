import { Sparkles } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { TEMPLATES } from '@/lib/constants'
import { buildDashboardStatusClass } from '@/features/dashboard/dashboard-status'
import type { SaveStatus } from '@/types/ui.types'

// ─── Types ────────────────────────────────────────────────────────────────────

type DashboardPlantillaSectionProps = {
  /** Display name shown in template preview cards */
  userName?: string
  /** Title shown in template preview cards */
  userTitle?: string
  /** Currently selected template ID */
  selectedTemplate: string
  /** Human-readable name of the active template */
  activeTemplateName: string
  templateStatus: SaveStatus
  onTemplateSelect: (templateId: string) => Promise<void>
}

// ─── Component ────────────────────────────────────────────────────────────────

export function DashboardPlantillaSection({
  userName,
  userTitle,
  selectedTemplate,
  activeTemplateName,
  templateStatus,
  onTemplateSelect,
}: DashboardPlantillaSectionProps) {
  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="relative overflow-hidden rounded-2xl border border-border/60 bg-[linear-gradient(145deg,rgba(255,255,255,0.04),rgba(16,34,63,0.08))] p-5 md:p-8">
        <div className="pointer-events-none absolute -right-20 -bottom-20 h-48 w-48 rounded-full bg-primary/25 blur-3xl" />
        <div className="relative flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 rounded-full border border-border/70 bg-background/70 px-3 py-1.5">
              <Sparkles className="h-3.5 w-3.5 text-muted-foreground" />
              <span className="text-xs font-semibold text-muted-foreground tracking-[0.2em] uppercase">
                Direccion visual
              </span>
            </div>
            <h1 className="mt-3 text-4xl font-black tracking-tight">Plantillas</h1>
            <p className="mt-2 text-muted-foreground text-lg">
              Elige una identidad visual para tu tarjeta. Cada plantilla cambia ritmo, contraste y
              personalidad de tu perfil publico.
            </p>
          </div>

          <div className="rounded-xl border border-border/70 bg-background/70 px-4 py-3 md:min-w-48">
            <p className="text-xs text-muted-foreground tracking-[0.18em] uppercase">Plantilla activa</p>
            <p className="mt-1 text-2xl font-bold">{activeTemplateName}</p>
          </div>
        </div>
      </div>

      {/* Template grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
        {(Object.entries(TEMPLATES) as Array<[string, (typeof TEMPLATES)[keyof typeof TEMPLATES]]>).map(
          ([id, template]) => {
            const isSelected = selectedTemplate === id
            const isLight = template.textStyle === 'dark'
            return (
              <div
                key={id}
                className={`rounded-2xl border p-4 transition-all ${
                  isSelected
                    ? 'border-white/70 bg-white/[0.06] shadow-[0_0_0_1px_rgba(255,255,255,0.35)]'
                    : 'border-border/60 bg-background/50 hover:border-border hover:bg-background/70'
                }`}
              >
                <div style={{ backgroundColor: template.colors.background }} className="rounded-xl border border-white/10 p-3">
                  <div
                    style={{ backgroundColor: template.colors.cardBg, borderColor: template.colors.border }}
                    className="rounded-lg border p-3"
                  >
                    <div className="flex items-start gap-3">
                      <div
                        style={{ borderColor: template.colors.border }}
                        className={`h-10 w-10 rounded-full border ${isLight ? 'bg-black/5' : 'bg-white/5'}`}
                      />
                      <div className="min-w-0">
                        <p className={`text-sm font-semibold truncate ${isLight ? 'text-black' : 'text-white'}`}>
                          {userName || 'Sin nombre'}
                        </p>
                        <p className={`text-xs truncate ${isLight ? 'text-black/60' : 'text-white/70'}`}>
                          {userTitle || 'Sin cargo'}
                        </p>
                      </div>
                    </div>
                    <div className="mt-3 space-y-2">
                      {['LinkedIn', 'WhatsApp'].map((label) => (
                        <div
                          key={label}
                          style={{ borderColor: template.colors.border }}
                          className={`h-8 rounded-md border px-3 flex items-center text-xs font-semibold ${isLight ? 'text-black/70 bg-black/5' : 'text-white/80 bg-white/5'}`}
                        >
                          {label}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="mt-4">
                  <p className="inline-flex rounded-full border border-border/70 bg-background/70 px-2.5 py-1 text-[11px] uppercase tracking-[0.18em] text-muted-foreground font-semibold">
                    {template.category}
                  </p>
                  <h3 className="text-3xl font-bold mt-2">{template.name}</h3>
                  <p className="text-muted-foreground mt-1.5 text-lg">{template.description}</p>
                  <Button
                    onClick={() => void onTemplateSelect(id)}
                    className={`mt-4 h-8 px-4 rounded-lg text-xs tracking-[0.14em] uppercase font-semibold ${
                      isSelected ? '' : 'border-border/70 bg-background/40 hover:bg-primary/15 hover:text-foreground'
                    }`}
                    variant={isSelected ? 'default' : 'outline'}
                    disabled={templateStatus.state === 'saving'}
                  >
                    {isSelected ? 'Seleccionada' : 'Aplicar'}
                  </Button>
                </div>
              </div>
            )
          }
        )}
      </div>

      {templateStatus.state !== 'idle' && (
        <p className={`text-sm font-medium ${buildDashboardStatusClass(templateStatus)}`}>
          {templateStatus.message}
        </p>
      )}
    </div>
  )
}
