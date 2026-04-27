import crypto from 'crypto'

function extractPublicId(url: string): string | null {
  if (!url?.includes('res.cloudinary.com')) return null
  // Handles: /upload/v1234567890/folder/name.ext and /upload/folder/name.ext
  const match = url.match(/\/upload\/(?:v\d+\/)?(.+)\.[a-z0-9]+$/i)
  return match?.[1] ?? null
}

export async function deleteCloudinaryImage(url: string | null | undefined): Promise<void> {
  if (!url) return

  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) return

  const publicId = extractPublicId(url)
  if (!publicId) return

  const timestamp = Math.floor(Date.now() / 1000)
  const signature = crypto
    .createHash('sha1')
    .update(`public_id=${publicId}&timestamp=${timestamp}${apiSecret}`)
    .digest('hex')

  const body = new URLSearchParams()
  body.append('public_id', publicId)
  body.append('timestamp', String(timestamp))
  body.append('api_key', apiKey)
  body.append('signature', signature)

  try {
    const res = await fetch(`https://api.cloudinary.com/v1_1/${cloudName}/image/destroy`, {
      method: 'POST',
      body,
    })
    if (!res.ok) {
      console.error('[Cloudinary destroy] HTTP', res.status, await res.text())
    }
  } catch (err) {
    console.error('[Cloudinary destroy] fetch error', err)
  }
}
