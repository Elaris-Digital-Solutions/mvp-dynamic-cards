/**
 * Mock data for UI development and visual testing.
 *
 * These are the ONLY data sources in the frontend layer.
 * Replace with real API calls during backend integration.
 *
 * Design principles:
 *  - Minimal: only fields the UI actually uses
 *  - Clean: no database-specific fields (e.g., no created_at, deleted_at, template_id)
 *  - Realistic: values that produce a complete, meaningful UI
 */

import type { UserProfile, LinkItem } from '@/types/ui.types'

export const MOCK_LINKS: LinkItem[] = [
  { id: 'link-1', title: 'LinkedIn', url: 'https://linkedin.com', icon: 'linkedin' },
  { id: 'link-2', title: 'WhatsApp', url: 'https://wa.me/15550000000', icon: 'whatsapp' },
  { id: 'link-3', title: 'Portfolio', url: 'https://example.com', icon: 'website' },
]

export const MOCK_USER: UserProfile = {
  id: 'mock-user-001',
  username: 'john-doe',
  name: 'John Doe',
  email: 'john@example.com',
  phone: '+1 555 000 0000',
  whatsapp: '+1 555 000 0000',
  title: 'Product Designer',
  company: 'VELTRIX',
  bio: 'Passionate about design systems and digital identity.',
  profileImage: '/placeholder-user.jpg',
  bannerImage: '/tarjeta.jpeg',
  selectedTemplate: 'minimal-black',
  links: MOCK_LINKS,
}

/**
 * Mock public profile — used by the /[username] route.
 * In real integration: fetch from your API using the `username` param.
 */
export const MOCK_PUBLIC_PROFILE: UserProfile = {
  ...MOCK_USER,
  name: 'Jane Smith',
  username: 'jane-smith',
  title: 'Brand Strategist',
  company: 'Studio NX',
  bio: 'Building brands that resonate. NFC-powered digital presence.',
}
