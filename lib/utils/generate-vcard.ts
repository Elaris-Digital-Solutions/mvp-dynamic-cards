interface VCardContact {
  firstName: string
  lastName: string
  title?: string
  company?: string
  phone?: string
  whatsapp?: string
  email?: string
}

function escapeField(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/;/g, '\\;')
    .replace(/,/g, '\\,')
    .replace(/\n/g, '\\n')
}

function normalizePhone(raw: string): string {
  const trimmed = raw.trim()
  const isInternational = trimmed.startsWith('+')
  const digits = trimmed.replace(/\D/g, '')
  return isInternational ? `+${digits}` : digits
}

export function generateVCard(contact: VCardContact): string {
  const { firstName, lastName, title, company, phone, whatsapp, email } = contact
  const fullName = [firstName, lastName].filter(Boolean).join(' ')

  // Prefer whatsapp field — more likely to carry the international +prefix needed for auto-linking
  const rawPhone = whatsapp || phone
  const normalizedPhone = rawPhone ? normalizePhone(rawPhone) : null

  const lines: string[] = [
    'BEGIN:VCARD',
    'VERSION:3.0',
    `FN:${escapeField(fullName)}`,
    `N:${escapeField(lastName)};${escapeField(firstName)};;;`,
  ]

  if (company) lines.push(`ORG:${escapeField(company)}`)
  if (title) lines.push(`TITLE:${escapeField(title)}`)
  if (normalizedPhone) lines.push(`TEL;TYPE=CELL,VOICE:${normalizedPhone}`)
  if (email) lines.push(`EMAIL:${escapeField(email)}`)

  lines.push('END:VCARD')
  return lines.join('\r\n')
}
