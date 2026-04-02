import { ReactNode } from 'react'
import LogoutButton from '@/components/auth/LogoutButton'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6 font-semibold">
        <span>SaaS Dashboard</span>
        <LogoutButton className="text-gray-600 hover:text-gray-900" />
      </header>
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}
