'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { revalidatePath } from 'next/cache'
import { templateKeyToId } from '@/lib/utils/template-map'
import { updateProfileSchema } from '@/lib/validation/schemas'

// ─── Actions ──────────────────────────────────────────────────────────────────

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
    avatar_url: formData.get('avatar_url'),
    banner_url: formData.get('banner_url'),
  })
  if (!parsed.success) return { error: parsed.error.issues[0].message }

  const { first_name, last_name, job_title, company, bio, phone, avatar_url, banner_url } = parsed.data
  const whatsapp = parsed.data.whatsapp || phone

  // Cast required: Supabase's postgrest generic chain infers update() param as
  // 'never' when multiple nullable fields are composed — known TS 5.x + supabase-ssr issue.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      first_name,
      last_name,
      job_title,
      company,
      bio,
      phone,
      whatsapp,
      avatar_url,
      banner_url,
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
