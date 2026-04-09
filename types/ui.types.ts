/**
 * UI-facing TypeScript types.
 *
 * These are frontend-only contracts — not tied to any database schema.
 * When integrating with a real backend, map your API responses to these
 * shapes before passing them to UI components.
 */

export type TemplateKey = 'minimal-black' // extend as templates are added

export type LinkIcon = 'instagram' | 'linkedin' | 'whatsapp' | 'website' | 'link'

export type LinkItem = {
  id: string
  title: string
  url: string
  icon: string
}

export type EditableLink = {
  id: string
  title: string
  url: string
  icon: LinkIcon
}

export type UserProfile = {
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
  selectedTemplate?: TemplateKey
  links?: LinkItem[]
}

export type ProfileFormState = {
  name: string
  title: string
  company: string
  email: string
  phone: string
  whatsapp: string
  bio: string
  profileImage: string
  bannerImage: string
}

export type SaveState = 'idle' | 'saving' | 'success' | 'error'

export type SaveStatus = {
  state: SaveState
  message: string
}

export type DashboardSection = 'inicio' | 'perfil' | 'botones' | 'plantilla'
