'use client'

import Link from 'next/link'
import Image from 'next/image'
import { MapPin, Mail } from 'lucide-react'

function WhatsAppIcon({ className }: { className?: string; strokeWidth?: number }) {
  return (
    <svg viewBox="0 0 24 24" className={className} fill="currentColor" aria-hidden>
      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51a12.8 12.8 0 0 0-.57-.01c-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 0 1-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 0 1-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 0 1 2.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0 0 12.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 0 0 5.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 0 0-3.48-8.413Z" />
    </svg>
  )
}

const navLinks = [
  { label: 'Inicio', scrollTo: null, href: null },
  { label: 'El problema', scrollTo: 'problema', href: null },
  { label: 'Cómo funciona', scrollTo: 'como-funciona', href: null },
  { label: 'Características', scrollTo: 'caracteristicas', href: null },
]

function scrollToSection(id: string | null) {
  if (!id) {
    window.scrollTo({ top: 0, behavior: 'smooth' })
    return
  }
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth' })
}

const contactItems = [
  {
    icon: Mail,
    label: 'hola@veltrix.co',
    href: 'mailto:hola@veltrix.co',
  },
  {
    icon: WhatsAppIcon,
    label: '+51 987 426 664',
    href: 'https://wa.me/51987426664',
  },
  {
    icon: MapPin,
    label: 'Lima, Perú',
    href: null,
  },
]

export function Footer() {
  return (
    <footer id="site-footer" className="relative bg-[#060c14] overflow-hidden">
      {/* Grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(255,255,255,0.03) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.03) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />
      {/* Top edge glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-x-0 top-0 h-px z-0"
        style={{
          background:
            'linear-gradient(to right, transparent, rgba(62, 119, 198, 0.35) 40%, rgba(62, 119, 198, 0.35) 60%, transparent)',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main content */}
        <div className="pt-16 pb-12 sm:pt-20 sm:pb-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10 lg:gap-12">

            {/* Brand — 2 col-spans on lg */}
            <div className="lg:col-span-2 flex flex-col gap-5">
              <div>
                <Image
                  src="/logo.png"
                  alt="Veltrix"
                  width={320}
                  height={80}
                  className="h-4 w-auto object-contain"
                />
                <p className="mt-3 text-sm text-[#8ab0d0] leading-relaxed max-w-[260px]">
                  La plataforma de networking inteligente para profesionales de alto impacto. 
                </p>
              </div>

              {/* Social links */}
              <div className="flex items-center gap-3 mt-1">
                {[
                  {
                    label: 'LinkedIn',
                    href: 'https://linkedin.com',
                    icon: (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Instagram',
                    href: 'https://instagram.com',
                    icon: (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
                      </svg>
                    ),
                  },
                  {
                    label: 'Twitter/X',
                    href: 'https://x.com',
                    icon: (
                      <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
                        <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
                      </svg>
                    ),
                  },
                ].map(({ label, href, icon }) => (
                  <a
                    key={label}
                    href={href}
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label={label}
                    className="flex h-8 w-8 items-center justify-center rounded-lg border border-[#1b2e49] bg-[#0d1e38]/60 text-[#8ab0d0] hover:border-[#2d4a6e] hover:text-[#7aabdf] transition-colors duration-200"
                  >
                    {icon}
                  </a>
                ))}
              </div>
            </div>

            {/* Navegación */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7aabdf]">
                Navegación
              </p>
              <ul className="flex flex-col gap-2.5">
                {navLinks.map((link) => (
                  <li key={link.label}>
                    {link.href ? (
                      <Link
                        href={link.href}
                        className="text-sm text-[#8ab0d0] hover:text-white transition-colors duration-150"
                      >
                        {link.label}
                      </Link>
                    ) : (
                      <button
                        type="button"
                        onClick={() => scrollToSection(link.scrollTo)}
                        className="text-sm text-[#8ab0d0] hover:text-white transition-colors duration-150 text-left"
                      >
                        {link.label}
                      </button>
                    )}
                  </li>
                ))}
              </ul>
            </div>

            {/* Contacto */}
            <div className="flex flex-col gap-4">
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-[#7aabdf]">
                Contacto
              </p>
              <ul className="flex flex-col gap-3">
                {contactItems.map(({ icon: Icon, label, href }) => (
                  <li key={label} className="flex items-start gap-2.5">
                    <Icon className="h-3.5 w-3.5 text-[#7aabdf] mt-0.5 shrink-0" strokeWidth={1.5} />
                    {href ? (
                      <a
                        href={href}
                        className="text-sm text-[#8ab0d0] hover:text-white transition-colors duration-150"
                      >
                        {label}
                      </a>
                    ) : (
                      <span className="text-sm text-[#8ab0d0]">{label}</span>
                    )}
                  </li>
                ))}
              </ul>
            </div>

          </div>
        </div>

        {/* Bottom bar */}
        <div className="border-t border-[#0f1e32] py-6 flex flex-col sm:flex-row items-center justify-between gap-2">
          <p className="text-xs text-[#8ab0d0] tracking-wide text-center sm:text-left">
            © {new Date().getFullYear()} Veltrix. Todos los derechos reservados.{' '}
            Desarrollado por{' '}
            <a
              href="https://elarisdigitalsolutions.com"
              target="_blank"
              rel="noopener noreferrer"
              className="underline underline-offset-2 decoration-[#2d4a6e] hover:text-[#8ab0d0] hover:decoration-[#8ab0d0] transition-colors duration-150"
            >
              Elaris Digital Solutions
            </a>
          </p>
          <p className="text-xs text-[#8ab0d0] tracking-wide">
            Hecho con precisión para profesionales ambiciosos.
          </p>
        </div>
      </div>
    </footer>
  )
}
