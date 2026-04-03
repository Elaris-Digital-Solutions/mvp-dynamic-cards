'use client'

import { createButton, deleteButton, toggleButton, updateButton } from '@/lib/actions/buttons'
import { Database } from '@/types/database'
import { useState, useTransition } from 'react'

type ActionButton = Database['public']['Tables']['action_buttons']['Row']

export function ButtonManager({ buttons }: { buttons: ActionButton[] }) {
  const [isPending, startTransition] = useTransition()
  const [error, setError] = useState<string | null>(null)
  const [editingId, setEditingId] = useState<string | null>(null)

  const handleCreate = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)
    const target = e.currentTarget

    startTransition(async () => {
      const res = await createButton(formData)
      if (res?.error) setError(res.error)
      else target.reset()
    })
  }

  const handleUpdate = (id: string, e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setError(null)
    const formData = new FormData(e.currentTarget)

    startTransition(async () => {
      const res = await updateButton(id, formData)
      if (res?.error) setError(res.error)
      else setEditingId(null)
    })
  }

  const handleDelete = (id: string) => {
    if (!window.confirm('Are you sure you want to delete this link?')) return
    setError(null)
    startTransition(async () => {
      const res = await deleteButton(id)
      if (res?.error) setError(res.error)
    })
  }

  const handleToggle = (id: string, currentStatus: boolean) => {
    setError(null)
    startTransition(async () => {
      const res = await toggleButton(id, !currentStatus)
      if (res?.error) setError(res.error)
    })
  }

  return (
    <div className="space-y-8 max-w-3xl">
      {error && (
        <div className="bg-red-50 text-red-700 p-4 rounded mb-4 font-medium border border-red-200">
          {error}
        </div>
      )}

      <div className="bg-white rounded-lg border p-6 shadow-sm">
        <h2 className="text-xl font-bold mb-4">Create New Link</h2>
        <form onSubmit={handleCreate} className="flex flex-col sm:flex-row sm:space-x-4 sm:items-end space-y-4 sm:space-y-0">
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">Label</label>
            <input required name="label" placeholder="e.g. My Website" className="w-full border border-gray-300 p-2 rounded focus:ring-1 focus:ring-blue-500" />
          </div>
          <div className="flex-1">
            <label className="block text-sm font-medium mb-1 text-gray-700">URL</label>
            <input required type="url" name="url" placeholder="https://..." className="w-full border border-gray-300 p-2 rounded focus:ring-1 focus:ring-blue-500" />
          </div>
          <button disabled={isPending || buttons.length >= 6} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 h-[42px] transition">
            {isPending ? 'Working...' : 'Add Link'}
          </button>
        </form>
        {buttons.length >= 6 && <p className="text-sm text-amber-600 mt-3 font-medium flex items-center">⚠ You have reached the maximum of 6 links.</p>}
      </div>

      <div className="space-y-4">
        <h2 className="text-xl font-bold text-gray-900">Your Links ({buttons.length}/6)</h2>
        {buttons.length === 0 && <p className="text-gray-500 italic bg-white p-6 rounded-lg border text-center">No links created yet.</p>}
        {buttons.map(button => (
          <div key={button.id} className="bg-white rounded-lg border p-4 flex flex-col space-y-4 shadow-sm hover:shadow-md transition">
            
            {editingId === button.id ? (
              <form onSubmit={(e) => handleUpdate(button.id, e)} className="flex flex-col sm:flex-row sm:space-x-4 sm:items-end w-full space-y-4 sm:space-y-0">
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1 font-bold uppercase tracking-wider">Label</label>
                  <input required name="label" defaultValue={button.label} className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex-1">
                  <label className="block text-xs text-gray-500 mb-1 font-bold uppercase tracking-wider">URL</label>
                  <input required type="url" name="url" defaultValue={button.url} className="w-full border border-gray-300 p-2 rounded text-sm focus:ring-1 focus:ring-blue-500" />
                </div>
                <div className="flex space-x-2 pt-2 sm:pt-0">
                  <button type="submit" disabled={isPending} className="bg-green-600 hover:bg-green-700 text-white text-sm px-4 py-2 rounded font-medium disabled:opacity-50 transition">Save</button>
                  <button type="button" onClick={() => setEditingId(null)} className="bg-gray-100 hover:bg-gray-200 text-gray-800 text-sm px-4 py-2 rounded font-medium transition">Cancel</button>
                </div>
              </form>
            ) : (
              <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center w-full space-y-4 sm:space-y-0">
                <div className="flex flex-col max-w-full overflow-hidden shrink pr-4">
                  <span className="font-semibold text-gray-900">{button.label}</span>
                  <a href={button.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-600 truncate hover:underline">{button.url}</a>
                </div>
                
                <div className="flex items-center space-x-2 shrink-0">
                  <button 
                    onClick={() => handleToggle(button.id, button.is_active)} 
                    disabled={isPending}
                    className={`text-sm px-3 py-1.5 rounded transition font-medium ${button.is_active ? 'bg-green-50 text-green-700 hover:bg-green-100' : 'bg-gray-100 text-gray-600 hover:bg-gray-200'}`}
                  >
                    {button.is_active ? '✅ Visible' : '🙈 Hidden'}
                  </button>
                  <button onClick={() => setEditingId(button.id)} disabled={isPending} className="text-sm border border-gray-200 bg-white hover:bg-gray-50 px-3 py-1.5 rounded font-medium transition">Edit</button>
                  <button onClick={() => handleDelete(button.id)} disabled={isPending} className="text-sm border border-red-200 bg-red-50 hover:bg-red-100 text-red-600 px-3 py-1.5 rounded font-medium transition">Delete</button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  )
}
