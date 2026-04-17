import { RevealOnScroll } from './RevealOnScroll'

export function ImpactSection() {
  return (
    <section className="relative bg-[#0d1e38] py-28 sm:py-36 overflow-hidden">
      {/* Background radial glow — ties back to hero */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 z-0"
        style={{
          backgroundImage:
            'radial-gradient(ellipse at 50% 50%, rgba(62, 119, 198, 0.18) 0%, rgba(33, 74, 130, 0.10) 40%, transparent 74%), linear-gradient(to right, rgba(255,255,255,0.04) 1px, transparent 1px), linear-gradient(to bottom, rgba(255,255,255,0.04) 1px, transparent 1px)',
          backgroundSize: '100% 100%, 30px 30px, 30px 30px',
        }}
      />
      {/* Subtle blur blob */}
      <div
        aria-hidden
        className="absolute left-1/2 top-1/2 h-[32rem] w-[32rem] -translate-x-1/2 -translate-y-1/2 rounded-full bg-[#1a4a8c]/12 blur-3xl pointer-events-none"
      />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Main statement */}
        <RevealOnScroll>
          <div className="text-center max-w-4xl mx-auto">
            <h2 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-medium tracking-tight text-white leading-[1.05]">
              Entre ser{' '}
              <span
                className="relative inline-block"
                style={{
                  background: 'linear-gradient(135deg, #c8d9f0 0%, #7aabdf 50%, #4a87c8 100%)',
                  WebkitBackgroundClip: 'text',
                  WebkitTextFillColor: 'transparent',
                  backgroundClip: 'text',
                }}
              >
                recordado
              </span>
              <br />y ser olvidado.
            </h2>
            <p className="mt-6 text-base sm:text-lg text-[#8ca0b8] leading-relaxed max-w-2xl mx-auto">
              Cada detalle de tu presencia comunica algo. Veltrix asegura que lo que comunicas sea exactamente lo que quieres.
            </p>
          </div>
        </RevealOnScroll>

      </div>
    </section>
  )
}
