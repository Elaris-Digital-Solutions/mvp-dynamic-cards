'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { revalidatePath } from 'next/cache'

function isValidCloudinaryUrl(url: string | null) {
  if (!url) return true; 
  try {
    const parsed = new URL(url);
    return parsed.hostname === 'res.cloudinary.com';
  } catch {
    return false;
  }
}

function sanitizeText(text: string | null) {
  return text ? text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;") : null;
}

export async function updateProfile(formData: FormData) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const full_name = sanitizeText(formData.get('full_name') as string)
  const bio = sanitizeText(formData.get('bio') as string)
  const phone = sanitizeText(formData.get('phone') as string)
  const whatsapp = sanitizeText(formData.get('whatsapp') as string)
  const avatar_url = (formData.get('avatar_url') as string || '').trim() || null
  const banner_url = (formData.get('banner_url') as string || '').trim() || null

  if (!isValidCloudinaryUrl(avatar_url) || !isValidCloudinaryUrl(banner_url)) {
    return { error: 'Invalid image URL. Must be a secure Cloudinary asset.' }
  }

  const { error } = await supabase
    .from('profiles')
    .update({
      full_name,
      bio,
      phone,
      whatsapp,
      avatar_url,
      banner_url,
      updated_at: new Date().toISOString()
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard/profile')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}
