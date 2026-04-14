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

  const [useSameWhatsApp, setUseSameWhatsApp] = useState(true)
  const [phone, setPhone] = useState(profile.phone || '')
  const [whatsapp, setWhatsapp] = useState(profile.whatsapp || '')


  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault()
    setMessage(null)
    const formData = new FormData(e.currentTarget)
    formData.append('avatar_url', avatarUrl)
    formData.append('banner_url', bannerUrl)

    // Enforce frontend consistency before submission
    if (useSameWhatsApp) {
      formData.set('whatsapp', phone)
    } else {
      formData.set('whatsapp', whatsapp)
    }


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

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 items-start relative">
          <div>
            <label className="block text-sm font-medium mb-1">Phone</label>
            <input 
              name="phone" 
              value={phone}
              onChange={(e) => {
                setPhone(e.target.value)
                if (useSameWhatsApp) setWhatsapp(e.target.value)
              }}
              className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500" 
            />
            
            <div className="mt-3 flex items-center">
              <input 
                type="checkbox" 
                id="same-whatsapp"
                checked={useSameWhatsApp}
                onChange={(e) => {
                  setUseSameWhatsApp(e.target.checked)
                  if (e.target.checked) setWhatsapp(phone)
                }}
                className="w-4 h-4 text-blue-600 rounded border-gray-300 focus:ring-blue-500 cursor-pointer"
              />
              <label htmlFor="same-whatsapp" className="ml-2 text-sm text-gray-700 cursor-pointer font-medium select-none">
                Usar el mismo número para WhatsApp
              </label>
            </div>
            <p className="text-xs text-gray-500 mt-1 italic ml-6">
              Si está activado, usaremos el mismo número para WhatsApp
            </p>
          </div>
          
          <div className={`transition-all duration-300 md:absolute md:w-[calc(50%-0.5rem)] md:right-0 ${useSameWhatsApp ? 'opacity-0 scale-95 pointer-events-none invisible h-0 overflow-hidden' : 'opacity-100 scale-100 visible h-auto'}`}>
            <label className="block text-sm font-medium mb-1 text-gray-700">Custom WhatsApp Number</label>
            <input 
              name="whatsapp" 
              value={whatsapp}
              onChange={(e) => setWhatsapp(e.target.value)}
              className="w-full border p-2 rounded focus:ring-1 focus:ring-blue-500 bg-gray-50" 
            />
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
