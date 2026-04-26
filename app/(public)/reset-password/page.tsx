import { cookies } from 'next/headers'
import { redirect } from 'next/navigation'
import Link from 'next/link'
import { ResetForm } from './reset-form'

export default async function ResetPasswordPage() {
  const cookieStore = await cookies()
  if (cookieStore.get('pw_reset_pending')?.value !== '1') {
    redirect('/login')
  }

  const pureWhiteStyle = { color: '#ffffff', opacity: 1, WebkitTextFillColor: '#ffffff' }

  return (
    <div className="relative isolate min-h-screen bg-background flex items-center justify-center px-5 sm:px-4 overflow-hidden">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 50%, rgba(62, 119, 198, 0.24) 0%, rgba(33, 74, 130, 0.14) 40%, transparent 74%), linear-gradient(to right, rgba(255, 255, 255, 0.07) 1px, transparent 1px), linear-gradient(to bottom, rgba(255, 255, 255, 0.07) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 30px 30px, 30px 30px',
        }}
      >
        <div className="absolute left-1/2 top-1/2 h-[28rem] w-[28rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-primary/18 blur-3xl" />
        <div className="absolute inset-0 bg-[radial-gradient(95%_80%_at_50%_50%,transparent_56%,rgba(2,8,23,0.2)_100%)]" />
      </div>

      <div className="relative z-10 w-full py-8">
        <div className="w-full max-w-md mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700 ease-out">
          <div className="relative overflow-hidden rounded-2xl border border-white/15 bg-background/55 backdrop-blur-xl shadow-[0_16px_48px_-24px_rgba(10,28,56,0.85)] p-5 sm:p-7">
            <div aria-hidden className="pointer-events-none absolute inset-0 z-0">
              <div className="absolute inset-0 bg-[radial-gradient(100%_100%_at_50%_0%,rgba(255,255,255,0.14),rgba(255,255,255,0.035)_60%,rgba(255,255,255,0.015)_100%)]" />
              <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(255,255,255,0.06)_0%,rgba(255,255,255,0.03)_40%,transparent_100%)]" />
              <div className="absolute inset-0 opacity-30 bg-[repeating-linear-gradient(0deg,rgba(255,255,255,0.05)_0,rgba(255,255,255,0.05)_1px,transparent_1px,transparent_4px)]" />
            </div>

            <div className="relative z-20 flex flex-col space-y-6">
              <div className="space-y-2 text-center">
                <p className="text-xs tracking-[0.16em] uppercase" style={pureWhiteStyle}>VELTRIX</p>
                <h1 className="text-2xl font-semibold tracking-normal" style={pureWhiteStyle}>Nueva contraseña</h1>
                <p className="text-sm text-white/60">Elige una contraseña segura para tu cuenta.</p>
              </div>

              <ResetForm />

              <div className="text-center" style={pureWhiteStyle}>
                <Link href="/login" className="text-sm hover:underline" style={pureWhiteStyle}>
                  ← Volver al login
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
