'use client'

import { useState, useEffect, useRef } from 'react'
import { searchAdminProfiles } from '@/lib/actions/admin'

export function UserSearchAutocomplete() {
  const [searchQuery, setSearchQuery] = useState('')
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [selectedProfile, setSelectedProfile] = useState<{ id: string, username: string, full_name: string | null, is_active: boolean } | null>(null)
  const [showDropdown, setShowDropdown] = useState(false)
  const searchRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!searchQuery.trim() || selectedProfile) {
      setSearchResults([])
      setIsSearching(false)
      return
    }

    const timer = setTimeout(async () => {
      setIsSearching(true)
      const res = await searchAdminProfiles(searchQuery)
      if (res.profiles) {
        setSearchResults(res.profiles)
      }
      setIsSearching(false)
    }, 400)

    return () => clearTimeout(timer)
  }, [searchQuery, selectedProfile])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])

  return (
    <div className="flex flex-col" ref={searchRef}>
      <label className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">
        Perfil de destino
      </label>
      <div className="relative">
        {selectedProfile ? (
          <div className="flex items-center justify-between w-full border border-border bg-accent/30 p-2.5 rounded text-sm text-foreground font-medium">
            <span>
              {selectedProfile.full_name
                ? `${selectedProfile.full_name} (@${selectedProfile.username})`
                : `@${selectedProfile.username}`}
              {!selectedProfile.is_active && (
                <span className="ml-2 text-xs text-muted-foreground">[Inactivo]</span>
              )}
            </span>
            <button
              type="button"
              onClick={() => { setSelectedProfile(null); setSearchQuery(''); setShowDropdown(true) }}
              className="cursor-pointer text-muted-foreground hover:text-foreground p-1 font-bold text-lg leading-none ml-2"
            >
              &times;
            </button>
          </div>
        ) : (
          <>
            <input
              type="text"
              placeholder="Buscar usuario por username..."
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true) }}
              onFocus={() => setShowDropdown(true)}
              className="w-full border border-border bg-background text-foreground placeholder:text-muted-foreground/50 p-2.5 rounded text-sm focus:ring-1 focus:ring-ring focus:outline-none transition-colors"
              autoComplete="off"
            />
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-card border border-border rounded-md shadow-[0_8px_24px_-8px_rgba(0,0,0,0.6)] max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-sm text-muted-foreground italic">Buscando...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <div
                      key={p.id}
                      onClick={() => { if (p.is_active) { setSelectedProfile(p); setShowDropdown(false) } }}
                      className={`p-3 text-sm border-b border-border/40 last:border-0 ${
                        !p.is_active
                          ? 'opacity-50 cursor-not-allowed'
                          : 'cursor-pointer hover:bg-muted/50'
                      }`}
                    >
                      <div className="font-semibold text-foreground">
                        {p.full_name || `@${p.username}`}
                        {!p.is_active && (
                          <span className="ml-2 text-xs text-muted-foreground">[Inactivo]</span>
                        )}
                      </div>
                      <div className="text-xs text-muted-foreground">@{p.username}</div>
                    </div>
                  ))
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-3 text-sm text-muted-foreground italic">Sin resultados</div>
                ) : (
                  <div className="p-3 text-sm text-muted-foreground italic">Escribe para buscar usuarios</div>
                )}
              </div>
            )}
          </>
        )}
        {/* Hidden input to supply profile_id to FormData */}
        <input type="hidden" name="profile_id" value={selectedProfile?.id || ''} />
      </div>
    </div>
  )
}
