import { Database } from '@/types/database'
import { InteractiveButton } from './InteractiveButton'

type Profile = Database['public']['Tables']['profiles']['Row']
type ActionButton = Database['public']['Tables']['action_buttons']['Row']

interface TemplateOneProps {
  profile: Profile
  buttons: ActionButton[]
}

export default function TemplateOne({ profile, buttons }: TemplateOneProps) {
  return (
    <main className="flex min-h-screen flex-col items-center bg-gray-50 py-12 px-4 sm:px-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-sm border p-8 flex flex-col items-center text-center">
        {profile.avatar_url ? (
          <img src={profile.avatar_url} alt={profile.full_name || profile.username} className="w-24 h-24 rounded-full mb-4 object-cover" />
        ) : (
          <div className="w-24 h-24 rounded-full bg-gray-200 mb-4 flex items-center justify-center text-gray-500 font-bold text-xl">
            {profile.full_name?.[0]?.toUpperCase() || profile.username[0]?.toUpperCase()}
          </div>
        )}
        
        <h1 className="text-2xl font-bold text-gray-900">{profile.full_name || `@${profile.username}`}</h1>
        
        {profile.job_title && (
          <p className="text-gray-600 font-medium mt-1">
            {profile.job_title} {profile.company && `at ${profile.company}`}
          </p>
        )}
        
        {profile.bio && (
          <p className="text-gray-500 text-sm mt-4 text-center leading-relaxed">
            {profile.bio}
          </p>
        )}

        <div className="w-full mt-8 space-y-3">
          {buttons.length === 0 && (
            <p className="text-gray-400 text-sm italic">No links available</p>
          )}
          {buttons.map(button => (
            <InteractiveButton key={button.id} button={button} profileId={profile.id} />
          ))}
        </div>
      </div>
    </main>
  )
}
