import { User, Smartphone, Zap, TrendingUp, Link2, Sparkles } from 'lucide-react'
import { RevealOnScroll } from './RevealOnScroll'

const features = [
  {
    icon: User,
    title: 'Perfil 100% personalizable',
    description:
      'Foto, banner, bio, cargo y empresa. Todo editable en tiempo real desde tu panel.',
  },
  {
    icon: Smartphone,
    title: 'NFC + código QR',
    description:
      'Compatible con cualquier iPhone o Android moderno. Sin instalaciones, sin apps adicionales.',
  },
  {
    icon: Zap,
    title: 'Actualización instantánea',
    description:
      'Modifica tu perfil y los cambios se reflejan de inmediato para todos los que lo visiten.',
  },
  {
    icon: TrendingUp,
    title: 'Métricas de visitas',
    description:
      'Sabe exactamente quién vio tu perfil, desde qué plataforma y en qué momento.',
  },
  {
    icon: Link2,
    title: 'Múltiples enlaces',
    description:
      'Agrega hasta 6 enlaces a tus redes, portfolio, calendario o cualquier URL relevante.',
  },
  {
    icon: Sparkles,
    title: 'Diseño premium',
    description:
      'Plantillas elegantes diseñadas para crear una primera impresión impecable y memorable.',
  },
]

export function FeaturesSection() {
  return (
    <section className="relative bg-white py-24 sm:py-32 overflow-hidden">

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <RevealOnScroll>
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#05070b] leading-[1.1]">
              Todo lo que necesitas
              <br />
              <span className="text-[#1a4a8c]">para destacar</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-[#5a6878] leading-relaxed max-w-lg">
              Cada detalle fue diseñado para que tu identidad digital sea tan poderosa como tu identidad real.
            </p>
          </div>
        </RevealOnScroll>

        {/* Features grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-px bg-[#e8edf2] border border-[#e8edf2] rounded-2xl overflow-hidden">
          {features.map((feature, i) => {
            const Icon = feature.icon
            return (
              <RevealOnScroll key={feature.title} delay={i * 80}>
                <div className="group flex flex-col gap-4 bg-white p-7 hover:bg-[#fafbfd] transition-colors duration-200 h-full">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl border border-[#e5eaf2] bg-[#f8fafd] group-hover:border-[#c5d4e8] group-hover:bg-[#edf2f8] transition-colors duration-200">
                    <Icon className="h-4.5 w-4.5 text-[#1a4a8c]" strokeWidth={1.5} />
                  </div>
                  <div>
                    <h3 className="text-sm font-semibold text-[#05070b] mb-1.5 tracking-[-0.01em]">
                      {feature.title}
                    </h3>
                    <p className="text-sm text-[#6b7a8f] leading-relaxed">
                      {feature.description}
                    </p>
                  </div>
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
