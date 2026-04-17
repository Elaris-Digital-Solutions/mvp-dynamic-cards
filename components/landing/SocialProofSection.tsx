import { Quote } from 'lucide-react'
import { RevealOnScroll } from './RevealOnScroll'

const companies = [
  'Nexus Group',
  'Capital Plus',
  'Innovak',
  'Soluciones TEC',
  'Vertica Corp',
]

const testimonials = [
  {
    quote:
      'Desde que uso Veltrix, cada presentación es más impactante. La simplicidad y el diseño hablan por sí solos. Nunca más volví a una tarjeta de papel.',
    name: 'Carlos M.',
    role: 'Director Comercial',
    initials: 'CM',
  },
  {
    quote:
      'Actualicé mi empresa y mi teléfono al mismo tiempo. En dos minutos mi tarjeta NFC ya tenía toda la información nueva. Increíble cómo algo tan simple marca tanta diferencia.',
    name: 'Laura P.',
    role: 'Consultora de Marketing',
    initials: 'LP',
  },
]

export function SocialProofSection() {
  return (
    <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
      {/* Subtle grid texture */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'linear-gradient(to right, rgba(0,0,0,0.025) 1px, transparent 1px), linear-gradient(to bottom, rgba(0,0,0,0.025) 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <RevealOnScroll>
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-14">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#05070b] leading-[1.1]">
              Profesionales que se toman
              <br />
              <span className="text-[#1a4a8c]">en serio su presencia</span>
            </h2>
          </div>
        </RevealOnScroll>

        {/* Company logos row */}
        <RevealOnScroll delay={100}>
          <div className="flex flex-wrap items-center justify-center gap-x-10 gap-y-6 mb-16 sm:mb-20">
            {companies.map((name) => (
              <span
                key={name}
                className="text-xs font-bold uppercase tracking-[0.25em] text-[#bdc8d4] select-none"
              >
                {name}
              </span>
            ))}
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-[#e0e7ef] to-transparent mb-16 sm:mb-20" />
        </RevealOnScroll>

        {/* Testimonials */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {testimonials.map((t, i) => (
            <RevealOnScroll key={t.name} delay={i * 150}>
              <div className="flex flex-col gap-5 rounded-2xl border border-[#e5eaf2] bg-white p-7 shadow-sm hover:shadow-md transition-shadow duration-300 h-full">
                {/* Quote icon */}
                <div className="flex h-9 w-9 items-center justify-center rounded-lg border border-[#e5eaf2] bg-[#f8fafd]">
                  <Quote className="h-4 w-4 text-[#1a4a8c]" strokeWidth={1.5} />
                </div>

                <p className="text-sm sm:text-base text-[#2c3e50] leading-relaxed flex-1">
                  &ldquo;{t.quote}&rdquo;
                </p>

                <div className="flex items-center gap-3 pt-2 border-t border-[#f0f4f8]">
                  {/* Avatar */}
                  <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-[#0d1e38]">
                    <span className="text-xs font-bold text-white">{t.initials}</span>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-[#05070b]">{t.name}</p>
                    <p className="text-xs text-[#8896a4]">{t.role}</p>
                  </div>
                </div>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
