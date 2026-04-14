'use client'

import { TemplateCard } from './template-card'
import { TEMPLATES } from '@/lib/constants'

// ─── Types ────────────────────────────────────────────────────────────────────

interface TemplateGridProps {
  /** Currently selected template ID */
  selectedTemplate: string
  /** Called when the user selects a template */
  onSelect: (templateId: string) => void
  /** Optional: preview name shown in template cards */
  previewName?: string
  /** Optional: preview title shown in template cards */
  previewTitle?: string
}

// ─── Component ────────────────────────────────────────────────────────────────

export function TemplateGrid({
  selectedTemplate,
  onSelect,
  previewName,
  previewTitle,
}: TemplateGridProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {(Object.entries(TEMPLATES) as Array<[string, (typeof TEMPLATES)[keyof typeof TEMPLATES]]>).map(
        ([key, template]) => (
          <TemplateCard
            key={key}
            id={key}
            name={template.name}
            category={template.category}
            description={template.description}
            colors={template.colors}
            isSelected={selectedTemplate === key}
            onSelect={onSelect}
            previewName={previewName}
            previewTitle={previewTitle}
          />
        )
      )}
    </div>
  )
}
