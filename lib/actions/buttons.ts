'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { revalidatePath } from 'next/cache'
import { createButtonSchema, updateButtonSchema } from '@/lib/validation/schemas'

async function reorderButtons(supabase: any, profileId: string) {
  const { data: buttons } = await supabase
    .from('action_buttons')
    .select('id, sort_order')
    .eq('profile_id', profileId)
    .order('sort_order', { ascending: true })

  if (!buttons || buttons.length === 0) return

  const updates = buttons
    .map((btn: { id: string; sort_order: number }, i: number) => ({ id: btn.id, newOrder: i, oldOrder: btn.sort_order }))
    .filter(({ newOrder, oldOrder }: { newOrder: number; oldOrder: number }) => newOrder !== oldOrder)

  if (updates.length === 0) return

  await Promise.all(
    updates.map(({ id, newOrder }: { id: string; newOrder: number }) =>
      supabase.from('action_buttons').update({ sort_order: newOrder }).eq('id', id)
    )
  )
}

export async function createButton(formData: FormData) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const parsed = createButtonSchema.safeParse({
    id:    formData.get('id'),
    label: formData.get('label'),
    url:   formData.get('url'),
    icon:  formData.get('icon'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { id, label, url, icon } = parsed.data

  // Check if ID already exists to prevent collision
  const { data: existing } = await supabase.from('action_buttons').select('id').eq('id', id).single()
  if (existing) {
    return { error: 'Button already exists' }
  }

  // Quota
  const { count } = await supabase
    .from('action_buttons')
    .select('*', { count: 'exact', head: true })
    .eq('profile_id', user.id)

  if (count !== null && count >= 6) {
    return { error: 'Maximum 6 buttons allowed' }
  }

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any).from('action_buttons').insert({
    id,
    profile_id: user.id,
    label,
    url,
    icon,
    sort_order: count ?? 0,
    is_active: true
  })

  if (error) return { error: 'Database mismatch error' }

  await reorderButtons(supabase, user.id)
  revalidatePath('/dashboard')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}

export async function updateButton(id: string, formData: FormData) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const parsed = updateButtonSchema.safeParse({
    label: formData.get('label'),
    url:   formData.get('url'),
    icon:  formData.get('icon'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { label, url, icon } = parsed.data

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('action_buttons')
    .update({ label, url, icon: icon || 'link' })
    .match({ id, profile_id: user.id })
    .select('id')

  if (error) return { error: 'Failed to update' }
  if (!data || data.length === 0) return { error: 'Button not found' }

  revalidatePath('/dashboard')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}

export async function toggleButton(id: string, is_active: boolean) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('action_buttons')
    .update({ is_active })
    .match({ id, profile_id: user.id })
    .select('id')

  if (error) return { error: 'Failed to toggle visibility' }
  if (!data || data.length === 0) return { error: 'Button not found' }

  revalidatePath('/dashboard')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}

export async function deleteButton(id: string) {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { data, error } = await (supabase as any)
    .from('action_buttons')
    .delete()
    .match({ id, profile_id: user.id })
    .select('id')

  if (error) return { error: 'Failed to delete' }
  if (!data || data.length === 0) return { error: 'Button not found' }

  await reorderButtons(supabase, user.id)
  revalidatePath('/dashboard')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}
