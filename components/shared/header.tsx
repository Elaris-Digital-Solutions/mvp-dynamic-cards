'use client'

import Link from 'next/link'
import { Button } from '@/components/ui/button'

export function Header() {
  return (
    <header className="border-b border-border/10 sticky top-0 z-50 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <nav className="h-16 px-6 flex items-center justify-between max-w-7xl mx-auto w-full">
        <Link
          href="/"
          className="text-base md:text-lg font-medium tracking-[0.28em] uppercase"
        >
          VELTRIX
        </Link>

        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm" className="hidden sm:inline-flex">
            <Link href="/login">Iniciar Sesión</Link>
          </Button>
          <Button asChild variant="default" size="sm">
            <Link href="/signup">Crear Cuenta</Link>
          </Button>
        </div>
      </nav>
    </header>
  )
}
