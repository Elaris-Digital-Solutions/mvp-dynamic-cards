import { OctagonAlert } from 'lucide-react'
import LogoutButton from '@/components/auth/LogoutButton'

export default function InactivePage() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center px-5 overflow-hidden bg-background">
      {/* Background layers — matches Hero page */}
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

      {/* Glassmorphism card */}
      <div className="relative z-10 w-full max-w-md animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
        <div className="relative rounded-2xl border border-white/15 bg-background/55 backdrop-blur-xl shadow-[0_16px_48px_-24px_rgba(10,28,56,0.85)] p-7 text-center overflow-hidden">
          {/* Decorative overlays */}
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'radial-gradient(100% 100% at 50% 0%, rgba(255,255,255,0.14), rgba(255,255,255,0.035) 60%, rgba(255,255,255,0.015) 100%)',
            }}
          />
          <div
            aria-hidden
            className="pointer-events-none absolute inset-0 rounded-2xl"
            style={{
              background:
                'linear-gradient(180deg, rgba(255,255,255,0.06) 0%, rgba(255,255,255,0.03) 40%, transparent 100%)',
            }}
          />

          {/* Content */}
          <div className="relative z-10">
            <p className="text-xs tracking-[0.16em] uppercase text-muted-foreground mb-5">VELTRIX</p>

            <OctagonAlert className="w-10 h-10 text-muted-foreground mx-auto mb-4" />

            <h2 className="text-2xl font-semibold text-foreground" style={{ color: '#ffffff', opacity: 1, WebkitTextFillColor: '#ffffff' }}>
              Servicio inactivo
            </h2>

            <p className="text-sm text-muted-foreground leading-relaxed mt-3">
              Tu cuenta no tiene un plan activo. Comunícate con soporte para activar tu servicio.
            </p>

            <LogoutButton className="w-full h-11 rounded-lg font-semibold uppercase tracking-wide shadow-[0_10px_30px_-16px_rgba(14,44,92,0.75)] mt-6 cursor-pointer" />
          </div>
        </div>
      </div>
    </main>
  )
}
