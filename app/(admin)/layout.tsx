import { ReactNode } from 'react'
import LogoutButton from '@/components/auth/LogoutButton'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center justify-between bg-gray-900 px-6 font-semibold text-white">
        <span>Admin Portal</span>
        <LogoutButton className="text-gray-300 hover:text-white" />
      </header>
      <div className="flex-1 bg-gray-50 p-6">
        {children}
      </div>
    </div>
  )
}
