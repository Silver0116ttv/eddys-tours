'use client'

import { ShieldCheck, Wallet, MapPinned, Headphones } from 'lucide-react'
import { useI18n } from '@/components/use-i18n'

const points = [
  {
    icon: ShieldCheck,
    title: "Verified local operators",
    body: "Every guide and boat is vetted in person. We only list operators we'd send our own family with.",
    titleES: 'Operadores locales verificados',
    bodyES: 'Revisamos personalmente a cada guía y embarcación. Solo publicamos operadores con los que viajaría nuestra propia familia.',
  },
  {
    icon: Wallet,
    title: "Book now, pay a deposit",
    body: "Lock in your spot with a small deposit and pay the balance later. No surprises at checkout.",
    titleES: 'Reserva ahora con un depósito',
    bodyES: 'Asegura tu lugar con un pequeño depósito y paga el resto después. Sin sorpresas al finalizar.',
  },
  {
    icon: MapPinned,
    title: "Built by locals",
    body: "We live here. From hidden beaches to the best taco stop, our picks come from real experience.",
    titleES: 'Creado por locales',
    bodyES: 'Vivimos aquí. Desde playas escondidas hasta los mejores tacos, nuestras recomendaciones nacen de la experiencia real.',
  },
  {
    icon: Headphones,
    title: "Real support, 7 days a week",
    body: "Message us anytime before or during your trip. A local human always answers.",
    titleES: 'Atención real, los 7 días',
    bodyES: 'Escríbenos antes o durante tu viaje. Siempre te responde una persona local.',
  },
]

export function WhyUs() {
  const { language, t } = useI18n()
  return (
    <section id="about" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-[minmax(0,1fr)_2fr] lg:gap-16">
          <div>
            <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
              {t('why.eyebrow')}
            </span>
            <h2 className="mt-4 font-display text-4xl leading-tight text-foreground text-balance md:text-5xl">
              {t('why.title')}
            </h2>
            <p className="mt-4 leading-relaxed text-muted-foreground text-pretty">
              {t('why.body')}
            </p>
          </div>

          <div className="grid gap-6 sm:grid-cols-2">
            {points.map((point) => (
              <div key={point.title} className="flex flex-col gap-3">
                <div className="flex size-11 items-center justify-center rounded-xl bg-secondary text-primary">
                  <point.icon className="size-5" />
                </div>
                <h3 className="font-sans text-lg font-semibold text-foreground">
                  {language === 'ES' ? point.titleES : point.title}
                </h3>
                <p className="leading-relaxed text-muted-foreground">
                  {language === 'ES' ? point.bodyES : point.body}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
