'use client'

import { useState, useEffect, useRef } from 'react'
import { ChevronDown } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import {
  Command,
  CommandEmpty,
  CommandInput,
  CommandItem,
  CommandList,
} from '@/components/ui/command'
import { Input } from '@/components/ui/input'
import { PHONE_COUNTRIES, DEFAULT_COUNTRY } from '@/lib/constants/phone-countries'
import type { PhoneCountry } from '@/lib/constants/phone-countries'

type PhoneInputProps = {
  id?: string
  value: string
  onChange: (value: string) => void
  placeholder?: string
  disabled?: boolean
}

function parsePhoneValue(value: string): { country: PhoneCountry; localNumber: string } {
  if (!value) return { country: DEFAULT_COUNTRY, localNumber: '' }
  const sorted = [...PHONE_COUNTRIES].sort((a, b) => b.dialCode.length - a.dialCode.length)

  // Primary: formato guardado "+CC local" (e.g. "+51 987450340")
  const matched = sorted.find(c => value.startsWith(c.dialCode + ' '))
  if (matched) return { country: matched, localNumber: value.slice(matched.dialCode.length + 1) }

  // Fallback: valor legacy sin prefijo "+CC " (e.g. "51987450340")
  // Compara solo dígitos para detectar el código de país al inicio
  const digits = value.replace(/\D/g, '')
  if (digits.length >= 7) {
    const byDigits = sorted.find(c => digits.startsWith(c.dialCode.replace('+', '')))
    if (byDigits) {
      const prefix = byDigits.dialCode.replace('+', '')
      return { country: byDigits, localNumber: digits.slice(prefix.length) }
    }
  }

  return { country: DEFAULT_COUNTRY, localNumber: value }
}

export function PhoneInput({ id, value, onChange, placeholder, disabled }: PhoneInputProps) {
  const { country: parsedCountry, localNumber: parsedLocal } = parsePhoneValue(value)
  const [open, setOpen] = useState(false)
  const [selectedCountry, setSelectedCountry] = useState<PhoneCountry>(parsedCountry)
  const [localNumber, setLocalNumber] = useState(parsedLocal)

  const lastValueRef = useRef(value)
  useEffect(() => {
    if (value !== lastValueRef.current) {
      lastValueRef.current = value
      const { country, localNumber: local } = parsePhoneValue(value)
      setSelectedCountry(country)
      setLocalNumber(local)
    }
  }, [value])

  const handleCountrySelect = (country: PhoneCountry) => {
    setSelectedCountry(country)
    setOpen(false)
    if (localNumber) onChange(country.dialCode + ' ' + localNumber)
  }

  const handleNumberChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^\d\s\-]/g, '')
    setLocalNumber(raw)
    onChange(raw ? selectedCountry.dialCode + ' ' + raw : '')
  }

  return (
    <div className="flex rounded-md border border-input overflow-hidden focus-within:ring-1 focus-within:ring-ring focus-within:ring-offset-0">
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <button
            type="button"
            disabled={disabled}
            className="flex items-center gap-1.5 px-3 py-2 bg-muted border-r border-input text-sm shrink-0 hover:bg-muted/80 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            <span className="text-base leading-none">{selectedCountry.flag}</span>
            <span className="text-muted-foreground tabular-nums">{selectedCountry.dialCode}</span>
            <ChevronDown className="w-3 h-3 text-muted-foreground" />
          </button>
        </PopoverTrigger>
        <PopoverContent className="w-64 p-0" align="start">
          <Command>
            <CommandInput placeholder="Buscar país..." />
            <CommandList className="max-h-56">
              <CommandEmpty>Sin resultados.</CommandEmpty>
              {PHONE_COUNTRIES.map(country => (
                <CommandItem
                  key={country.code}
                  value={`${country.name} ${country.dialCode}`}
                  onSelect={() => handleCountrySelect(country)}
                  className="flex items-center gap-2 cursor-pointer"
                >
                  <span className="text-base">{country.flag}</span>
                  <span className="flex-1 text-sm">{country.name}</span>
                  <span className="text-xs text-muted-foreground tabular-nums">{country.dialCode}</span>
                </CommandItem>
              ))}
            </CommandList>
          </Command>
        </PopoverContent>
      </Popover>

      <Input
        id={id}
        type="tel"
        value={localNumber}
        onChange={handleNumberChange}
        placeholder={placeholder ?? '987 654 321'}
        disabled={disabled}
        className="border-0 rounded-none shadow-none focus-visible:ring-0 flex-1 min-w-0"
      />
    </div>
  )
}
