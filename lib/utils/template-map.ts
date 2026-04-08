/**
 * Bidirectional template ID mapping.
 *
 * The database stores templates as integers (`template_id: number`).
 * The frontend and UI layer identify templates by string keys (e.g. 'minimal-black').
 *
 * This module is the single source of truth for that mapping.
 * When new templates are added:
 *   1. Add the new integer ID → string key entry to TEMPLATE_ID_TO_KEY.
 *   2. TemplateKeyToId is derived automatically — no duplicate maintenance.
 */

/** All valid template string keys. Extend this union as new templates are added. */
export type TemplateKey = 'minimal-black'

/** Maps database integer IDs to frontend string keys. */
export const TEMPLATE_ID_TO_KEY = {
  1: 'minimal-black',
} as const satisfies Record<number, TemplateKey>

/** Maps frontend string keys to database integer IDs. Derived — never edit manually. */
export const TEMPLATE_KEY_TO_ID = Object.fromEntries(
  Object.entries(TEMPLATE_ID_TO_KEY).map(([id, key]) => [key, Number(id)])
) as Record<TemplateKey, number>

/** Default fallback template ID used when an unknown key is provided. */
export const DEFAULT_TEMPLATE_ID = 1 as const

/** Default fallback template key used when an unknown ID is provided. */
export const DEFAULT_TEMPLATE_KEY = 'minimal-black' as const satisfies TemplateKey

/**
 * Converts a database template_id integer to a UI string key.
 * Falls back to the default key for any unmapped integer.
 */
export function templateIdToKey(id: number): TemplateKey {
  return (TEMPLATE_ID_TO_KEY as Record<number, TemplateKey>)[id] ?? DEFAULT_TEMPLATE_KEY
}

/**
 * Converts a UI template string key to a database integer ID.
 * Falls back to the default ID for any unmapped key.
 */
export function templateKeyToId(key: string): number {
  return (TEMPLATE_KEY_TO_ID as Record<string, number>)[key] ?? DEFAULT_TEMPLATE_ID
}
