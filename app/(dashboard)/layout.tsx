import { ReactNode } from 'react'
import LogoutButton from '@/components/auth/LogoutButton'
import Link from 'next/link'

export default function DashboardLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between border-b px-6 font-semibold bg-white">
        <div className="flex items-center space-x-6">
          <span>SaaS Dashboard</span>
          <nav className="flex space-x-4 text-sm font-medium text-gray-500">
             <Link href="/dashboard" className="hover:text-gray-900">Overview</Link>
             <Link href="/dashboard/profile" className="hover:text-gray-900">Profile</Link>
             <Link href="/dashboard/buttons" className="hover:text-gray-900">Buttons</Link>
          </nav>
        </div>
        <LogoutButton className="text-gray-600 hover:text-gray-900" />
      </header>
      <div className="flex-1 p-6">
        {children}
      </div>
    </div>
  )
}
