'use client'

import { Check, X } from 'lucide-react'
import { cn } from '@/lib/utils'

const REQUIREMENTS = [
  { label: 'Mínimo 12 caracteres',         test: (p: string) => p.length >= 12 },
  { label: 'Al menos una letra minúscula',  test: (p: string) => /[a-z]/.test(p) },
  { label: 'Al menos una letra mayúscula',  test: (p: string) => /[A-Z]/.test(p) },
  { label: 'Al menos un número',            test: (p: string) => /[0-9]/.test(p) },
  { label: 'Al menos un carácter especial', test: (p: string) => /[!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?]/.test(p) },
]

interface PasswordRequirementsProps {
  password: string
  dark?: boolean
}

export function PasswordRequirements({ password, dark = false }: PasswordRequirementsProps) {
  if (!password) return null

  return (
    <ul className="space-y-1 mt-1.5">
      {REQUIREMENTS.map(({ label, test }) => {
        const met = test(password)
        return (
          <li
            key={label}
            className={cn(
              'flex items-center gap-1.5 text-xs transition-colors duration-150',
              met
                ? dark ? 'text-green-400'     : 'text-green-600 dark:text-green-400'
                : dark ? 'text-white/45'      : 'text-muted-foreground'
            )}
          >
            {met
              ? <Check className="w-3 h-3 shrink-0" />
              : <X    className="w-3 h-3 shrink-0 opacity-40" />
            }
            {label}
          </li>
        )
      })}
    </ul>
  )
}
