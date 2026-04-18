import { notFound, redirect } from 'next/navigation'
import { createClient } from '@/lib/supabase/server'

interface Props {
  params: Promise<{
    card_uid: string
  }>
}

export default async function NFCForwarderPage({ params }: Props) {
  const { card_uid: rawUid } = await params
  const card_uid = decodeURIComponent(rawUid).replace(/[:\-\s]/g, '').toUpperCase()
  const supabase = await createClient()

  const { data: card } = await supabase
    .from('nfc_cards')
    .select('is_active, profile_id')
    .eq('card_uid', card_uid)
    .single() as { data: { is_active: boolean; profile_id: string | null } | null, error: unknown }

  // Mask existence entirely if card not mapped or explicitly disabled via admin
  if (!card || !card.is_active || !card.profile_id) {
    notFound()
  }

  const { data: profile } = await supabase
    .from('profiles')
    .select('username, is_active')
    .eq('id', card.profile_id)
    .single() as { data: { username: string; is_active: boolean } | null, error: unknown }

  // Ensure targeted profiles are securely active locally before continuing proxy
  if (!profile || !profile.is_active) {
    notFound()
  }

  // Bouncing layer (NFC -> Mapping -> Action)
  redirect(`/${profile.username}`)
}
