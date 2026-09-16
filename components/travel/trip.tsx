'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  ArrowRight,
  CalendarDays,
  Check,
  CircleCheck,
  Mail,
  MapPin,
  Minus,
  Plus,
  Printer,
  ShieldCheck,
  ShoppingBag,
  Trash2,
} from 'lucide-react'
import { useCart } from '@/components/cart/cart-context'
import { useI18n } from '@/components/use-i18n'
import { localizeTourTitle } from '@/lib/i18n'
import { formatPrice, type Tour } from '@/lib/tours'
import { PageIntro } from './page-shell'
import { saveDemoRequest, type DemoRequest } from '@/lib/demo-requests'

export function Trip({
  tours,
  checkout = false,
}: {
  tours: Tour[]
  checkout?: boolean
}) {
  const {
    items,
    currency,
    tripTotal,
    payToday,
    remainingBalance,
    removeItem,
    setAdults,
    setPaymentType,
    updateItem,
  } = useCart()
  const { language } = useI18n()
  const es = language === 'ES'
  const [step, setStep] = useState(1)
  const demo = tours.length > 0 && tours.every((t) => t.sample)
  const [request, setRequest] = useState<DemoRequest | null>(null)
  const [requestError, setRequestError] = useState('')
  const [details, setDetails] = useState({
    name: '',
    email: '',
    phone: '',
    notes: '',
  })
  const invalid = items.some((item) => {
    const tour = tours.find((t) => t.id === item.tourId)
    return (
      !tour ||
      !tour.availableDates.includes(item.date) ||
      !tour.availableTimes.includes(item.time) ||
      item.adults > tour.availableSpots
    )
  })
  const mail = `mailto:hola@eddystours.mx?subject=${encodeURIComponent(es ? 'Solicitud de itinerario' : 'Trip inquiry')}&body=${encodeURIComponent(`${details.name}\n${details.email}\n${details.phone}\n\n${items.map((i) => `${localizeTourTitle(i.tourId, i.title, language)} | ${i.date} ${i.time} | ${i.adults} ${es ? 'viajeros' : 'travelers'} | ${formatPrice(i.total, currency)} | ${i.paymentType}`).join('\n')}\n\nTotal: ${formatPrice(tripTotal, currency)}\n${es ? 'Anticipo / pago solicitado' : 'Requested initial payment'}: ${formatPrice(payToday, currency)}\n${details.notes}`)}`
  const label = (en: string, spanish: string) => (es ? spanish : en)

  if (!items.length)
    return (
      <>
        <PageIntro
          title={label(
            'Make room for adventure.',
            'Haz espacio para la aventura.',
          )}
          description={label(
            'All your experiences, together in one trip.',
            'Todas tus experiencias en un solo viaje.',
          )}
        />
        <div className="travel-container py-12">
          <div className="empty-state">
            <ShoppingBag className="size-12 text-ocean" />
            <h2>
              {label('Your itinerary is waiting', 'Tu itinerario te espera')}
            </h2>
            <p>
              {label(
                'Choose your first tour. You can add more experiences before requesting your booking.',
                'Elige tu primer tour. Puedes sumar más experiencias antes de solicitar tu reservación.',
              )}
            </p>
            <Link className="action-primary" href="/tours">
              {label('Explore tours', 'Explorar tours')}
            </Link>
          </div>
        </div>
      </>
    )

  return (
    <>
      <PageIntro
        title={
          checkout
            ? label(
                'One step closer to Vallarta.',
                'Un paso más cerca de Vallarta.',
              )
            : label('Your trip, your way.', 'Tu viaje, a tu manera.')
        }
        description={
          checkout
            ? label(
                'Review your details and prepare a request for our local team.',
                'Revisa tus datos y prepara una solicitud para nuestro equipo local.',
              )
            : label(
                'Combine experiences, pick your dates and plan every day at your pace.',
                'Combina experiencias, elige tus fechas y planea cada día a tu ritmo.',
              )
        }
      />
      <div className="travel-container py-10 md:py-14">
        {checkout && (
          <ol className="mb-10 flex flex-wrap gap-3 text-sm">
            {[
              label('Your details', 'Tus datos'),
              label('Review itinerary', 'Revisar itinerario'),
              label('Send request', 'Enviar solicitud'),
            ].map((s, index) => (
              <li
                key={s}
                aria-current={step === index + 1 ? 'step' : undefined}
                className={`flex items-center gap-3 rounded-full px-4 py-2 ${step === index + 1 ? 'bg-ocean text-white' : 'bg-muted text-muted-foreground'}`}
              >
                <span className="grid size-6 place-items-center rounded-full border border-current text-xs">
                  {step > index + 1 ? <Check className="size-3" /> : index + 1}
                </span>
                {s}
              </li>
            ))}
          </ol>
        )}
        <div className="grid items-start gap-8 lg:grid-cols-[minmax(0,1fr)_350px]">
          <div>
            {!checkout && (
              <div className="mb-6 flex flex-wrap items-center justify-between gap-4">
                <h2 className="text-2xl font-bold">
                  {items.length} {label(items.length === 1 ? 'experience' : 'experiences', items.length === 1 ? 'experiencia' : 'experiencias')}
                </h2>
                <Link
                  href="/tours"
                  className="text-sm font-semibold text-ocean"
                >
                  + {label('Add another tour', 'Agregar otro tour')}
                </Link>
              </div>
            )}
            {checkout && step === 1 ? (
              <form
                id="traveler-form"
                className="surface space-y-6"
                onSubmit={(e) => {
                  e.preventDefault()
                  setStep(2)
                  window.scrollTo({ top: 200, behavior: 'smooth' })
                }}
              >
                <div>
                  <h2 className="text-2xl font-bold">
                    {label(
                      'Who is coming along?',
                      '¿Quién viene a la aventura?',
                    )}
                  </h2>
                  <p className="mt-2 text-sm leading-6 text-muted-foreground">
                    {label(
                      'Contact details for the person organizing the trip.',
                      'Datos de contacto de la persona que organiza el viaje.',
                    )}
                  </p>
                </div>
                <label className="field">
                  {label('Full name', 'Nombre completo')}
                  <input
                    required
                    name="name"
                    autoComplete="name"
                    minLength={2}
                    maxLength={100}
                    value={details.name}
                    onChange={(e) =>
                      setDetails({ ...details, name: e.target.value })
                    }
                  />
                </label>
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="field">
                    {label('Email address', 'Correo electrónico')}
                    <input
                      required
                      type="email"
                      name="email"
                      autoComplete="email"
                      value={details.email}
                      onChange={(e) =>
                        setDetails({ ...details, email: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    {label(
                      'Phone with country code',
                      'Teléfono con código de país',
                    )}
                    <input
                      required
                      type="tel"
                      name="phone"
                      autoComplete="tel"
                      minLength={7}
                      maxLength={25}
                      placeholder="+52"
                      value={details.phone}
                      onChange={(e) =>
                        setDetails({ ...details, phone: e.target.value })
                      }
                    />
                  </label>
                </div>
                <label className="field">
                  {label(
                    'Anything we should know? (optional)',
                    '¿Algo que debamos saber? (opcional)',
                  )}
                  <textarea
                    maxLength={1500}
                    value={details.notes}
                    onChange={(e) =>
                      setDetails({ ...details, notes: e.target.value })
                    }
                    placeholder={label(
                      'Hotel pickup, children, accessibility or special requests…',
                      'Transporte, niños, accesibilidad o solicitudes especiales…',
                    )}
                  />
                </label>
                <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                  <input
                    type="checkbox"
                    required
                    className="mt-1 size-4 accent-ocean"
                  />
                  <span>
                    {label('I have read the', 'He leído las')}{' '}
                    <Link
                      className="text-ocean underline"
                      href="/booking-policy"
                      target="_blank"
                    >
                      {label('booking terms', 'políticas de reservación')}
                    </Link>{' '}
                    {label('and', 'y el')}{' '}
                    <Link
                      className="text-ocean underline"
                      href="/privacy"
                      target="_blank"
                    >
                      {label('privacy information', 'aviso de privacidad')}
                    </Link>
                    .
                  </span>
                </label>
                <button type="submit" className="action-primary">
                  {label('Review itinerary', 'Revisar itinerario')}
                  <ArrowRight className="size-4" />
                </button>
              </form>
            ) : checkout && step === 3 ? (
              <div className="surface">
                <CircleCheck className="size-14 text-jungle" />
                <h2 className="mt-6 text-3xl font-bold">
                  {request
                    ? label(
                        'Sample request saved.',
                        'Solicitud de ejemplo registrada.',
                      )
                    : label(
                        'Your itinerary is ready to send.',
                        'Tu itinerario está listo para enviar.',
                      )}
                </h2>
                <p className="mt-4 leading-7 text-muted-foreground">
                  {request
                    ? label(
                        'Your sample itinerary is saved in this browser and appears in the admin demo. No booking, payment or email has been sent.',
                        'Tu itinerario de ejemplo quedó guardado en este navegador y aparece en el panel de demostración. No se ha realizado una reserva, un cobro ni un envío de correo real.',
                      )
                    : label(
                        'Open your email app, review the message and send it to our team. Your booking is not confirmed and no payment has been made.',
                        'Abre tu aplicación de correo, revisa el mensaje y envíalo a nuestro equipo. Tu reserva aún no está confirmada y no se ha realizado ningún cobro.',
                      )}
                </p>
                {request && (
                  <div className="mt-6 rounded-xl bg-[#edf4f5] p-5">
                    <p className="text-xs text-muted-foreground">
                      {label('Your reference', 'Tu referencia')}
                    </p>
                    <p className="mt-2 text-xl font-bold tracking-wide text-ocean">
                      {request.reference}
                    </p>
                    <Link href="/my-bookings" className="action-primary mt-4">
                      {label('Look up my request', 'Consultar mi solicitud')}
                    </Link>
                  </div>
                )}
                {!request && (
                  <a className="action-primary mt-7" href={mail}>
                    <Mail className="size-4" />
                    {label('Open email to send', 'Abrir correo para enviar')}
                  </a>
                )}
                {!request && (
                  <ol className="mt-8 space-y-5 border-t pt-7">
                    {[
                      label(
                        'Send your itinerary to hola@eddystours.mx.',
                        'Envía tu itinerario a hola@eddystours.mx.',
                      ),
                      label(
                        'Our team confirms availability and final prices.',
                        'Nuestro equipo confirma disponibilidad y precios finales.',
                      ),
                      label(
                        'Receive payment instructions and your meeting details.',
                        'Recibe las instrucciones de pago y los detalles de tu punto de encuentro.',
                      ),
                    ].map((s, i) => (
                      <li key={s} className="flex gap-4 text-sm leading-6">
                        <span className="grid size-7 shrink-0 place-items-center rounded-full bg-muted text-ocean">
                          {i + 1}
                        </span>
                        {s}
                      </li>
                    ))}
                  </ol>
                )}
                <section className="mt-8 border-t pt-6">
                  <h3 className="font-bold">
                    {label('Your itinerary', 'Tu itinerario')}
                  </h3>
                  <ul className="mt-4 space-y-4">
                    {items.map((item) => (
                      <li
                        key={item.lineId}
                        className="rounded-lg bg-muted p-4 text-sm"
                      >
                        <strong>
                          {localizeTourTitle(item.tourId, item.title, language)}
                        </strong>
                        <p className="mt-2 text-muted-foreground">
                          {item.date} / {item.time} / {item.adults}{' '}
                          {label('travelers', 'viajeros')}
                        </p>
                        <p className="mt-2 font-medium">
                          {formatPrice(item.total, currency)}
                        </p>
                      </li>
                    ))}
                  </ul>
                </section>
                <div className="no-print mt-8 flex flex-wrap gap-3">
                  <button
                    className="action-secondary"
                    onClick={() => window.print()}
                  >
                    <Printer className="size-4" />
                    {label('Print itinerary', 'Imprimir itinerario')}
                  </button>
                  <button
                    className="action-secondary"
                    onClick={() => setStep(2)}
                  >
                    {label('Back to review', 'Volver a revisión')}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-5">
                {checkout && (
                  <div className="surface">
                    <div className="flex items-start justify-between gap-3">
                      <div>
                        <h2 className="text-xl font-bold">{details.name}</h2>
                        <p className="mt-2 break-all text-sm text-muted-foreground">
                          {details.email}
                          <br />
                          {details.phone}
                        </p>
                        {details.notes && (
                          <p className="mt-3 text-sm">{details.notes}</p>
                        )}
                      </div>
                      <button
                        className="text-sm font-semibold text-ocean"
                        onClick={() => { setRequest(null); setStep(1) }}
                      >
                        {label('Edit', 'Editar')}
                      </button>
                    </div>
                  </div>
                )}
                {items.map((item) => {
                  const tour = tours.find((t) => t.id === item.tourId)
                  return (
                    <article key={item.lineId} className="surface">
                      <div className="flex items-start gap-4">
                        <div className="relative size-20 shrink-0 overflow-hidden rounded-xl sm:size-28">
                          <Image
                            src={item.image}
                            alt={item.title}
                            fill
                            sizes="112px"
                            className="object-cover"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h2 className="text-lg font-bold">
                            <Link
                              href={tour ? `/tours/${tour.slug}` : '/tours'}
                            >
                              {localizeTourTitle(
                                item.tourId,
                                item.title,
                                language,
                              )}
                            </Link>
                          </h2>
                          <p className="mt-2 text-xs text-muted-foreground">
                            {item.providerName}
                          </p>
                          <p className="mt-2 font-semibold text-ocean">
                            {formatPrice(item.total, currency)}
                          </p>
                        </div>
                        {!checkout && (
                          <button
                            className="no-print rounded-full p-2 text-muted-foreground hover:bg-red-50 hover:text-red-700"
                            aria-label={`${label('Remove', 'Quitar')} ${item.title}`}
                            onClick={() => removeItem(item.lineId)}
                          >
                            <Trash2 className="size-4" />
                          </button>
                        )}
                      </div>
                      {checkout ? (
                        <div className="mt-5 flex flex-wrap gap-4 border-t pt-5 text-sm">
                          <span className="flex items-center gap-2">
                            <CalendarDays className="size-4 text-ocean" />
                            {item.date} / {item.time}
                          </span>
                          <span>
                            {item.adults} {label('travelers', 'viajeros')}
                          </span>
                          <span>
                            {item.paymentType === 'deposit'
                              ? label('Deposit', 'Anticipo')
                              : label('Full payment', 'Pago completo')}
                          </span>
                        </div>
                      ) : (
                        <>
                          <div className="mt-5 grid gap-4 sm:grid-cols-3">
                            <label className="field">
                              {label('Date', 'Fecha')}
                              <select
                                value={item.date}
                                onChange={(e) =>
                                  updateItem(item.lineId, {
                                    date: e.target.value,
                                  })
                                }
                              >
                                <option value="">
                                  {label('Choose a date', 'Elige fecha')}
                                </option>
                                {tour?.availableDates.map((date) => (
                                  <option key={date}>{date}</option>
                                ))}
                              </select>
                            </label>
                            <label className="field">
                              {label('Departure', 'Salida')}
                              <select
                                value={item.time}
                                onChange={(e) =>
                                  updateItem(item.lineId, {
                                    time: e.target.value,
                                  })
                                }
                              >
                                <option value="">
                                  {label('Choose a time', 'Elige horario')}
                                </option>
                                {tour?.availableTimes.map((time) => (
                                  <option key={time}>{time}</option>
                                ))}
                              </select>
                            </label>
                            <div className="field">
                              <span>{label('Travelers', 'Viajeros')}</span>
                              <div className="flex h-12 items-center justify-between rounded-xl border px-2">
                                <button
                                  aria-label={label(
                                    'Fewer travelers',
                                    'Menos viajeros',
                                  )}
                                  disabled={item.adults <= 1}
                                  onClick={() =>
                                    setAdults(item.lineId, item.adults - 1)
                                  }
                                  className="p-2"
                                >
                                  <Minus className="size-4" />
                                </button>
                                {item.adults}
                                <button
                                  aria-label={label(
                                    'More travelers',
                                    'Más viajeros',
                                  )}
                                  disabled={
                                    item.adults >=
                                    Math.min(20, tour?.availableSpots ?? 20)
                                  }
                                  onClick={() =>
                                    setAdults(item.lineId, item.adults + 1)
                                  }
                                  className="p-2"
                                >
                                  <Plus className="size-4" />
                                </button>
                              </div>
                            </div>
                          </div>
                          <fieldset className="mt-5">
                            <legend className="mb-2 text-sm font-medium">
                              {label(
                                'Payment preference',
                                'Preferencia de pago',
                              )}
                            </legend>
                            <div className="flex flex-wrap gap-3">
                              {(['deposit', 'full'] as const).map((value) => (
                                <label
                                  key={value}
                                  className={`flex cursor-pointer items-center gap-2 rounded-xl border p-3 text-sm ${item.paymentType === value ? 'border-ocean bg-ocean/5 text-ocean' : ''}`}
                                >
                                  <input
                                    type="radio"
                                    name={item.lineId}
                                    checked={item.paymentType === value}
                                    onChange={() =>
                                      setPaymentType(item.lineId, value)
                                    }
                                    className="accent-ocean"
                                  />
                                  {value === 'deposit'
                                    ? `${label('Deposit', 'Anticipo')} ${formatPrice(item.depositTotal, currency)}`
                                    : label('Full payment', 'Pago completo')}
                                </label>
                              ))}
                            </div>
                          </fieldset>
                        </>
                      )}
                      {!tour && (
                        <p role="alert" className="mt-4 text-sm text-red-700">
                          {label(
                            'This tour is no longer available. Remove it to continue.',
                            'Este tour ya no está disponible. Quítalo para continuar.',
                          )}
                        </p>
                      )}
                    </article>
                  )
                })}
                {checkout && (
                  <div className="no-print flex flex-wrap gap-3">
                    {requestError && (
                      <p
                        role="alert"
                        className="w-full rounded-xl bg-red-50 p-4 text-sm text-red-800"
                      >
                        {requestError}
                      </p>
                    )}
                    <button
                      className="action-secondary"
                      onClick={() => { setRequest(null); setStep(1) }}
                    >
                      <ArrowLeft className="size-4" />
                      {label('Your details', 'Tus datos')}
                    </button>
                    <button
                      className="action-primary"
                      disabled={invalid}
                      onClick={() => {
                        if (demo && !request) {
                          try {
                            setRequest(
                              saveDemoRequest({
                                ...details,
                                items,
                                currency,
                                total: tripTotal,
                                due: payToday,
                              }),
                            )
                          } catch {
                            setRequestError(
                              label(
                                'Your browser could not save the request. Free some storage and try again.',
                                'El navegador no pudo guardar la solicitud. Libera espacio e intenta nuevamente.',
                              ),
                            )
                            return
                          }
                        }
                        setStep(3)
                        window.scrollTo({ top: 200, behavior: 'smooth' })
                      }}
                    >
                      {demo
                        ? label(
                            'Save sample request',
                            'Guardar solicitud de ejemplo',
                          )
                        : label('Prepare request', 'Preparar solicitud')}
                      <ArrowRight className="size-4" />
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
          <aside className="space-y-5 lg:sticky lg:top-28">
            <div className="surface">
              <h2 className="text-xl font-bold">
                {label('Your trip at a glance', 'Tu viaje de un vistazo')}
              </h2>
              <p className="mt-2 text-sm text-muted-foreground">
                {items.length} {label(items.length === 1 ? 'experience' : 'experiences', items.length === 1 ? 'experiencia' : 'experiencias')} /{' '}
                {currency}
              </p>
              <dl className="mt-6 space-y-4 text-sm">
                <div className="flex justify-between gap-3">
                  <dt>{label('Trip total', 'Total del viaje')}</dt>
                  <dd className="font-semibold">
                    {formatPrice(tripTotal, currency)}
                  </dd>
                </div>
                <div className="flex justify-between gap-3">
                  <dt>{label('Remaining balance', 'Saldo restante')}</dt>
                  <dd>{formatPrice(remainingBalance, currency)}</dd>
                </div>
                <div className="flex justify-between gap-3 border-t pt-5 text-lg font-bold">
                  <dt>{label('Initial payment', 'Pago inicial')}</dt>
                  <dd className="text-ocean">
                    {formatPrice(payToday, currency)}
                  </dd>
                </div>
              </dl>
              <p className="mt-4 text-xs leading-6 text-muted-foreground">
                {label(
                  'Estimated amounts. Availability and final pricing are confirmed by our team before payment.',
                  'Importes estimados. Nuestro equipo confirma disponibilidad y precio final antes del pago.',
                )}
              </p>
              {invalid && (
                <p
                  role="alert"
                  className="mt-4 rounded-lg bg-amber-50 p-3 text-sm text-amber-900"
                >
                  {label(
                    'Review the dates, departure times and number of travelers in your trip.',
                    'Revisa las fechas, horarios y cantidad de viajeros de tu viaje.',
                  )}{' '}
                  {checkout && (
                    <Link href="/trip" className="underline">
                      {label('Edit trip', 'Editar viaje')}
                    </Link>
                  )}
                </p>
              )}
              {!checkout && !invalid && (
                <Link href="/checkout" className="action-primary mt-6 w-full">
                  {label('Continue with my trip', 'Continuar con mi viaje')}
                  <ArrowRight className="size-4" />
                </Link>
              )}
              {checkout && step === 1 && (
                <button
                  type="submit"
                  form="traveler-form"
                  disabled={invalid}
                  className="action-primary mt-6 w-full"
                >
                  {label('Review itinerary', 'Revisar itinerario')}
                </button>
              )}
              <div className="mt-5 flex gap-2 text-xs leading-5 text-muted-foreground">
                <ShieldCheck className="size-4 shrink-0 text-jungle" />
                {label(
                  'No charge is made at this step.',
                  'En este paso no se realiza ningún cobro.',
                )}
              </div>
            </div>
            <div className="rounded-2xl bg-[#edf4f5] p-6">
              <MapPin className="size-5 text-ocean" />
              <h3 className="mt-3 font-semibold">
                {label(
                  'A local hand with your plans',
                  'Ayuda local para tus planes',
                )}
              </h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {label(
                  'Unsure how to combine your tours? We can help.',
                  '¿No sabes cómo combinar tus tours? Te ayudamos.',
                )}
              </p>
              <Link
                href="/contact"
                className="mt-4 inline-block text-sm font-semibold text-ocean"
              >
                {label('Contact the team', 'Contactar al equipo')}
              </Link>
            </div>
          </aside>
        </div>
      </div>
    </>
  )
}
