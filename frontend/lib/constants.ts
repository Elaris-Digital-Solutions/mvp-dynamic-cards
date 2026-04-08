/**
 * UI constants — pure data, no backend dependencies.
 *
 * To add templates: extend TEMPLATES and update TemplateKey in ui.types.ts.
 */

export const TEMPLATES = {
  'minimal-black': {
    id: 'minimal-black',
    name: 'Minimal Black',
    category: 'CORPORATIVO',
    description: 'Sobria, nítida y de alto contraste.',
    colors: {
      background: '#05070b',
      cardBg: '#0a0f16',
      text: '#f7f9fc',
      border: '#1b2e49',
      accent: '#10223f',
    },
    textStyle: 'light' as const,
  },
} as const

export const SOCIAL_ICONS = {
  linkedin: 'linkedin',
  whatsapp: 'whatsapp',
  instagram: 'instagram',
  twitter: 'twitter',
  github: 'github',
  email: 'mail',
  website: 'globe',
} as const
