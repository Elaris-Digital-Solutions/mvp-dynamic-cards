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
    }, 400) // Debounce latency

    return () => clearTimeout(timer)
  }, [searchQuery, selectedProfile])

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowDropdown(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [])

  return (
    <div className="flex flex-col" ref={searchRef}>
      <label className="text-xs font-bold text-gray-600 uppercase tracking-wider mb-2">Foreign Target (Profile ID)</label>
      <div className="relative">
        {selectedProfile ? (
          <div className="flex items-center justify-between w-full border border-gray-300 p-2.5 rounded text-sm bg-blue-50 border-blue-200 text-blue-900 font-medium">
            <span>{selectedProfile.full_name ? `${selectedProfile.full_name} (@${selectedProfile.username})` : `@${selectedProfile.username}`} {!selectedProfile.is_active && ' [INACTIVE]'}</span>
            <button 
              type="button" 
              onClick={() => { setSelectedProfile(null); setSearchQuery(''); setShowDropdown(true); }} 
              className="cursor-pointer text-blue-500 hover:text-blue-700 p-1 font-bold text-lg leading-none"
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
              onChange={(e) => { setSearchQuery(e.target.value); setShowDropdown(true); }}
              onFocus={() => setShowDropdown(true)}
              className="w-full border border-gray-300 p-2.5 rounded text-sm bg-gray-50 text-gray-900 placeholder:text-gray-400 focus:bg-white focus:ring-1 focus:ring-blue-500 transition-colors"
              autoComplete="off"
            />
            {showDropdown && (
              <div className="absolute z-10 w-full mt-1 bg-white border border-gray-200 rounded-md shadow-lg max-h-60 overflow-y-auto">
                {isSearching ? (
                  <div className="p-3 text-sm text-gray-500 italic">Buscando...</div>
                ) : searchResults.length > 0 ? (
                  searchResults.map(p => (
                    <div 
                      key={p.id} 
                      onClick={() => { if (p.is_active) { setSelectedProfile(p); setShowDropdown(false); } }}
                      className={`p-3 text-sm border-b border-gray-100 last:border-0 ${!p.is_active ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer hover:bg-gray-50'}`}
                    >
                      <div className="font-semibold text-gray-900">{p.full_name || `@${p.username}`} {!p.is_active && ' [INACTIVE]'}</div>
                      <div className="text-xs text-gray-500">@{p.username}</div>
                    </div>
                  ))
                ) : searchQuery.trim().length >= 2 ? (
                  <div className="p-3 text-sm text-gray-500 italic">No results</div>
                ) : (
                  <div className="p-3 text-sm text-gray-500 italic">Escribe para buscar usuarios</div>
                )}
              </div>
            )}
          </>
        )}
        {/* Hidden input to supply profile_id to FormData natively */}
        <input type="hidden" name="profile_id" value={selectedProfile?.id || ''} />
      </div>
    </div>
  )
}
