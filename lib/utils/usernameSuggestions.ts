'use server'

import { checkUsernameAvailability } from '@/lib/auth/checkUsernameAvailability'
export async function getUsernameSuggestions(baseUsername: string): Promise<string[]> {
  // Normalize and clean the base username slightly
  let base = baseUsername.toLowerCase().trim()
  base = base.replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '').replace(/-+/g, '-')

  if (!base) return []

  const suffixes = ['123', '_dev', '01', '_xyz', 'ok', '_pro', '99', 'x']
  
  // Shuffle nicely to keep it pseudo-randomized but deterministic per session
  const shuffled = suffixes.sort(() => 0.5 - Math.random())

  const suggestions: string[] = []

  for (const suffix of shuffled) {
    if (suggestions.length >= 3) break // We want a maximum of 3 suggestions

    const suggestion = `${base}${suffix}`
    // Await server-side DB check to ensure collision avoidance
    const { available } = await checkUsernameAvailability(suggestion)
    if (available) {
      suggestions.push(suggestion)
    }
  }

  // Fallback in the extremely rare case all 8 suffixes were taken
  if (suggestions.length === 0) {
    const fallback = `${base}${Math.floor(Math.random() * 10000)}`
    suggestions.push(fallback)
  }

  return suggestions
}
