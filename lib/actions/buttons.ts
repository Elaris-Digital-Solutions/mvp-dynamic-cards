'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { revalidatePath } from 'next/cache'

function isValidUrl(url: string) {
  try {
    new URL(url);
    return true;
  } catch {
    return false;
  }
}

function sanitizeText(text: string | null) {
  return text ? text.trim().replace(/</g, "&lt;").replace(/>/g, "&gt;") : null;
}

async function reorderButtons(supabase: any, profileId: string) {
  const { data: buttons } = await supabase
    .from('action_buttons')
    .select('id, sort_order')
    .eq('profile_id', profileId)
    .order('sort_order', { ascending: true })

  if (!buttons) return

  for (let i = 0; i < buttons.length; i++) {
    if (buttons[i].sort_order !== i) {
      await supabase.from('action_buttons').update({ sort_order: i }).eq('id', buttons[i].id)
    }
  }
}

export async function createButton(formData: FormData) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const label = sanitizeText(formData.get('label') as string)
  const url = (formData.get('url') as string || '').trim()
  const icon = sanitizeText(formData.get('icon') as string) || 'link'

  if (!label || !url) return { error: 'Label and URL are required' }
  if (!isValidUrl(url)) return { error: 'Invalid URL format' }

  // Quota
  const { count } = await supabase
    .from('action_buttons')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  if (count !== null && count >= 6) {
    return { error: 'Maximum 6 buttons allowed' }
  }

  const { error } = await supabase.from('action_buttons').insert({
    profile_id: user.id,
    label,
    url,
    icon,
    sort_order: count ?? 0,
    is_active: true
  })

  if (error) return { error: 'Database mismatch error' }

  await reorderButtons(supabase, user.id)
  revalidatePath('/dashboard/buttons')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}

export async function updateButton(id: string, formData: FormData) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const label = sanitizeText(formData.get('label') as string)
  const url = (formData.get('url') as string || '').trim()
  const icon = sanitizeText(formData.get('icon') as string) 

  if (!label || !url) return { error: 'Label and URL are required' }
  if (!isValidUrl(url)) return { error: 'Invalid URL format' }

  const { error } = await supabase
    .from('action_buttons')
    .update({ label, url, icon: icon || 'link' })
    .match({ id, profile_id: user.id })

  if (error) return { error: 'Failed to update' }

  revalidatePath('/dashboard/buttons')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}

export async function toggleButton(id: string, is_active: boolean) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('action_buttons')
    .update({ is_active })
    .match({ id, profile_id: user.id })

  if (error) return { error: 'Failed to toggle visibility' }

  revalidatePath('/dashboard/buttons')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}

export async function deleteButton(id: string) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('action_buttons')
    .delete()
    .match({ id, profile_id: user.id })

  if (error) return { error: 'Failed to delete' }

  await reorderButtons(supabase, user.id)
  revalidatePath('/dashboard/buttons')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}
