'use client'

import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateCardProps {
  id: string
  name: string
  category: string
  description: string
  colors: {
    background: string
    cardBg: string
    text: string
    border: string
    accent: string
  }
  isSelected: boolean
  onSelect: (id: string) => void
  /** Optional preview data — defaults to placeholder text */
  previewName?: string
  previewTitle?: string
  previewImage?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TemplateCard({
  id,
  name,
  category,
  description,
  colors,
  isSelected,
  onSelect,
  previewName = 'Nombre',
  previewTitle = 'Profesión',
  previewImage,
}: TemplateCardProps) {
  return (
    <div
      className={`relative rounded-2xl border-2 transition-all ${
        isSelected
          ? 'border-white/30 ring-2 ring-white/20'
          : 'border-border/50 hover:border-border'
      }`}
    >
      {/* Preview */}
      <div
        style={{ backgroundColor: colors.background, color: colors.text }}
        className="p-6 rounded-xl mb-4"
      >
        <div
          style={{ backgroundColor: colors.cardBg, borderColor: colors.border }}
          className="border rounded-lg p-4"
        >
          <div className="flex flex-col items-center gap-3">
            <Avatar className="h-12 w-12">
              <AvatarImage src={previewImage} />
              <AvatarFallback>{previewName.charAt(0)}</AvatarFallback>
            </Avatar>
            <div className="text-center">
              <p style={{ color: colors.text }} className="font-semibold">{previewName}</p>
              <p style={{ color: colors.text }} className="text-sm opacity-75">{previewTitle}</p>
            </div>
          </div>

          <div className="mt-4 space-y-2">
            {['LinkedIn', 'WhatsApp'].map((label) => (
              <div
                key={label}
                style={{ backgroundColor: colors.border, color: colors.text }}
                className="rounded px-3 py-2 text-center text-sm font-medium"
              >
                {label}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Info */}
      <div className="px-6 pb-6 space-y-4">
        <div>
          <p className="text-xs font-medium text-muted-foreground uppercase mb-1">{category}</p>
          <h3 className="text-lg font-bold">{name}</h3>
          <p className="text-sm text-muted-foreground mt-2">{description}</p>
        </div>

        <Button
          onClick={() => onSelect(id)}
          variant={isSelected ? 'default' : 'outline'}
          className="w-full"
        >
          {isSelected ? 'SELECCIONADA' : 'APLICAR'}
        </Button>
      </div>
    </div>
  )
}
