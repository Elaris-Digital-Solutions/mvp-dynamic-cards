'use client'

import { updateUserRole, updateUserStatus, updateUserExpiration } from '@/lib/actions/admin'
import { Database } from '@/types/database'
import { useState, useTransition } from 'react'

type Profile = Database['public']['Tables']['profiles']['Row']

export function UserTable({ profiles, currentUserId }: { profiles: Profile[], currentUserId: string }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleToggleActive = (userId: string, currentStatus: boolean) => {
    setError(null)
    startTransition(async () => {
      const res = await updateUserStatus(userId, !currentStatus)
      if (res?.error) setError(res.error)
    })
  }

  const handleToggleRole = (userId: string, currentRole: 'user' | 'admin') => {
    if (userId === currentUserId) {
      setError('System rejected self-demotion request safely.')
      return;
    }
    const newRole = currentRole === 'admin' ? 'user' : 'admin'
    if (!window.confirm(`Are you sure you want to make this user an ${newRole.toUpperCase()}?`)) return
    
    setError(null)
    startTransition(async () => {
      const res = await updateUserRole(userId, newRole)
      if (res?.error) setError(res.error)
    })
  }

  const handleUpdateExpiration = (userId: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const dateStr = formData.get('date') as string || null

    startTransition(async () => {
      const res = await updateUserExpiration(userId, dateStr)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="bg-white border rounded-lg flex flex-col shadow-sm">
      {error && <div className="bg-red-50 text-red-600 p-4 font-medium border-b border-red-100">{error}</div>}
      <div className="overflow-x-auto w-full">
        <table className="w-full text-sm text-left">
          <thead className="text-xs uppercase bg-gray-50 border-b text-gray-600 whitespace-nowrap">
            <tr>
              <th className="px-6 py-4">User Details</th>
              <th className="px-6 py-4">Status</th>
              <th className="px-6 py-4">Role Bounds</th>
              <th className="px-6 py-4 min-w-[200px]">Service Expiration</th>
            </tr>
          </thead>
          <tbody>
            {profiles.map(p => (
              <tr key={p.id} className="border-b hover:bg-gray-50 transition">
                <td className="px-6 py-4 align-top">
                  <div className="font-semibold text-gray-900">{p.full_name || 'N/A'} <span className="font-normal text-gray-500">(@{p.username})</span></div>
                  <div className="text-gray-500 text-xs mt-1">{p.email}</div>
                  <div className="text-gray-400 text-[10px] font-mono mt-1" title={p.id}>{p.id.slice(0,12)}...</div>
                </td>
                <td className="px-6 py-4 align-top">
                  <button 
                    onClick={() => handleToggleActive(p.id, p.is_active)}
                    disabled={isPending}
                    className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded-full border transition-colors ${p.is_active ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100' : 'bg-red-50 text-red-700 border-red-200 hover:bg-red-100'}`}
                  >
                    {p.is_active ? 'ACTIVE' : 'INACTIVE'}
                  </button>
                </td>
                <td className="px-6 py-4 align-top">
                  <button 
                    onClick={() => handleToggleRole(p.id, p.role)}
                    disabled={isPending || p.id === currentUserId}
                    className={`px-3 py-1.5 text-xs font-bold tracking-wide rounded border transition-colors ${p.role === 'admin' ? 'bg-purple-50 text-purple-700 border-purple-200 shadow-sm' : 'bg-gray-50 text-gray-600 border-gray-200 hover:bg-white hover:shadow-sm'}`}
                  >
                    {p.role.toUpperCase()}
                  </button>
                </td>
                <td className="px-6 py-4 align-top">
                  <form onSubmit={(e) => handleUpdateExpiration(p.id, e)} className="flex items-center space-x-2">
                    <input 
                      type="date" 
                      name="date"
                      defaultValue={p.service_expires_at ? p.service_expires_at.split('T')[0] : ''}
                      title={p.service_expires_at || 'No expiration set'}
                      className="border border-gray-300 p-1.5 rounded text-xs text-gray-800 bg-white min-w-[130px] focus:ring-1 focus:ring-blue-500" 
                    />
                    <button disabled={isPending} type="submit" className="bg-blue-600 text-white px-3 py-1.5 rounded text-xs font-medium hover:bg-blue-700 transition disabled:opacity-50">Set Date</button>
                  </form>
                </td>
              </tr>
            ))}
            {profiles.length === 0 && (
              <tr>
                <td colSpan={4} className="px-6 py-8 text-center text-gray-500 italic">No users found.</td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  )
}
