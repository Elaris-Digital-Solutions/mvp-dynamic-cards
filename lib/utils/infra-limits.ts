import { unstable_cache } from 'next/cache'
import { createServiceClient } from '@/lib/supabase/server'

const SUPABASE_STORAGE_LIMIT_BYTES = 1_073_741_824 // 1 GB free tier
const CLOUDINARY_CREDITS_LIMIT    = 25             // free tier
const ALERT_THRESHOLD             = 0.80

async function fetchInfraLimits() {
  const [supabaseResult, cloudinaryResult] = await Promise.allSettled([
    fetchSupabasePdfUsage(),
    fetchCloudinaryUsage(),
  ])

  const supabaseBytes =
    supabaseResult.status === 'fulfilled' ? supabaseResult.value : 0

  const cloudinary =
    cloudinaryResult.status === 'fulfilled'
      ? cloudinaryResult.value
      : { usedCredits: 0, limitCredits: CLOUDINARY_CREDITS_LIMIT, available: false }

  const supabasePercent = supabaseBytes / SUPABASE_STORAGE_LIMIT_BYTES

  return {
    supabase: {
      usedBytes:  supabaseBytes,
      limitBytes: SUPABASE_STORAGE_LIMIT_BYTES,
      percent:    supabasePercent,
      alert:      supabasePercent >= ALERT_THRESHOLD,
    },
    cloudinary: {
      usedCredits:  cloudinary.usedCredits,
      limitCredits: cloudinary.limitCredits,
      percent:      cloudinary.usedCredits / cloudinary.limitCredits,
      alert:        cloudinary.usedCredits / cloudinary.limitCredits >= ALERT_THRESHOLD,
      available:    cloudinary.available,
    },
  }
}

async function fetchSupabasePdfUsage(): Promise<number> {
  const supabase = createServiceClient()

  const { data, error } = await (supabase
    .from('profiles')
    .select('pdf_size')
    .not('pdf_size', 'is', null) as any)

  if (error) throw error

  return (data as { pdf_size: number }[]).reduce(
    (sum, row) => sum + (row.pdf_size ?? 0),
    0
  )
}

async function fetchCloudinaryUsage(): Promise<{
  usedCredits: number
  limitCredits: number
  available: boolean
}> {
  const cloudName = process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME
  const apiKey    = process.env.CLOUDINARY_API_KEY
  const apiSecret = process.env.CLOUDINARY_API_SECRET

  if (!cloudName || !apiKey || !apiSecret) {
    return { usedCredits: 0, limitCredits: CLOUDINARY_CREDITS_LIMIT, available: false }
  }

  const credentials = Buffer.from(`${apiKey}:${apiSecret}`).toString('base64')
  const res = await fetch(
    `https://api.cloudinary.com/v1_1/${cloudName}/usage`,
    { headers: { Authorization: `Basic ${credentials}` } }
  )

  if (!res.ok) throw new Error(`Cloudinary usage API returned ${res.status}`)

  const json = await res.json()
  return {
    usedCredits:  json.credits?.usage  ?? 0,
    limitCredits: json.credits?.limit  ?? CLOUDINARY_CREDITS_LIMIT,
    available:    true,
  }
}

export const getInfraLimits = unstable_cache(
  fetchInfraLimits,
  ['infra-limits'],
  { revalidate: 86_400 } // 24 horas
)

export type InfraLimits = Awaited<ReturnType<typeof fetchInfraLimits>>
