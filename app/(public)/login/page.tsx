'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { createClient } from '@/lib/supabase/client'

export default function LoginPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string | null>(null)
  const router = useRouter()
  const supabase = createClient()

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    setError(null)
    const { error } = await supabase.auth.signInWithPassword({ email, password })
    if (error) {
      setError(error.message)
    } else {
      router.push('/dashboard')
      router.refresh()
    }
  }

  return (
    <main className="flex min-h-screen flex-col items-center justify-center p-24">
      <form onSubmit={handleLogin} className="w-full max-w-sm rounded-lg border p-6 shadow-sm">
        <h2 className="mb-4 text-2xl font-bold">Log in</h2>
        {error && <p className="mb-4 text-sm text-red-500">{error}</p>}
        <div className="mb-4">
          <label className="block text-sm font-medium mb-1">Email</label>
          <input required type="email" value={email} onChange={e => setEmail(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <div className="mb-6">
          <label className="block text-sm font-medium mb-1">Password</label>
          <input required type="password" value={password} onChange={e => setPassword(e.target.value)} className="w-full border p-2 rounded" />
        </div>
        <button type="submit" className="w-full bg-blue-600 text-white p-2 rounded font-medium">Log in</button>
      </form>
    </main>
  )
}
