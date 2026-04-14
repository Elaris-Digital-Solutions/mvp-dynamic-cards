'use server'

import { createClient } from '@/lib/supabase/server'
import { requireAdmin } from '@/lib/auth/requireAdmin'
import { revalidatePath } from 'next/cache'
import { processNFCCardSchema, searchProfilesSchema } from '@/lib/validation/schemas'

export async function updateUserStatus(userId: string, is_active: boolean) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  if (!userId) return { error: 'Missing user ID' }

  const { error } = await supabase.from('profiles').update({ is_active }).eq('id', userId)

  if (error) {
    console.error("Admin action Supabase error:", error)
    return { error: `Database update failed: ${error.message}` }
  }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserExpiration(userId: string, dateStr: string | null) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  if (!userId) return { error: 'Missing user ID' }

  const parsedDate = dateStr ? new Date(dateStr).toISOString() : null

  const { error } = await supabase.from('profiles').update({ service_expires_at: parsedDate }).eq('id', userId)

  if (error) {
    console.error("Admin action Supabase error:", error)
    return { error: `Database update failed: ${error.message}` }
  }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function updateUserRole(userId: string, role: 'user' | 'admin') {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  if (!userId) return { error: 'Missing user ID' }
  if (user.id === userId) return { error: 'Cannot alter your own role' }

  const { error } = await supabase.from('profiles').update({ role }).eq('id', userId)

  if (error) {
    console.error("Admin action Supabase error:", error)
    return { error: `Database update failed: ${error.message}` }
  }
  revalidatePath('/admin/users')
  return { success: true }
}

export async function processNFCCard(formData: FormData) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  const parsed = processNFCCardSchema.safeParse({
    card_uid:   formData.get('card_uid'),
    profile_id: formData.get('profile_id') || null,
    notes:      formData.get('notes'),
    is_active:  (formData.get('is_active') as string) === 'true',
  })
  if (!parsed.success) return { error: parsed.error.errors[0].message }

  const { card_uid, profile_id, notes, is_active } = parsed.data

  if (profile_id) {
    const { data: targetProfile } = await supabase.from('profiles').select('is_active').eq('id', profile_id).single()
    if (!targetProfile) return { error: 'Target profile not found' }
    if (!targetProfile.is_active) return { error: 'Target profile is legally inactive. Activate them first before hardware assignment.' }
  }

  // Force strict overwrite logic cleanly
  const { error } = await supabase.from('nfc_cards').upsert({
    card_uid,
    profile_id: profile_id || null, // Allow intentional unassign via blank dropdown
    notes,
    is_active,
    assigned_at: profile_id ? new Date().toISOString() : null
  }, { onConflict: 'card_uid' })

  if (error) return { error: 'Failed to process NFC Card mapping. Check logic bounds.' }

  revalidatePath('/admin/cards')
  return { success: true }
}

export async function toggleNFCCard(id: string, is_active: boolean) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('nfc_cards').update({ is_active }).eq('id', id)
  if (error) return { error: 'Failed to toggle NFC hardware state.' }

  revalidatePath('/admin/cards')
  return { success: true }
}

export async function deleteNFCCard(id: string) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  const { error } = await supabase.from('nfc_cards').delete().eq('id', id)
  if (error) return { error: 'Failed to purge NFC card bounds.' }

  revalidatePath('/admin/cards')
  return { success: true }
}

export async function searchAdminProfiles(query: string) {
  const { user } = await requireAdmin()
  const supabase = await createClient()

  const parsed = searchProfilesSchema.safeParse({ query })
  if (!parsed.success) return { profiles: [] }

  const { data, error } = await supabase
    .from('profiles')
    .select('id, username, full_name, is_active')
    .ilike('username', `%${parsed.data.query}%`)
    .limit(10)

  if (error) {
    console.error("Admin user search Supabase error:", error)
    return { error: `Search failed: ${error.message}` }
  }
  
  return { profiles: data || [] }
}
