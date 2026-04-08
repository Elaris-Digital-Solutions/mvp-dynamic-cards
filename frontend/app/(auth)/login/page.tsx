import { LoginForm } from '@/components/auth/login-form'

export default function LoginPage() {
  return (
    <div className="min-h-screen bg-background">
      <main className="relative isolate min-h-screen flex items-center justify-center px-4 py-10 overflow-hidden">
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

        <div className="relative z-10 w-full">
          {/*
           * Integration point: pass onLogin and isLoading from your auth system.
           * Example:
           *   const { login, isLoading } = useAuth()
           *   <LoginForm onLogin={login} isLoading={isLoading} />
           */}
          <LoginForm />
        </div>
      </main>
    </div>
  )
}
