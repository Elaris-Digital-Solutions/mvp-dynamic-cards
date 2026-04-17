import { ReactNode } from 'react'
import LogoutButton from '@/components/auth/LogoutButton'
import Link from 'next/link'
import { Button } from '@/components/ui/button'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="h-16 sticky top-0 z-50 border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <nav className="h-full px-6 flex items-center justify-between max-w-[1400px] mx-auto">
          <div className="flex items-center gap-3">
            <Link href="/admin" className="text-base font-medium tracking-[0.28em] uppercase text-foreground">
              VELTRIX
            </Link>
            <span className="text-xs text-muted-foreground border border-border/60 rounded px-1.5 py-0.5 tracking-wider">
              Admin
            </span>
          </div>
          <div className="flex items-center gap-2">
            <Button asChild variant="ghost" size="sm" className="text-muted-foreground hover:text-foreground">
              <Link href="/dashboard">Mi Perfil</Link>
            </Button>
            <LogoutButton className="text-muted-foreground hover:text-foreground text-sm transition-colors" />
          </div>
        </nav>
      </header>
      <div className="flex-1 bg-background p-6">
        <div className="max-w-[1400px] mx-auto">
          {children}
        </div>
      </div>
    </div>
  )
}
