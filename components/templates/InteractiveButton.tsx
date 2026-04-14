'use client'

import { Database } from '@/types/database'

type ActionButton = Database['public']['Tables']['action_buttons']['Row']

export function InteractiveButton({ button, profileId }: { button: ActionButton, profileId: string }) {

  const handleClick = () => {
    const payload = JSON.stringify({ 
      profile_id: profileId, 
      button_id: button.id,
      url: button.url,
      label: button.label
    })

    try {
      if (typeof navigator !== 'undefined' && navigator.sendBeacon) {
        // Blob with application/json required to properly parse on the Next.js API side using req.json()
        const blob = new Blob([payload], { type: 'application/json' })
        navigator.sendBeacon('/api/track-click', blob)
      } else {
        // Fallback using keepalive
        fetch('/api/track-click', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: payload,
          keepalive: true
        }).catch(() => {})
      }
    } catch (err) {
      // Fail silently
    }
  }

  return (
    <a 
      href={button.url} 
      onClick={handleClick}
      target="_blank"
      rel="noopener noreferrer"
      className="block w-full py-3 px-4 rounded-xl border font-medium transition-all bg-white text-gray-800 border-gray-200 hover:bg-gray-50 hover:shadow-sm flex items-center justify-center"
    >
      {button.label}
    </a>
  )
}
