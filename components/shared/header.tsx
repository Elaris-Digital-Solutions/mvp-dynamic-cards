import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { getCurrentProfile } from '@/lib/auth/getCurrentProfile'

export async function Header() {
  const profile = await getCurrentProfile()

  const initials = profile?.full_name
    ? profile.full_name.split(' ').slice(0, 2).map(n => n[0]).join('').toUpperCase()
    : profile?.username?.slice(0, 2).toUpperCase() ?? '?'

  const dashboardHref = profile?.role === 'admin' ? '/admin' : '/dashboard'

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
          {profile ? (
            <Link href={dashboardHref} aria-label="Ir al panel">
              <Avatar className="size-8 cursor-pointer ring-2 ring-border hover:ring-primary/60 transition-all duration-200">
                <AvatarImage src={profile.avatar_url ?? undefined} alt={profile.full_name ?? profile.username} />
                <AvatarFallback className="text-xs font-medium">{initials}</AvatarFallback>
              </Avatar>
            </Link>
          ) : (
            <>
              <Button asChild variant="ghost" size="sm">
                <Link href="/login">Iniciar Sesión</Link>
              </Button>
              <Button asChild variant="default" size="sm">
                <Link href="/signup">Crear Cuenta</Link>
              </Button>
            </>
          )}
        </div>
      </nav>
    </header>
  )
}
