'use client'

import { CalendarCheck, LifeBuoy, ShieldCheck } from 'lucide-react'
import { useI18n } from '@/components/use-i18n'

const copy = {
  EN: {
    eyebrow: 'Plan with confidence',
    title: 'Booking and safety guide',
    intro: 'The essentials to know before adding an experience to your Vallarta itinerary.',
    bookingTitle: 'Booking',
    bookingBody: 'Dates and times are subject to operator confirmation. Your trip cart clearly shows the amount due today and any remaining balance before you confirm.',
    cancellationTitle: 'Changes and cancellations',
    cancellationBody: 'Experiences include free cancellation up to 48 hours before the scheduled start. Contact our local team for changes; any tour-specific exception will be shown before payment.',
    safetyTitle: 'Safety',
    safetyBody: 'Follow the guide’s instructions and review the age, mobility, swimming and equipment requirements shown on each tour detail page. Weather or sea conditions may require a change for everyone’s safety.',
    helpTitle: 'Need a hand?',
    helpBody: 'Send us your tour name, preferred date and number of travelers. We’ll help you choose the right option.',
    helpAction: 'Email our local team',
  },
  ES: {
    eyebrow: 'Planea con confianza',
    title: 'Guía de reservación y seguridad',
    intro: 'Lo esencial antes de agregar una experiencia a tu itinerario por Vallarta.',
    bookingTitle: 'Reservación',
    bookingBody: 'Las fechas y horarios están sujetos a confirmación del operador. Tu carrito muestra claramente cuánto pagas hoy y cualquier saldo pendiente antes de confirmar.',
    cancellationTitle: 'Cambios y cancelaciones',
    cancellationBody: 'Las experiencias incluyen cancelación gratuita hasta 48 horas antes del inicio programado. Contacta a nuestro equipo local para hacer cambios; cualquier excepción específica se mostrará antes del pago.',
    safetyTitle: 'Seguridad',
    safetyBody: 'Sigue las indicaciones del guía y revisa los requisitos de edad, movilidad, natación y equipo en el detalle de cada tour. El clima o las condiciones del mar pueden requerir cambios por seguridad.',
    helpTitle: '¿Necesitas ayuda?',
    helpBody: 'Envíanos el nombre del tour, la fecha que prefieres y el número de viajeros. Te ayudaremos a elegir la mejor opción.',
    helpAction: 'Escribir al equipo local',
  },
} as const

export function BookingPolicy() {
  const { language } = useI18n()
  const text = copy[language]

  return (
    <>
      <section className="bg-ocean-deep px-4 pb-20 pt-32 text-white sm:px-6 lg:px-10 lg:pb-24 lg:pt-40">
        <div className="mx-auto max-w-4xl">
          <p className="text-xs font-semibold uppercase tracking-[0.24em] text-turquoise">
            {text.eyebrow}
          </p>
          <h1 className="mt-4 font-display text-[clamp(2.6rem,7vw,5rem)] font-bold leading-[0.98] tracking-tight text-balance">
            {text.title}
          </h1>
          <p className="mt-5 max-w-2xl text-lg leading-relaxed text-white/75">{text.intro}</p>
        </div>
      </section>

      <section className="px-4 py-16 sm:px-6 md:py-24 lg:px-10">
        <div className="mx-auto grid max-w-4xl gap-5 md:grid-cols-3">
          <article className="rounded-2xl border border-border bg-card p-6">
            <CalendarCheck className="size-6 text-ocean" aria-hidden="true" />
            <h2 className="mt-5 font-display text-xl font-bold">{text.bookingTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{text.bookingBody}</p>
          </article>
          <article id="cancellations" className="scroll-mt-28 rounded-2xl border border-border bg-card p-6">
            <LifeBuoy className="size-6 text-ocean" aria-hidden="true" />
            <h2 className="mt-5 font-display text-xl font-bold">{text.cancellationTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{text.cancellationBody}</p>
          </article>
          <article id="safety" className="scroll-mt-28 rounded-2xl border border-border bg-card p-6">
            <ShieldCheck className="size-6 text-ocean" aria-hidden="true" />
            <h2 className="mt-5 font-display text-xl font-bold">{text.safetyTitle}</h2>
            <p className="mt-3 text-sm leading-7 text-muted-foreground">{text.safetyBody}</p>
          </article>
        </div>

        <div className="mx-auto mt-10 max-w-4xl rounded-3xl bg-sand p-7 md:flex md:items-center md:justify-between md:gap-8 md:p-10">
          <div>
            <h2 className="font-display text-2xl font-bold">{text.helpTitle}</h2>
            <p className="mt-2 max-w-xl leading-relaxed text-muted-foreground">{text.helpBody}</p>
          </div>
          <a
            href="mailto:hola@eddystours.mx?subject=Booking%20help"
            className="mt-6 inline-flex shrink-0 rounded-full bg-sunset-deep px-6 py-3 text-sm font-semibold text-white md:mt-0"
          >
            {text.helpAction}
          </a>
        </div>
      </section>
    </>
  )
}
