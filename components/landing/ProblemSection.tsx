import { RevealOnScroll } from './RevealOnScroll'

const problems = [
  {
    index: '01',
    title: 'Tarjetas que quedan obsoletas',
    description: 'Cada cambio de cargo o empresa la inutiliza. Reimprimir cuesta tiempo y oportunidades.',
  },
  {
    index: '02',
    title: 'Fricción en cada intercambio',
    description: 'Buscar apps, digitar datos a mano, perder contactos. Networking innecesariamente complicado.',
  },
  {
    index: '03',
    title: 'Sin datos sobre tu impacto',
    description: 'No sabes quién vio tu información ni cuándo. Tu presencia trabaja completamente a ciegas.',
  },
]

export function ProblemSection() {
  return (
    <section className="relative bg-white py-24 sm:py-32 overflow-hidden">
      <div className="relative z-10 max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header — centered */}
        <RevealOnScroll>
          <div className="text-center max-w-2xl mx-auto mb-16 sm:mb-20">
            <h2 className="text-3xl sm:text-4xl md:text-5xl font-medium tracking-tight text-[#05070b] leading-[1.1]">
              Tu identidad profesional
              <br />
              <span className="text-[#1a4a8c]">merece evolucionar</span>
            </h2>
            <p className="mt-4 text-base text-[#5a6878] leading-relaxed">
              Las herramientas con las que te presentas al mundo no han cambiado en décadas.
            </p>
          </div>
        </RevealOnScroll>

        {/* Editorial list */}
        <div className="divide-y divide-[#e8edf4]">
          {problems.map((problem, i) => (
            <RevealOnScroll key={problem.index} delay={i * 100}>
              <div className="grid grid-cols-[2.5rem_1fr] sm:grid-cols-[3rem_1fr_1fr] items-start gap-x-6 sm:gap-x-8 py-7 sm:py-8">
                {/* Index */}
                <span className="text-[10px] font-semibold tracking-[0.2em] text-[#c0cad4] select-none tabular-nums pt-0.5">
                  {problem.index}
                </span>

                {/* Title */}
                <h3 className="text-base sm:text-lg font-medium text-[#05070b] tracking-tight leading-snug">
                  {problem.title}
                </h3>

                {/* Description — hidden on mobile */}
                <p className="hidden sm:block text-sm text-[#8896a4] leading-relaxed">
                  {problem.description}
                </p>

                {/* Mobile description */}
                <p className="sm:hidden col-start-2 text-sm text-[#8896a4] leading-relaxed mt-1">
                  {problem.description}
                </p>
              </div>
            </RevealOnScroll>
          ))}
        </div>
      </div>
    </section>
  )
}
