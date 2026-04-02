import { ReactNode } from 'react'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center border-b px-6 font-semibold">
        SaaS Dashboard
      </header>
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}
