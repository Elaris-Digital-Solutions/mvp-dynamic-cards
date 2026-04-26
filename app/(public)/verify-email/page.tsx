import { VerifyEmailClient } from './verify-email-client'

interface Props {
  searchParams: Promise<{ email?: string }>
}

export default async function VerifyEmailPage({ searchParams }: Props) {
  const { email } = await searchParams
  return <VerifyEmailClient email={email ?? ''} />
}
