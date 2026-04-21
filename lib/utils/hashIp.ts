// HMAC-SHA256 con secreto server-side para pseudonimización real (GDPR).
// Sin IP_HASH_SECRET cae a SHA-256 simple (solo para desarrollo local).
export async function hashIp(ip: string | null | undefined): Promise<string> {
  if (!ip || ip.trim() === '' || ip === 'unknown') return 'unknown'

  try {
    const normalized = ip.trim()
    const secret = process.env.IP_HASH_SECRET

    if (secret) {
      const enc = new TextEncoder()
      const key = await crypto.subtle.importKey(
        'raw',
        enc.encode(secret),
        { name: 'HMAC', hash: 'SHA-256' },
        false,
        ['sign']
      )
      const sig = await crypto.subtle.sign('HMAC', key, enc.encode(normalized))
      return Array.from(new Uint8Array(sig)).map(b => b.toString(16).padStart(2, '0')).join('')
    }

    // Fallback sin secreto (dev / CI)
    const data = new TextEncoder().encode(normalized)
    const buf = await crypto.subtle.digest('SHA-256', data)
    return Array.from(new Uint8Array(buf)).map(b => b.toString(16).padStart(2, '0')).join('')
  } catch {
    return 'unknown'
  }
}
