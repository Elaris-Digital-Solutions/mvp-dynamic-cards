'use client'

import { useState } from 'react'
import { Database } from '@/types/database'
import { UserTable } from '@/components/admin/UserTable'
import { NFCCardTable } from '@/components/admin/NFCCardTable'
import { cn } from '@/lib/utils/cn'

type AdminProfile = Pick<
  Database['public']['Tables']['profiles']['Row'],
  'id' | 'full_name' | 'username' | 'email' | 'is_active' | 'role' | 'service_expires_at'
>
type AdminNFCCard = Pick<
  Database['public']['Tables']['nfc_cards']['Row'],
  'id' | 'card_uid' | 'is_active' | 'profile_id' | 'notes'
>

interface Stats {
  totalUsers: number
  activeUsers: number
  totalCards: number
  linkedCards: number
}

interface AdminPanelProps {
  profiles: AdminProfile[]
  cards: AdminNFCCard[]
  currentUserId: string
  stats: Stats
}

const statItems = (stats: Stats) => [
  { label: 'Total Usuarios', value: stats.totalUsers },
  { label: 'Usuarios Activos', value: stats.activeUsers },
  { label: 'Tarjetas NFC', value: stats.totalCards },
  { label: 'Tarjetas Vinculadas', value: stats.linkedCards },
]

type Tab = 'users' | 'cards'

export function AdminPanel({ profiles, cards, currentUserId, stats }: AdminPanelProps) {
  const [tab, setTab] = useState<Tab>('users')

  return (
    <div className="space-y-6">
      {/* Stats bar */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {statItems(stats).map(stat => (
          <div key={stat.label} className="rounded-xl border border-border/60 bg-card p-4">
            <p className="text-xs uppercase tracking-[0.2em] text-muted-foreground">{stat.label}</p>
            <p className="text-3xl font-bold mt-2 text-foreground">{stat.value}</p>
          </div>
        ))}
      </div>

      {/* Tab bar */}
      <div className="flex items-center gap-1 border-b border-border">
        <button
          onClick={() => setTab('users')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            tab === 'users'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Usuarios ({profiles.length})
        </button>
        <button
          onClick={() => setTab('cards')}
          className={cn(
            'px-4 py-2.5 text-sm font-medium border-b-2 transition-colors -mb-px',
            tab === 'cards'
              ? 'border-foreground text-foreground'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          )}
        >
          Tarjetas NFC ({cards.length})
        </button>
      </div>

      {/* Tab content */}
      {tab === 'users' && (
        <UserTable profiles={profiles} currentUserId={currentUserId} cards={cards} />
      )}
      {tab === 'cards' && (
        <NFCCardTable cards={cards} profiles={profiles} />
      )}
    </div>
  )
}
