'use client'

import { updateProfile } from '@/lib/actions/profile'
import { Database } from '@/types/database'
import { useState, useTransition } from 'react'
import { CloudinaryUploader } from './CloudinaryUploader'

type Profile = Database['public']['Tables']['profiles']['Row']

export function ProfileEditor({ profile }: { profile: Profile }) {
  const [isPending, startTransition] = useTransition()
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)
  
  const [avatarUrl, setAvatarUrl] = useState(profile.avatar_url || '')
  const [bannerUrl, setBannerUrl] = useState(profile.banner_url || '')

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    formData.append('avatar_url', avatarUrl)
    formData.append('banner_url', bannerUrl)

    startTransition(async () => {
      const res = await updateProfile(formData)
      if (res?.error) {
        setMessage({ type: 'error', text: res.error })
      } else {
        setMessage({ type: 'success', text: 'Profile updated successfully.' })
      }
    })
  }

  return (
    <div className="bg-white rounded-lg border p-6 max-w-2xl shadow-sm">
      <h2 className="text-xl font-bold mb-6">Edit Profile</h2>
      {message && (
        <div className={`p-4 mb-6 rounded ${message.type === 'error' ? 'bg-red-50 text-red-700' : 'bg-green-50 text-green-700'}`}>
          {message.text}
        </div>
      )}
      <form onSubmit={handleSubmit} className="space-y-6">
        
        <div className="flex space-x-6">
          <div className="flex-1 border p-4 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Avatar</span>
            {avatarUrl ? (
               <img src={avatarUrl} alt="Avatar" className="w-16 h-16 rounded-full object-cover border mb-3" />
            ) : (
               <div className="w-16 h-16 rounded-full bg-gray-200 border mb-3"></div>
            )}
            <CloudinaryUploader label="Upload Avatar" onSuccess={setAvatarUrl} disabled={isPending} />
          </div>
          <div className="flex-1 border p-4 rounded-lg bg-gray-50 flex flex-col items-center justify-center text-center">
            <span className="block text-sm font-semibold text-gray-700 mb-2">Banner</span>
            {bannerUrl ? (
               <img src={bannerUrl} alt="Banner" className="w-full h-16 rounded object-cover border mb-3" />
            ) : (
               <div className="w-full h-16 rounded bg-gray-200 border mb-3"></div>
            )}
            <CloudinaryUploader label="Upload Banner" onSuccess={setBannerUrl} disabled={isPending} />
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1">Full Name</label>
          <input name="full_name" defaultValue={profile.full_name || ''} className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500" />
        </div>
        
        <div>
          <label className="block text-sm font-medium mb-1">Bio</label>
          <textarea name="bio" rows={3} defaultValue={profile.bio || ''} className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500" />
        </div>

        <div className="grid grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input name="phone" defaultValue={profile.phone || ''} className="w-full border p-2 rounded" />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1">WhatsApp</label>
            <input name="whatsapp" defaultValue={profile.whatsapp || ''} className="w-full border p-2 rounded" />
          </div>
        </div>

        <div className="pt-4 border-t">
          <button type="submit" disabled={isPending} className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded font-medium disabled:opacity-50 transition w-full sm:w-auto">
            {isPending ? 'Saving...' : 'Save Profile'}
          </button>
        </div>
      </form>
    </div>
  )
}
