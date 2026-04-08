'use client'

import type { ReactNode } from 'react'
import { Avatar, AvatarImage, AvatarFallback } from '@/components/ui/avatar'
import { Button } from '@/components/ui/button'
import { TEMPLATES } from '@/lib/constants'
import { montserrat } from '@/lib/fonts'
import { Download, ExternalLink, Globe, Instagram, Linkedin, MessageCircle } from 'lucide-react'
import type { UserProfile } from '@/types/ui.types'

// ─── Types ────────────────────────────────────────────────────────────────────

interface LinktreeCardProps {
  /**
   * Profile data to render. Required — this component is purely presentational.
   * Integration point: pass the authenticated user profile or the fetched public profile.
   */
  profile: Pick<
    UserProfile,
    'name' | 'title' | 'company' | 'bio' | 'profileImage' | 'bannerImage' | 'selectedTemplate' | 'links'
  >
}

// ─── Component ────────────────────────────────────────────────────────────────

export function LinktreeCard({ profile }: LinktreeCardProps) {
  const selectedTemplate = profile.selectedTemplate || 'minimal-black'
  const template = TEMPLATES[selectedTemplate as keyof typeof TEMPLATES]

  if (!template) {
    return (
      <div className={`${montserrat.className} min-h-screen flex items-center justify-center px-6 py-10 bg-background`}>
        <div className="max-w-md text-center space-y-3">
          <h1 className="text-2xl font-bold text-foreground">Plantilla no encontrada</h1>
          <p className="text-muted-foreground">La plantilla seleccionada no existe.</p>
        </div>
      </div>
    )
  }

  const socialIcons: Record<string, ReactNode> = {
    linkedin: <Linkedin className="w-5 h-5" />,
    whatsapp: <MessageCircle className="w-5 h-5" />,
    instagram: <Instagram className="w-5 h-5" />,
    website: <Globe className="w-5 h-5" />,
    link: <Globe className="w-5 h-5" />,
  }

  const isLightTemplate = template.textStyle === 'dark'
  const visibleLinks = profile.links?.slice(0, 6) ?? []

  return (
    <div
      style={{ backgroundColor: template.colors.background }}
      className={`${montserrat.className} min-h-screen flex items-start justify-center px-4 py-6 md:py-8`}
    >
      <div
        style={{
          backgroundColor: isLightTemplate ? '#f8fbff' : '#04070d',
          borderColor: template.colors.border,
          color: template.colors.text,
        }}
        className="w-full max-w-[390px] md:max-w-[430px] overflow-hidden rounded-[28px] border shadow-[0_20px_70px_-30px_rgba(0,0,0,0.8)] animate-in fade-in zoom-in-[0.98] duration-1000 ease-out"
      >
        {/* Banner + Avatar */}
        <div className="relative h-28 md:h-32 w-full overflow-visible">
          <div className="absolute inset-0 overflow-hidden rounded-t-[28px]">
            <div
              className="absolute inset-0 bg-cover bg-center"
              style={{ backgroundImage: `url(${profile.bannerImage || '/tarjeta.jpeg'})` }}
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/15 via-black/30 to-black/75" />
            <div className="absolute inset-0 bg-[radial-gradient(80%_60%_at_50%_10%,rgba(255,255,255,0.18),transparent_65%)]" />
          </div>

          <Avatar className="absolute z-20 left-1/2 bottom-0 h-24 w-24 -translate-x-1/2 translate-y-[52%] rounded-3xl border-4 border-black/70 shadow-xl animate-in zoom-in-75 fade-in duration-500 delay-300 fill-mode-both">
            <AvatarImage src={profile.profileImage} />
            <AvatarFallback className="rounded-3xl text-xl font-bold bg-white text-black">
              {profile.name?.charAt(0) || 'U'}
            </AvatarFallback>
          </Avatar>
        </div>

        {/* Content */}
        <div className="px-6 pb-6 pt-14 md:px-7 text-center">
          <div className="animate-in slide-in-from-bottom-4 fade-in duration-500 delay-500 fill-mode-both">
            <h1 className="text-2xl md:text-3xl font-black tracking-tight uppercase leading-[1.02]">
              {profile.name || 'Sin nombre'}
            </h1>
            <p className="mt-1.5 text-xl md:text-2xl font-semibold" style={{ color: isLightTemplate ? '#1a2435' : '#e4e8f0' }}>
              {profile.title || 'Sin cargo'}
            </p>
            <p className="mt-1 text-sm font-semibold uppercase tracking-[0.08em]" style={{ color: isLightTemplate ? '#3a475c' : '#9ba7bf' }}>
              {profile.company || 'Sin empresa'}
            </p>
          </div>

          {profile.bio && (
            <p
              className="mt-3.5 text-sm md:text-base leading-relaxed animate-in fade-in duration-500 delay-700 fill-mode-both"
              style={{ color: isLightTemplate ? '#3a475c' : '#b7c1d4' }}
            >
              {profile.bio}
            </p>
          )}

          {/* Save contact button */}
          <Button
            className="mt-5 h-10 w-full rounded-xl font-semibold tracking-[0.1em] uppercase text-sm animate-in slide-in-from-bottom-4 fade-in duration-500 delay-1000 fill-mode-both"
            style={{
              backgroundColor: isLightTemplate ? '#101b2e' : '#f2f5f9',
              color: isLightTemplate ? '#f4f7fb' : '#111827',
            }}
          >
            <Download className="w-4 h-4 mr-2" />
            Sincronizar contacto
          </Button>

          {/* Links */}
          <div className="mt-4 space-y-2.5 text-left">
            {visibleLinks.length === 0 && (
              <div
                style={{
                  borderColor: isLightTemplate ? '#d0dceb' : template.colors.border,
                  backgroundColor: isLightTemplate ? '#ffffff' : '#060a12',
                  color: isLightTemplate ? '#1a2435' : template.colors.text,
                }}
                className="rounded-xl border px-4 py-3 text-sm font-medium"
              >
                Aun no has configurado enlaces.
              </div>
            )}

            {visibleLinks.map((link, index) => (
              <a
                key={link.id}
                href={link.url}
                target="_blank"
                rel="noopener noreferrer"
                style={{
                  borderColor: isLightTemplate ? '#d0dceb' : template.colors.border,
                  backgroundColor: isLightTemplate ? '#ffffff' : '#060a12',
                  color: isLightTemplate ? '#1a2435' : template.colors.text,
                  animationDelay: `${1200 + index * 100}ms`,
                }}
                className="group flex items-center gap-3 rounded-xl border px-4 py-3 transition-colors hover:bg-white/[0.04] animate-in slide-in-from-bottom-4 fade-in duration-500 fill-mode-both"
              >
                <span className="opacity-85">{socialIcons[link.icon] || <Globe className="w-5 h-5" />}</span>
                <span className="font-semibold text-base flex-1">{link.title}</span>
                <ExternalLink className="w-4 h-4 opacity-70 group-hover:opacity-100" />
              </a>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
