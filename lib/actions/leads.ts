'use server'

import { revalidatePath } from 'next/cache'
import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { createClient } from '@/lib/supabase/server'
import { submitLeadSchema } from '@/lib/validation/schemas'

export async function submitLead(
  formData: FormData
): Promise<{ success: true } | { error: string }> {
  const parsed = submitLeadSchema.safeParse({
    profile_id:    formData.get('profile_id'),
    visitor_name:  formData.get('visitor_name'),
    visitor_phone: formData.get('visitor_phone'),
    consented:     formData.get('consented') === 'true' ? true : formData.get('consented'),
  })

  if (!parsed.success) {
    return { error: parsed.error.issues[0].message }
  }

  const { profile_id, visitor_name, visitor_phone } = parsed.data

  const supabase = await createClient()
  const { error } = await supabase.from('leads').insert({
    profile_id,
    visitor_name,
    visitor_phone,
    consented: true,
  })

  if (error) {
    // Unique constraint = duplicate phone for this profile — treat as success
    if (error.code === '23505') return { success: true }
    return { error: 'No se pudo guardar tu información. Intenta de nuevo.' }
  }

  return { success: true }
}

export async function deleteLead(
  id: string
): Promise<{ success: true } | { error: string }> {
  const { profile } = await requireActiveUser()
  const supabase = await createClient()

  const { error } = await supabase
    .from('leads')
    .delete()
    .eq('id', id)
    .eq('profile_id', profile.id)

  if (error) return { error: error.message }

  revalidatePath('/dashboard')
  return { success: true }
}
