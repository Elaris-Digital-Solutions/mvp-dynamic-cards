'use client'

import { Database } from '@/types/database'
import { useState } from 'react'

type ActionButton = Database['public']['Tables']['action_buttons']['Row']

export function InteractiveButton({ button, profileId }: { button: ActionButton, profileId: string }) {
  const [isLoading, setIsLoading] = useState(false)

  const handleClick = async (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isLoading) return;
    
    setIsLoading(true);
    try {
      await fetch('/api/track-click', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ profile_id: profileId, button_id: button.id })
      });
    } catch (err) {
      console.error("Click tracking failed", err)
    } finally {
      setIsLoading(false);
      window.open(button.url, '_blank', 'noopener,noreferrer');
    }
  }

  return (
    <a 
      href={button.url} 
      onClick={handleClick}
      className={`block w-full py-3 px-4 rounded-xl border font-medium transition-all ${
        isLoading 
        ? 'bg-gray-100 text-gray-500 border-gray-200 cursor-wait flex items-center justify-center' 
        : 'bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:shadow-sm flex items-center justify-center'
      }`}
    >
      {isLoading ? 'Redirecting...' : button.label}
    </a>
  )
}
