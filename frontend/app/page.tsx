import Link from 'next/link'
import { Header } from '@/components/shared/header'
import { NFCBadge } from '@/components/shared/nfc-badge'
import { Button } from '@/components/ui/button'

export default function Home() {
  return (
    <div className="min-h-screen bg-background">
      <div className="animate-in fade-in slide-in-from-top-4 duration-1000 ease-out">
        <Header />
      </div>

      <main className="relative isolate flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] px-5 sm:px-4 overflow-hidden">
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 z-0"
          style={{
            backgroundImage:
              'radial-gradient(ellipse at 50% 50%, rgba(62, 119, 198, 0.24) 0%, rgba(33, 74, 130, 0.14) 40%, transparent 74%), linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
            backgroundSize: '100% 100%, 30px 30px, 30px 30px',
            backgroundPosition: 'center, center, center',
          }}
        >
          <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/18 blur-3xl" />
          <div className="absolute inset-0 bg-[radial-gradient(95%_80%_at_50%_50%,transparent_56%,rgba(2,8,23,0.2)_100%)]" />
        </div>

        <div className="relative z-10 w-full max-w-2xl mx-auto flex flex-col items-center justify-center gap-8 text-center py-0 -mt-10 px-1 sm:px-0 animate-in fade-in zoom-in-95 slide-in-from-bottom-8 duration-1000 ease-out">
          <NFCBadge />

          <div className="space-y-0 mx-auto w-fit max-w-full">
            <h1 className="text-4xl md:text-6xl font-medium tracking-[0.2em] md:tracking-[0.34em] pl-[0.2em] md:pl-[0.34em] text-foreground leading-none uppercase text-center">
              IDENTIDAD
            </h1>
            <p className="text-xl md:text-3xl font-normal tracking-[0.1em] md:tracking-[0.18em] pl-[0.1em] md:pl-[0.18em] text-muted-foreground mt-1 uppercase text-center">
              DE ALTO IMPACTO
            </p>
          </div>

          <p className="text-lg text-muted-foreground max-w-md mx-auto leading-relaxed">
            Eleva tu presencia con una tarjeta que te hace destacar desde el primer contacto.
          </p>

          <div className="mt-4 flex items-center justify-center">
            <Button asChild size="lg">
              <Link href="/signup">Obtener mi tarjeta</Link>
            </Button>
          </div>
        </div>
      </main>
    </div>
  )
}
