import { Fingerprint } from 'lucide-react'

export function NFCBadge() {
  return (
    <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-border/50 bg-background/50 backdrop-blur-sm">
      <Fingerprint className="w-4 h-4 text-muted-foreground" />
      <span className="text-xs font-medium text-muted-foreground tracking-widest uppercase">
        Comparte tu perfil con un solo toque
      </span>
    </div>
  )
}
