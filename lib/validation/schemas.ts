import { z } from 'zod'

// ─── Shared primitives ────────────────────────────────────────────────────────

const uuid = z
  .string()
  .regex(/^[0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i, 'Invalid UUID')

const safeText = (max: number) =>
  z.string().trim().max(max).transform(v => v.replace(/</g, '&lt;').replace(/>/g, '&gt;'))

const cloudinaryUrl = z
  .string()
  .nullable()
  .optional()
  .transform(v => (v?.trim() === '' ? null : v?.trim() ?? null))
  .refine(v => {
    if (!v) return true
    try {
      return new URL(v).hostname === 'res.cloudinary.com'
    } catch {
      return false
    }
  }, 'Must be a secure Cloudinary URL')

const httpUrl = z
  .string()
  .trim()
  .transform(v => (!v.startsWith('http://') && !v.startsWith('https://') ? `https://${v}` : v))
  .refine(v => {
    try { new URL(v); return true } catch { return false }
  }, 'Invalid URL format')

// ─── Button schemas ───────────────────────────────────────────────────────────

export const createButtonSchema = z.object({
  id: uuid,
  label: safeText(100),
  url: httpUrl,
  icon: safeText(50).optional().default('link'),
})

export const updateButtonSchema = z.object({
  label: safeText(100),
  url: httpUrl,
  icon: safeText(50).optional().default('link'),
})

// ─── Profile schemas ──────────────────────────────────────────────────────────

export const updateProfileSchema = z.object({
  first_name: safeText(60).nullable().optional(),
  last_name:  safeText(60).nullable().optional(),
  job_title:  safeText(100).nullable().optional(),
  company:    safeText(100).nullable().optional(),
  bio:        safeText(500).nullable().optional(),
  phone:      safeText(30).nullable().optional(),
  whatsapp:   safeText(30).nullable().optional(),
  avatar_url: cloudinaryUrl,
  banner_url: cloudinaryUrl,
})

// ─── Admin schemas ────────────────────────────────────────────────────────────

export const processNFCCardSchema = z.object({
  card_uid:   z.string().trim().min(1, 'Card UID is required').max(100),
  profile_id: uuid.nullable().optional(),
  notes:      safeText(500).nullable().optional(),
  is_active:  z.boolean(),
})

export const searchProfilesSchema = z.object({
  query: z.string().trim().min(2, 'Query must be at least 2 characters').max(100),
})
