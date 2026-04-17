import { Fingerprint } from 'lucide-react'

interface NFCBadgeProps {
  label?: string
}

export function NFCBadge({ label = 'Comparte tu perfil con un solo toque' }: NFCBadgeProps) {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm">
      <Fingerprint className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
        {label}
      </span>
    </div>
  )
}
