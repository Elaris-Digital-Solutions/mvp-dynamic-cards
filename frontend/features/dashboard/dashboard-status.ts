import type { SaveStatus } from '@/types/ui.types'

export function buildDashboardStatusClass(status: SaveStatus): string {
  if (status.state === 'error') return 'text-red-400'
  if (status.state === 'success') return 'text-emerald-400'
  return 'text-muted-foreground'
}
