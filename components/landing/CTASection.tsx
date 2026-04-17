'use client'

import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { RevealOnScroll } from './RevealOnScroll'

export function CTASection() {
  return (
    <section className="relative bg-white py-28 sm:py-36 overflow-hidden">

      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <RevealOnScroll>
          {/* Headline */}
          <h2 className="text-4xl sm:text-5xl md:text-6xl font-medium tracking-tight text-[#05070b] leading-[1.05] mb-6">
            Tu identidad digital,
            <br />
            <span className="text-[#1a4a8c]">lista en minutos</span>
          </h2>

          {/* Subtext */}
          <p className="text-base sm:text-lg text-[#5a6878] leading-relaxed max-w-xl mx-auto mb-10">
            Únete a los profesionales que ya comparten su información sin fricción,
            sin apps y sin perder oportunidades.
          </p>

          {/* Actions */}
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button
              asChild
              size="lg"
              className="h-12 px-8 text-base bg-[#0d1e38] hover:bg-[#1a2e4a] text-white border-0 shadow-lg shadow-[#0d1e38]/20"
            >
              <Link href="/signup">
                Obtener mi tarjeta
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>

            <Button
              variant="ghost"
              size="lg"
              className="h-12 px-6 text-base text-[#1a4a8c] hover:text-[#0d1e38] hover:bg-[#f0f4f9]"
              onClick={() => document.getElementById('como-funciona')?.scrollIntoView({ behavior: 'smooth' })}
            >
              Ver cómo funciona
            </Button>
          </div>
        </RevealOnScroll>

        {/* Trust signals */}
        <RevealOnScroll delay={150}>
          <div className="mt-14 flex flex-wrap items-center justify-center gap-6 sm:gap-10">
            {[
              'Sin apps adicionales',
              'Actualización ilimitada',
            ].map((item) => (
              <div key={item} className="flex items-center gap-2 text-sm text-[#6b7a8f]">
                <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#1a4a8c]/10">
                  <svg className="h-2.5 w-2.5 text-[#1a4a8c]" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                  </svg>
                </span>
                {item}
              </div>
            ))}
          </div>
        </RevealOnScroll>
      </div>
    </section>
  )
}
