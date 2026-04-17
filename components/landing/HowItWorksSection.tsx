import { UserCircle, Package, Wifi, RotateCw } from 'lucide-react'
import { RevealOnScroll } from './RevealOnScroll'

const steps = [
  {
    number: '01',
    icon: UserCircle,
    title: 'Crea tu perfil',
    description:
      'Configura tu identidad digital en minutos. Foto, nombre, cargo, empresa, bio y todos tus enlaces importantes.',
  },
  {
    number: '02',
    icon: Package,
    title: 'Recibe tu tarjeta',
    description:
      'Te enviamos tu tarjeta NFC física personalizada con tu diseño. Lista para usar desde el primer día.',
  },
  {
    number: '03',
    icon: Wifi,
    title: 'Comparte con un toque',
    description:
      'Acerca tu tarjeta a cualquier smartphone moderno. Sin apps, sin fricciones. Tu perfil, instantáneamente.',
  },
  {
    number: '04',
    icon: RotateCw,
    title: 'Actualiza cuando quieras',
    description:
      '¿Cambiaste de empresa o teléfono? Actualiza tu perfil en segundos. La tarjeta física siempre es válida.',
  },
]

export function HowItWorksSection() {
  return (
    <section className="relative bg-[#edf2f8] py-24 sm:py-32 overflow-hidden">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <RevealOnScroll>
          <div className="flex flex-col items-center text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#05070b] leading-[1.1]">
              Simple. Instantáneo.
              <br />
              <span className="text-[#1a4a8c]">Sin fricciones.</span>
            </h2>

            <p className="mt-5 text-base sm:text-lg text-[#5a6878] leading-relaxed max-w-lg">
              De cero a tu primera conexión en minutos. Así de fácil es tener una identidad digital de alto impacto.
            </p>
          </div>
        </RevealOnScroll>

        {/* Steps grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 lg:gap-5">
          {steps.map((step, i) => {
            const Icon = step.icon
            return (
              <RevealOnScroll key={step.number} delay={i * 100}>
                <div className="relative flex flex-col gap-5 rounded-2xl bg-white border border-white/80 p-6 shadow-sm hover:shadow-md hover:-translate-y-0.5 transition-all duration-300 h-full">
                  {/* Step number */}
                  <div className="flex items-center justify-between">
                    <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-[#05070b]">
                      <Icon className="h-5 w-5 text-white" strokeWidth={1.5} />
                    </div>
                    <span className="text-3xl font-black text-[#e8edf2] select-none">
                      {step.number}
                    </span>
                  </div>

                  <div>
                    <h3 className="text-base font-semibold text-[#05070b] mb-2">
                      {step.title}
                    </h3>
                    <p className="text-sm text-[#6b7a8f] leading-relaxed">
                      {step.description}
                    </p>
                  </div>

                  {/* Connector — spans exactly the gap between cards */}
                  {i < steps.length - 1 && (
                    <div
                      aria-hidden
                      className="hidden lg:block absolute right-0 top-[2.75rem] w-5 h-px translate-x-full border-t border-dashed border-[#c5d0de] z-10"
                    />
                  )}
                </div>
              </RevealOnScroll>
            )
          })}
        </div>
      </div>
    </section>
  )
}
