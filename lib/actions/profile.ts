'use server'

import { createClient, createServiceClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { requireAuth } from '@/lib/auth/requireAuth'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'
import { templateKeyToId } from '@/lib/utils/template-map'
import { updateProfileSchema } from '@/lib/validation/schemas'
import { deleteCloudinaryImage } from '@/lib/utils/cloudinary'

// ─── Actions ──────────────────────────────────────────────────────────────────

async function syncWhatsAppButton(
  supabase: any,
  profileId: string,
  whatsapp: string | null | undefined
): Promise<void> {
  const { data: existing } = await supabase
    .from('action_buttons')
    .select('id')
    .match({ profile_id: profileId, icon: 'whatsapp', is_managed: true })
    .maybeSingle()

  if (whatsapp) {
    const normalizedNumber = whatsapp.replace(/\D/g, '')
    const whatsappUrl = `https://wa.me/${normalizedNumber}`

    if (existing) {
      await supabase
        .from('action_buttons')
        .update({ url: whatsappUrl, label: 'WhatsApp' })
        .match({ id: existing.id, profile_id: profileId })
    } else {
      const { data: maxBtn } = await supabase
        .from('action_buttons')
        .select('sort_order')
        .eq('profile_id', profileId)
        .order('sort_order', { ascending: false })
        .limit(1)
        .maybeSingle()

      const { count } = await supabase
        .from('action_buttons')
        .select('*', { count: 'exact', head: true })
        .eq('profile_id', profileId)

      if (count !== null && count >= 6) return

      await supabase.from('action_buttons').insert({
        id: crypto.randomUUID(),
        profile_id: profileId,
        label: 'WhatsApp',
        url: whatsappUrl,
        icon: 'whatsapp',
        is_managed: true,
        sort_order: maxBtn ? maxBtn.sort_order + 1 : 0,
        is_active: true,
      })
    }
  } else if (existing) {
    await supabase
      .from('action_buttons')
      .delete()
      .match({ id: existing.id, profile_id: profileId })
  }
}

/**
 * Updates all editable profile fields from a FormData payload.
 *
 * Accepted FormData keys (all optional):
 *   first_name, last_name, job_title, company, bio, phone, whatsapp, avatar_url, banner_url
 *
 * Security:
 *   - Requires an active, authenticated user (via requireActiveUser).
 *   - Updates are scoped to the caller's own profile ID — no IDOR risk.
 *   - Image URLs are validated to be Cloudinary-hosted before persisting.
 *   - Text fields are trimmed and HTML-entity-encoded.
 */
export async function updateProfile(
  formData: FormData
): Promise<{ success: true } | { error: string }> {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const parsed = updateProfileSchema.safeParse({
    first_name: formData.get('first_name'),
    last_name:  formData.get('last_name'),
    job_title:  formData.get('job_title'),
    company:    formData.get('company'),
    bio:        formData.get('bio'),
    phone:      formData.get('phone'),
    whatsapp:   formData.get('whatsapp'),
    email:      formData.get('email'),
    avatar_url: formData.get('avatar_url'),
    banner_url: formData.get('banner_url'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { first_name, last_name, job_title, company, bio, phone, whatsapp, email, avatar_url, banner_url } = parsed.data

  // Run SELECT (for cleanup) and UPDATE in parallel — cleanup only needs current URLs,
  // not the result of the update, so both can start at the same time.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const [{ data: current }, { error }] = await Promise.all([
    (supabase as any)
      .from('profiles')
      .select('avatar_url, banner_url')
      .eq('id', user.id)
      .single(),
    (supabase as any)
      .from('profiles')
      .update({
        first_name,
        last_name,
        job_title,
        company,
        bio,
        phone,
        whatsapp,
        email,
        avatar_url,
        banner_url,
        updated_at: new Date().toISOString(),
      })
      .eq('id', user.id),
  ])

  if (error) {
    return { error: 'No se pudieron guardar los cambios. Inténtalo de nuevo.' }
  }

  // Run WhatsApp sync and Cloudinary cleanup in parallel
  await Promise.all([
    syncWhatsAppButton(supabase, user.id, whatsapp ?? null),
    current?.avatar_url && current.avatar_url !== avatar_url
      ? deleteCloudinaryImage(current.avatar_url)
      : Promise.resolve(),
    current?.banner_url && current.banner_url !== banner_url
      ? deleteCloudinaryImage(current.banner_url)
      : Promise.resolve(),
  ])

  revalidatePath('/dashboard')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}

/**
 * Persists the user's selected template by mapping the frontend string key
 * to the database integer template_id.
 *
 * @param templateKey - A valid template string key (e.g. 'minimal-black').
 *
 * Security:
 *   - Requires an active, authenticated user (via requireActiveUser).
 *   - Update is scoped to the caller's own profile ID.
 *   - Unknown keys fall back to template_id 1 via templateKeyToId — no
 *     arbitrary integer injection is possible from the caller.
 */
export async function updateTemplate(
  templateKey: string
): Promise<{ success: true } | { error: string }> {
  const { user, profile } = await requireActiveUser()
  const supabase = await createClient()

  const template_id = templateKeyToId(templateKey)

  // Cast required: see updateProfile for rationale.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      template_id,
      updated_at: new Date().toISOString(),
    })
    .eq('id', user.id)

  if (error) {
    return { error: error.message }
  }

  revalidatePath('/dashboard')
  revalidatePath(`/${profile.username}`)
  return { success: true }
}

