/**
 * Data adapters: Database row types → UI types.
 *
 * Pure functions with no side effects. These sit at the boundary between
 * the Supabase data layer and the UI component layer.
 *
 * Rules:
 *  - No imports from @/frontend/** — adapters live in the backend lib.
 *  - No async operations — adapters are synchronous transforms only.
 *  - Never expose DB-internal fields (role, is_active, service_expires_at, etc.)
 *    to the UI layer through these adapters.
 */

import { Database } from '@/types/database'
import { templateIdToKey } from '@/lib/utils/template-map'

// ─── Source types (DB rows) ───────────────────────────────────────────────────

export type DBProfile = Database['public']['Tables']['profiles']['Row']
export type DBButton = Database['public']['Tables']['action_buttons']['Row']

// ─── Target types (UI contracts) ─────────────────────────────────────────────
// Defined locally here so adapters.ts has no dependency on the /frontend folder.
// The frontend's /types/ui.types.ts must remain structurally identical to these.

export type UILinkItem = {
  id: string
  title: string
  url: string
  icon: string
}

export type UIUserProfile = {
  id: string
  username?: string
  name: string
  email: string
  phone?: string
  whatsapp?: string
  title?: string
  company?: string
  bio?: string
  profileImage?: string
  bannerImage?: string
  selectedTemplate?: string
  links?: UILinkItem[]
}

// ─── Adapters ─────────────────────────────────────────────────────────────────

/**
 * Maps a Supabase `action_buttons` row to a UI LinkItem.
 *
 * Field renames:
 *   button.label → link.title
 *
 * Fields intentionally excluded (backend-internal):
 *   profile_id, sort_order, is_active, created_at
 */
export function dbButtonToLinkItem(button: DBButton): UILinkItem {
  return {
    id: button.id,
    title: button.label,
    url: button.url,
    icon: button.icon,
  }
}

/**
 * Maps a Supabase `profiles` row (+ optional array of active buttons)
 * to a UI UserProfile.
 *
 * Field renames:
 *   profile.full_name  → user.name
 *   profile.job_title  → user.title
 *   profile.avatar_url → user.profileImage
 *   profile.banner_url → user.bannerImage
 *   profile.template_id (number) → user.selectedTemplate (string key)
 *
 * Fields intentionally excluded (security / internal):
 *   is_active, role, service_expires_at, created_at, updated_at
 *
 * @param profile  - Full profile row from Supabase.
 * @param buttons  - Active action_buttons rows already filtered/sorted by caller.
 *                   Pass an empty array if no buttons should be shown.
 */
export function dbProfileToUIProfile(
  profile: DBProfile,
  buttons: DBButton[] = []
): UIUserProfile {
  return {
    id: profile.id,
    username: profile.username,
    name: profile.full_name ?? '',
    email: profile.email ?? '',
    phone: profile.phone ?? undefined,
    whatsapp: profile.whatsapp ?? undefined,
    title: profile.job_title ?? undefined,
    company: profile.company ?? undefined,
    bio: profile.bio ?? undefined,
    profileImage: profile.avatar_url ?? undefined,
    bannerImage: profile.banner_url ?? undefined,
    selectedTemplate: templateIdToKey(profile.template_id),
    links: buttons.map(dbButtonToLinkItem),
  }
}
