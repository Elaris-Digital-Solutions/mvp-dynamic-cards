'use client'

import { useState, useTransition } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog'
import { LogOut, Home, User, Link as LinkIcon, LayoutGrid, Orbit, Shield, Settings, ArrowLeft, Loader2 } from 'lucide-react'

// ─── Types ────────────────────────────────────────────────────────────────────

interface SidebarProps {
  activeSection: string
  onSectionChange: (section: string) => void
  /** Email displayed in the header area */
  userEmail?: string
  /**
   * Called when the user clicks "Cerrar sesión".
   * Integration point: call auth.signOut() then redirect.
   */
  onLogout?: () => void | Promise<void>
  /** Disables the logout button while a sign-out is in progress */
  isLoading?: boolean
  /** Shows the admin panel link when the user has admin role */
  isAdmin?: boolean
  /** Username used to build the /[username] card link */
  username?: string
}

// ─── Nav items ────────────────────────────────────────────────────────────────

const NAV_ITEMS = [
  { id: 'inicio', label: 'Inicio', icon: Home },
  { id: 'perfil', label: 'Datos personales', icon: User },
  { id: 'botones', label: 'Enlaces y redes', icon: LinkIcon },
  { id: 'plantilla', label: 'Plantilla', icon: LayoutGrid },
  { id: 'cuenta', label: 'Mi cuenta', icon: Settings },
]

// ─── Component ────────────────────────────────────────────────────────────────

export function Sidebar({
  activeSection,
  onSectionChange,
  userEmail,
  onLogout,
  isLoading = false,
  isAdmin = false,
  username,
}: SidebarProps) {
  const [confirmOpen, setConfirmOpen] = useState(false)
  const router = useRouter()
  const [isNavigating, startNavigating] = useTransition()

  return (
    <aside className="w-full md:w-72 border-b md:border-b-0 md:border-r border-border bg-background/50 backdrop-blur-sm flex flex-col md:h-screen md:sticky md:top-0">
      <div className="p-4 border-b border-border">
        <p className="text-xs font-medium text-muted-foreground mb-1.5">PANEL</p>
        <h1 className="text-xl font-bold">Dashboard</h1>
        {userEmail && (
          <p className="text-sm text-muted-foreground mt-1.5 truncate">{userEmail}</p>
        )}
      </div>

      <nav className="flex-1 overflow-auto p-3 grid grid-cols-2 gap-2 md:block md:space-y-1.5 md:p-3">
        {NAV_ITEMS.map((item) => {
          const Icon = item.icon
          const isActive = activeSection === item.id

          return (
            <button
              key={item.id}
              onClick={() => onSectionChange(item.id)}
              className={`w-full flex items-center gap-2.5 px-3 py-3 rounded-xl md:rounded-md transition-colors border border-transparent ${
                isActive
                  ? 'bg-primary text-primary-foreground'
                  : 'text-foreground hover:bg-muted/70 md:hover:bg-muted'
              }`}
            >
              <Icon className="w-4 h-4" />
              <span className="font-medium text-[0.95rem]">{item.label}</span>
            </button>
          )
        })}
      </nav>

      <div className="p-3 border-t border-border space-y-2">
        <Button
          asChild
          variant="ghost"
          className="w-full justify-center h-11 md:h-9 rounded-xl md:rounded-md text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
        >
          <Link href="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Volver al inicio
          </Link>
        </Button>

        {isAdmin && (
          <Button
            asChild
            variant="outline"
            className="w-full justify-center h-11 md:h-9 rounded-xl md:rounded-md border-border/70 bg-background/70 text-foreground transition-all duration-200 hover:-translate-y-0.5 hover:border-primary/40 hover:bg-primary/15 hover:text-foreground active:translate-y-0"
          >
            <Link href="/admin">
              <Shield className="w-4 h-4 mr-2" />
              Panel Admin
            </Link>
          </Button>
        )}

        <Button
          className="w-full justify-center h-11 md:h-9 rounded-xl md:rounded-md transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          disabled={isNavigating}
          onClick={() => startNavigating(() => {
            router.push(username ? `/${username}?from=dashboard` : '/card')
          })}
        >
          {isNavigating
            ? <Loader2 className="w-4 h-4 mr-2 animate-spin" />
            : <Orbit className="w-4 h-4 mr-2" />}
          {isNavigating ? 'Abriendo...' : 'Ver mi perfil público'}
        </Button>

        <Button
          variant="ghost"
          className="w-full justify-center h-11 md:h-9 rounded-xl md:rounded-md text-muted-foreground hover:text-foreground transition-all duration-200 hover:-translate-y-0.5 active:translate-y-0"
          onClick={() => setConfirmOpen(true)}
          disabled={isLoading}
        >
          <LogOut className="w-4 h-4 mr-2" />
          Cerrar sesión
        </Button>
      </div>

      <AlertDialog open={confirmOpen} onOpenChange={setConfirmOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>¿Cerrar sesión?</AlertDialogTitle>
            <AlertDialogDescription>
              Se cerrará tu sesión en este dispositivo.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction onClick={() => void onLogout?.()}>
              Cerrar sesión
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </aside>
  )
}
