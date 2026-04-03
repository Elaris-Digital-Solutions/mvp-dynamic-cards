'use client'

import { processNFCCard, toggleNFCCard, deleteNFCCard } from '@/lib/actions/admin'
import { Database } from '@/types/database'
import { useState, useTransition } from 'react'

type NFCCard = Database['public']['Tables']['nfc_cards']['Row']
type Profile = Database['public']['Tables']['profiles']['Row']

export function NFCCardTable({ cards, profiles }: { cards: NFCCard[], profiles: Profile[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)

  const handleProcess = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const target = e.currentTarget

    startTransition(async () => {
      const res = await processNFCCard(formData)
      if (res?.error) setError(res.error)
      else target.reset()
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    setError(null)
    startTransition(async () => {
      const res = await toggleNFCCard(id, !currentStatus)
      if (res?.error) setError(res.error)
    })
  }
  
  const handleDelete = (id: string) => {
    if(!window.confirm('WARNING: Delete this card entirely? This permanently destroys the hardware mapping.')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteNFCCard(id)
      if (res?.error) setError(res.error)
    })
  }

  // Helper to map profile cleanly
  const renderProfileBadge = (profileId: string | null) => {
    if (!profileId) return <span className="text-gray-400 italic text-xs font-semibold bg-gray-100 px-2 py-1 rounded">Unassigned</span>
    const assignedProfile = profiles.find(p => p.id === profileId)
    if (!assignedProfile) return <span className="text-red-500 italic text-xs font-semibold bg-red-50 px-2 py-1 rounded">Orphaned Mapping</span>
    
    return (
      <div className="flex flex-col">
        <div className="font-semibold text-gray-900 leading-tight">{assignedProfile.full_name || `@${assignedProfile.username}`}</div>
        <div className="text-gray-500 text-[11px] font-mono mt-0.5 w-40 truncate" title={assignedProfile.id}>{assignedProfile.id}</div>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      {error && <div className="bg-red-50 text-red-600 p-4 rounded font-medium border border-red-200 shadow-sm">{error}</div>}

      <div className="bg-white rounded-lg border p-6 shadow-sm max-w-5xl">
        <h2 className="text-lg font-bold mb-4 text-gray-900 border-b pb-3 cursor-default">Provision / Re-assign NFC Hardware</h2>
        <form onSubmit={handleProcess} className="flex flex-col space-y-5 pt-2">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2 flex items-center">
                Card UID <span className="text-red-500 ml-1.5">*</span>
              </label>
              <input required name="card_uid" placeholder="e.g. 04:A1:B2..." className="w-full border border-gray-300 p-2.5 rounded text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors font-mono" />
            </div>
            
            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Foreign Target (Profile ID)</label>
              <select name="profile_id" className="w-full border border-gray-300 p-2.5 rounded text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors cursor-pointer">
                <option value="">-- Unassigned (Wipe Binding) --</option>
                {profiles.map(p => (
                  <option key={p.id} value={p.id} disabled={!p.is_active} className={!p.is_active ? 'text-red-400 font-medium' : 'text-gray-900 font-medium'}>
                    {p.full_name || `@${p.username}`} {p.email ? `(${p.email})` : ''} {!p.is_active ? ' [INACTIVE]' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="flex flex-col">
              <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Internal Notes</label>
              <input name="notes" placeholder="Batch 001 - Black Matte" className="w-full border border-gray-300 p-2.5 rounded text-sm bg-gray-50 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors" />
            </div>
          </div>
          
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between border-t border-gray-100 pt-5 space-y-4 sm:space-y-0">
             <label className="flex items-center space-x-2 text-sm font-medium cursor-pointer py-1 select-none">
               <input type="checkbox" name="is_active" value="true" defaultChecked className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500" />
               <span className="text-gray-700">Deploy as <span className="font-bold text-green-600">Active Map</span></span>
             </label>

            <button disabled={isPending} type="submit" className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-2.5 rounded shadow-sm font-medium transition disabled:opacity-50 tracking-wide text-sm w-full sm:w-auto">
              {isPending ? 'Processing...' : 'Write Configuration to Server'}
            </button>
          </div>
        </form>
      </div>

      <div className="bg-white border rounded-lg overflow-hidden shadow-sm">
        <div className="overflow-x-auto w-full">
          <table className="w-full text-sm text-left">
            <thead className="text-xs uppercase bg-gray-50 border-b text-gray-600 whitespace-nowrap">
              <tr>
                <th className="px-6 py-4">Hardware Target UID</th>
                <th className="px-6 py-4">Status</th>
                <th className="px-6 py-4">Bound To</th>
                <th className="px-6 py-4">Notes</th>
                <th className="px-6 py-4 text-right">Danger Elements</th>
              </tr>
            </thead>
            <tbody>
              {cards.map(c => (
                <tr key={c.id} className="border-b hover:bg-gray-50 transition">
                  <td className="px-6 py-4 font-mono font-semibold text-gray-800 tracking-wide bg-gray-50 border-r">{c.card_uid}</td>
                  <td className="px-6 py-4 align-middle">
                    <button 
                      onClick={() => handleToggle(c.id, c.is_active)}
                      disabled={isPending}
                      className={`px-3 py-1.5 text-[11px] font-extrabold tracking-wider rounded border transition-colors ${c.is_active ? 'bg-green-50 text-green-700 border-green-200 hover:bg-green-100 shadow-sm' : 'bg-gray-100 text-gray-500 border-gray-200 hover:bg-gray-200'}`}
                    >
                      {c.is_active ? 'ACTIVE' : 'DEAD'}
                    </button>
                  </td>
                  <td className="px-6 py-4">
                    {renderProfileBadge(c.profile_id)}
                  </td>
                  <td className="px-6 py-4 text-xs text-gray-500 font-medium max-w-[200px] truncate" title={c.notes || ''}>
                    {c.notes || '-'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button onClick={() => handleDelete(c.id)} disabled={isPending} className="text-[11px] uppercase tracking-wider font-bold bg-white text-red-600 px-3 py-1.5 rounded border border-red-200 hover:bg-red-50 transition shadow-sm">
                      Wipe
                    </button>
                  </td>
                </tr>
              ))}
              {cards.length === 0 && (
                <tr>
                   <td colSpan={5} className="px-6 py-10 text-center text-gray-500 font-medium bg-gray-50">No NFC hardware mapped yet.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
