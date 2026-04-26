import { notFound, redirect } from 'next/navigation'
import { createPublicClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{
    card_uid: string
  }>
}

export default async function NFCForwarderPage({ params }: Props) {
  const { card_uid: rawUid } = await params
  const card_uid = decodeURIComponent(rawUid).replace(/[:\-\s]/g, '').toUpperCase()
  const supabase = createPublicClient()

  const { data: username } = await (supabase as any).rpc('resolve_nfc', { p_uid: card_uid })

  if (!username) notFound()

  redirect(`/${username}`)
}
