import { ReactNode } from 'react'

export default function AdminLayout({ children }: { children: ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <header className="flex h-16 items-center bg-gray-900 px-6 font-semibold text-white">
        Admin Portal
      </header>
      <div className="flex-1 bg-gray-50 p-6">
        {children}
      </div>
    </div>
  )
}
