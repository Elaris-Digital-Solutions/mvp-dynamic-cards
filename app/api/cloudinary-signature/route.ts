import crypto from 'crypto'
import { NextResponse } from 'next/server'
import { getCurrentUser } from '@/lib/auth/getCurrentUser'

export async function POST(request: Request) {
  const user = await getCurrentUser()
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  const apiSecret = process.env.CLOUDINARY_API_SECRET
  if (!apiSecret) {
    return NextResponse.json({ error: 'Server misconfiguration' }, { status: 500 })
  }

  const { paramsToSign } = await request.json()

  const sortedParams = Object.keys(paramsToSign)
    .sort()
    .map((key) => `${key}=${paramsToSign[key]}`)
    .join('&')

  const signature = crypto
    .createHash('sha256')
    .update(sortedParams + apiSecret)
    .digest('hex')

  return NextResponse.json({ signature })
}
