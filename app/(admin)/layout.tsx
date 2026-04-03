import { ReactNode } from 'react'
import LogoutButton from '@/components/auth/LogoutButton'
import Link from 'next/link'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between bg-gray-900 px-6 font-semibold text-white">
        <div className="flex items-center space-x-6">
          <span>Admin Portal</span>
          <nav className="flex space-x-4 text-sm font-medium text-gray-300">
             <Link href="/admin/users" className="hover:text-white transition">Users</Link>
             <Link href="/admin/cards" className="hover:text-white transition">NFC Cards</Link>
          </nav>
        </div>
        <LogoutButton className="text-gray-300 hover:text-white" />
      </header>
      <div className="flex-1 bg-gray-50 p-6">
        {children}
      </div>
    </div>
  )
}
