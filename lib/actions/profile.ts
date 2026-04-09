'use server'

import { createClient } from '@/lib/supabase/server'
import { requireActiveUser } from '@/lib/auth/requireActiveUser'
import { revalidatePath } from 'next/cache'
import { templateKeyToId } from '@/lib/utils/template-map'

// ─── Helpers ──────────────────────────────────────────────────────────────────

function isValidCloudinaryUrl(url: string | null): boolean {
  if (!url) return true
  try {
    const parsed = new URL(url)
    return parsed.hostname === 'res.cloudinary.com'
  } catch {
    return false
  }
}

function sanitizeText(value: FormDataEntryValue | null): string | null {
  if (!value || typeof value !== 'string') return null
  const trimmed = value.trim()
  if (!trimmed) return null
  return trimmed.replace(/</g, '&lt;').replace(/>/g, '&gt;')
}

// ─── Actions ──────────────────────────────────────────────────────────────────

/**
 * Updates all editable profile fields from a FormData payload.
 *
 * Accepted FormData keys (all optional):
 *   full_name, job_title, company, bio, phone, whatsapp, avatar_url, banner_url
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

  const full_name = sanitizeText(formData.get('full_name'))
  const job_title = sanitizeText(formData.get('job_title'))
  const company = sanitizeText(formData.get('company'))
  const bio = sanitizeText(formData.get('bio'))
  const phone = sanitizeText(formData.get('phone'))
  const whatsapp = sanitizeText(formData.get('whatsapp'))
  const avatar_url = (formData.get('avatar_url') as string | null ?? '').trim() || null
  const banner_url = (formData.get('banner_url') as string | null ?? '').trim() || null

  if (!isValidCloudinaryUrl(avatar_url) || !isValidCloudinaryUrl(banner_url)) {
    return { error: 'Invalid image URL. Must be a secure Cloudinary asset.' }
  }

  // Cast required: Supabase's postgrest generic chain infers update() param as
  // 'never' when multiple nullable fields are composed — known TS 5.x + supabase-ssr issue.
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const { error } = await (supabase as any)
    .from('profiles')
    .update({
      full_name,
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