export async function updateUsername(
  newUsername: string
): Promise<{ success: true } | { error: string }> {
  const { user, profile } = await requireActiveUser()

  const cleaned = newUsername.toLowerCase().trim()

  if (cleaned.length < 3) return { error: 'El username debe tener al menos 3 caracteres.' }
  if (cleaned.length > 20) return { error: 'El username no puede superar los 20 caracteres.' }
  if (!/^[a-z0-9]([a-z0-9-]*[a-z0-9])?$/.test(cleaned))
    return { error: 'Solo letras minúsculas, números y guiones. No puede empezar ni terminar con guión.' }
  if (/--/.test(cleaned)) return { error: 'No se permiten guiones consecutivos.' }

  const supabase = await createClient()

  const { data: existing } = await (supabase as any)
    .from('profiles')
    .select('id')
    .ilike('username', cleaned)
    .neq('id', user.id)
    .maybeSingle()

  if (existing) return { error: 'Este username ya está en uso.' }

  const oldUsername = profile.username
  const { error } = await (supabase as any)
    .from('profiles')
    .update({ username: cleaned, updated_at: new Date().toISOString() })
    .eq('id', user.id)

  if (error) return { error: 'No se pudo actualizar el username. Inténtalo de nuevo.' }

  revalidatePath('/dashboard')
  if (oldUsername && !oldUsername.startsWith('_tmp_')) revalidatePath(`/${oldUsername}`)
  revalidatePath(`/${cleaned}`)
  return { success: true }
}

export async function deleteAccount(): Promise<{ error?: string }> {
  // Usamos requireAuth (no requireActiveUser) para que cuentas inactivas/vencidas
  // también puedan solicitar su borrado.
  const user = await requireAuth()
  const supabase = createServiceClient()

  // Fetch image URLs before deletion so we can clean up Cloudinary afterward
  const { data: profileData } = await (supabase.from('profiles') as any)
    .select('avatar_url, banner_url')
    .eq('id', user.id)
    .single()

  // Borrar en orden FK: hijos primero
  await (supabase.from('action_buttons') as any).delete().eq('profile_id', user.id)
  await (supabase.from('click_events') as any).delete().eq('profile_id', user.id)
  await (supabase.from('profiles') as any).delete().eq('id', user.id)

  const { error } = await supabase.auth.admin.deleteUser(user.id)
  if (error) return { error: error.message }

  await Promise.all([
    deleteCloudinaryImage(profileData?.avatar_url),
    deleteCloudinaryImage(profileData?.banner_url),
  ])

  redirect('/')
}
