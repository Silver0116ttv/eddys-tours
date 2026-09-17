'use client'

import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowUpRight,
  Check,
  Compass,
  Mail,
  MapPin,
  Phone,
  Search,
  ShieldCheck,
  Users,
} from 'lucide-react'
import { useI18n } from '@/components/use-i18n'
import { categories, destinations } from '@/lib/tours'
import { localizeCategory } from '@/lib/i18n'
import { PageIntro } from './page-shell'
import { saveDemoContact } from '@/lib/demo-requests'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { mailtoUrl, siteConfig, whatsappUrl } from '@/lib/site'

export type InformationKind =
  'destinations' | 'categories' | 'about' | 'help' | 'contact' | 'privacy'
const titles: Record<InformationKind, [string, string]> = {
  destinations: [
    'Encuentra tu rincón de la bahía.',
    'Find your corner of the bay.',
  ],
  categories: [
    '¿Cómo quieres vivir Vallarta?',
    'How will you experience Vallarta?',
  ],
  about: [
    'Vallarta se vive mejor con un local.',
    'Vallarta is better with a local.',
  ],
  help: ['Viaja con todo claro.', 'A little clarity. A better trip.'],
  contact: [
    'Tu aventura empieza conversando.',
    'Your adventure starts with a conversation.',
  ],
  privacy: ['Tu información, con claridad.', 'Your information, explained.'],
}
const descriptions: Record<InformationKind, [string, string]> = {
  destinations: [
    'Del Malecón a las montañas: explora los lugares que hacen única a Bahía de Banderas.',
    'From the Malecón to the mountains, explore the places that make Banderas Bay special.',
  ],
  categories: [
    'Un día en el mar, una aventura en la selva o tiempo en familia. Empieza por lo que más te gusta.',
    'A day at sea, a jungle adventure or time together. Start with what you love.',
  ],
  about: [
    'Conectamos viajeros con experiencias y operadores locales en Puerto Vallarta y sus alrededores.',
    'We connect travelers with local experiences and operators in and around Puerto Vallarta.',
  ],
  help: [
    'Resuelve tus dudas antes de elegir, reservar y salir a explorar.',
    'Everything to help you choose, plan and head out exploring.',
  ],
  contact: [
    'Cuéntanos qué tienes en mente. Te ayudamos a elegir tours y combinar experiencias para tu grupo.',
    'Tell us what you have in mind. We can help you choose tours and combine experiences for your group.',
  ],
  privacy: [
    'Conoce qué información utilizas al planear tu viaje en este sitio.',
    'Understand the information you use when planning a trip on this site.',
  ],
}
const faq: [string, string, string, string, string, string][] = [
  [
    'Reservaciones',
    'Bookings',
    '¿Puedo elegir varios tours?',
    'Can I choose more than one tour?',
    'Sí. Agrega las experiencias a Mi viaje, elige fecha y viajeros para cada una, y revisa todo en un solo itinerario.',
    'Yes. Add experiences to My trip, choose a date and travelers for each, and review them in one itinerary.',
  ],
  [
    'Reservaciones',
    'Bookings',
    '¿Cuándo queda confirmada mi reserva?',
    'When is my booking confirmed?',
    'Tu selección no aparta lugares. El equipo debe confirmar disponibilidad, precio final y las instrucciones de pago por escrito antes de tu salida.',
    'Your selection does not hold spots. Our team must confirm availability, final pricing and payment instructions in writing before departure.',
  ],
  [
    'Pagos',
    'Payments',
    '¿Cómo funcionan los anticipos?',
    'How do deposits work?',
    'Cada tour muestra el anticipo por persona y el saldo restante. Puedes solicitar pago completo o anticipo. No se realizan cargos desde el itinerario.',
    'Each tour shows the per-person deposit and remaining balance. You can request full payment or a deposit. The itinerary does not charge you.',
  ],
  [
    'Pagos',
    'Payments',
    '¿Puedo ver precios en pesos?',
    'Can I see prices in pesos?',
    'Sí. Usa el selector MXN / USD del menú. El desglose de todo tu viaje utiliza la moneda seleccionada.',
    'Yes. Use the MXN / USD selector in the menu. Your entire trip breakdown uses the selected currency.',
  ],
  [
    'Antes del tour',
    'Before your tour',
    '¿Qué debo llevar?',
    'What should I bring?',
    'Revisa los requisitos de cada experiencia. Para actividades al aire libre, considera agua, ropa cómoda y protección solar; confirma las restricciones con el operador.',
    'Check the requirements for each experience. For outdoor activities, consider water, comfortable clothing and sun protection; confirm restrictions with the operator.',
  ],
  [
    'Antes del tour',
    'Before your tour',
    '¿Incluye transporte desde mi hotel?',
    'Is hotel pickup included?',
    'Depende de la experiencia. Consulta las secciones de incluidos y punto de encuentro en la ficha del tour. Si necesitas transporte, indícalo en tu solicitud.',
    'It depends on the experience. Check the inclusions and meeting point on the tour page. If you need transport, mention it in your request.',
  ],
  [
    'Cambios',
    'Changes',
    '¿Puedo cambiar la fecha o cancelar?',
    'Can I change my date or cancel?',
    'Las condiciones dependen del operador y del tiempo restante para la salida. Contacta al equipo con tu referencia antes de hacer cambios y consulta la política de reservación.',
    'Terms depend on the operator and how soon your tour departs. Contact the team with your reference before making changes and review the booking policy.',
  ],
  [
    'Cambios',
    'Changes',
    '¿Qué pasa si hay mal clima?',
    'What happens in bad weather?',
    'El operador decide si las condiciones permiten la actividad. El equipo te indicará las opciones de reprogramación o cancelación aplicables a tu reserva.',
    'The operator decides whether conditions allow the activity. The team will explain the rescheduling or cancellation options that apply to your booking.',
  ],
]

export function Information({ kind }: { kind: InformationKind }) {
  const { language } = useI18n()
  const es = language === 'ES'
  const [query, setQuery] = useState('')
  const [topic, setTopic] = useState('')
  const [prepared, setPrepared] = useState(false)
  const demo = !isSupabaseConfigured()
  const [sendError, setSendError] = useState('')
  const [emailHref, setEmailHref] = useState('')
  const matching = faq.filter(
    (row) =>
      (!topic || row[1] === topic) &&
      `${row[es ? 2 : 3]} ${row[es ? 4 : 5]}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )

  return (
    <>
      <PageIntro
        title={titles[kind][es ? 0 : 1]}
        description={descriptions[kind][es ? 0 : 1]}
      />
      <div className="travel-container py-12 md:py-16">
        {(kind === 'destinations' || kind === 'categories') && (
          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {(kind === 'destinations'
              ? destinations.map((d) => ({
                  name: d.name,
                  image: d.image,
                  href: `/tours?destination=${encodeURIComponent(d.name)}`,
                  description: es
                    ? 'Descubre las experiencias de este destino.'
                    : d.description,
                }))
              : categories.map((c) => ({
                  name: localizeCategory(c.name, language),
                  image: c.image,
                  href: `/tours?category=${c.name}`,
                  description: es
                    ? 'Encuentra tu próxima experiencia.'
                    : 'Find your next experience.',
                }))
            ).map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className="group overflow-hidden rounded-2xl border bg-white"
              >
                <div className="relative aspect-[4/3]">
                  <Image
                    src={item.image}
                    alt={item.name}
                    fill
                    sizes="(max-width: 640px) 100vw, 33vw"
                    className="object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                </div>
                <div className="p-6">
                  <div className="flex items-center justify-between gap-4">
                    <h2 className="text-2xl font-bold">{item.name}</h2>
                    <ArrowUpRight className="size-5 text-ocean" />
                  </div>
                  <p className="mt-3 leading-6 text-muted-foreground">
                    {item.description}
                  </p>
                </div>
              </Link>
            ))}
          </div>
        )}

        {kind === 'about' && (
          <>
            <div className="grid items-center gap-10 lg:grid-cols-2">
              <div className="relative aspect-[5/4] overflow-hidden rounded-3xl">
                <Image
                  src="/images/dest-puerto-vallarta.webp"
                  alt="Puerto Vallarta"
                  fill
                  sizes="(max-width: 1024px) 100vw, 50vw"
                  className="object-cover"
                />
              </div>
              <div>
                <h2 className="text-3xl font-bold md:text-4xl">
                  {es
                    ? 'Más tiempo disfrutando. Menos tiempo planeando.'
                    : 'More time enjoying. Less time planning.'}
                </h2>
                <p className="mt-6 leading-8 text-muted-foreground">
                  {es
                    ? 'Eddy’s Tours reúne paseos en barco, aventuras en la Sierra Madre y escapadas por la bahía en un mismo lugar. Nuestra idea es sencilla: que puedas comparar con calma, entender qué incluye cada experiencia y encontrar una que vaya contigo.'
                    : 'Eddy’s Tours brings boat trips, Sierra Madre adventures and escapes around the bay together in one place. Our idea is simple: give you room to compare, understand what each experience includes and find one that feels right for you.'}
                </p>
                <Link href="/tours" className="action-primary mt-7">
                  {es ? 'Encuentra tu experiencia' : 'Find your experience'}
                </Link>
              </div>
            </div>
            <div className="mt-16 grid gap-8 md:grid-cols-3">
              {[
                [
                  Compass,
                  es ? 'Conocimiento local' : 'Local knowledge',
                  es
                    ? 'Experiencias conectadas con los lugares y las personas de la bahía.'
                    : 'Experiences connected to the places and people of the bay.',
                ],
                [
                  ShieldCheck,
                  es ? 'Detalles a la vista' : 'The details up front',
                  es
                    ? 'Precios, puntos de encuentro y requisitos para tomar una buena decisión.'
                    : 'Prices, meeting points and requirements to help you choose.',
                ],
                [
                  Users,
                  es ? 'Un viaje a tu ritmo' : 'A trip at your pace',
                  es
                    ? 'Combina tours para viajar en pareja, con amigos o con toda la familia.'
                    : 'Combine tours for a couple, a group of friends or the whole family.',
                ],
              ].map(([Icon, title, body]) => {
                const Symbol = Icon as typeof Compass
                return (
                  <div key={String(title)} className="border-t pt-6">
                    <Symbol className="size-7 text-ocean" />
                    <h3 className="mt-5 text-xl font-bold">{String(title)}</h3>
                    <p className="mt-3 leading-7 text-muted-foreground">
                      {String(body)}
                    </p>
                  </div>
                )
              })}
            </div>
          </>
        )}

        {kind === 'help' && (
          <div className="grid gap-10 lg:grid-cols-[240px_1fr]">
            <aside>
              <label className="field">
                <span>{es ? 'Busca una respuesta' : 'Find an answer'}</span>
                <span className="relative">
                  <Search className="absolute left-3 top-4 size-4 text-muted-foreground" />
                  <input
                    style={{ paddingLeft: 36 }}
                    type="search"
                    value={query}
                    onChange={(e) => setQuery(e.target.value)}
                    placeholder={
                      es ? 'Anticipo, transporte…' : 'Deposit, pickup…'
                    }
                  />
                </span>
              </label>
              <div className="mt-6 flex flex-wrap gap-2 lg:flex-col">
                {['', ...new Set(faq.map((row) => row[1]))].map((item) => (
                  <button
                    key={item}
                    onClick={() => setTopic(item)}
                    aria-pressed={topic === item}
                    className={`rounded-lg px-4 py-3 text-left text-sm ${topic === item ? 'bg-ocean text-white' : 'hover:bg-muted'}`}
                  >
                    {item
                      ? es
                        ? faq.find((row) => row[1] === item)?.[0]
                        : item
                      : es
                        ? 'Todas las preguntas'
                        : 'All questions'}
                  </button>
                ))}
              </div>
            </aside>
            <div>
              {matching.length ? (
                matching.map((row) => (
                  <details key={row[2]} className="group border-b py-5">
                    <summary className="flex list-none items-center justify-between gap-5 text-lg font-semibold">
                      {row[es ? 2 : 3]}
                      <span className="text-2xl font-normal text-ocean group-open:rotate-45">
                        +
                      </span>
                    </summary>
                    <p className="max-w-3xl pt-4 leading-7 text-muted-foreground">
                      {row[es ? 4 : 5]}
                    </p>
                  </details>
                ))
              ) : (
                <div className="empty-state">
                  <Search />
                  <h2>
                    {es
                      ? 'No encontramos esa respuesta'
                      : 'No matching answers'}
                  </h2>
                  <button
                    className="action-secondary"
                    onClick={() => {
                      setQuery('')
                      setTopic('')
                    }}
                  >
                    {es ? 'Mostrar todas' : 'Show all'}
                  </button>
                </div>
              )}
              <div className="mt-10 flex flex-wrap items-center justify-between gap-5 rounded-2xl bg-[#edf4f5] p-7">
                <div>
                  <h2 className="text-xl font-bold">
                    {es
                      ? '¿Tu pregunta es diferente?'
                      : 'Have a different question?'}
                  </h2>
                  <p className="mt-2 text-muted-foreground">
                    {es
                      ? 'Podemos ayudarte a planear tu visita.'
                      : 'We can help you plan your visit.'}
                  </p>
                </div>
                <Link className="action-primary" href="/contact">
                  {es ? 'Habla con nosotros' : 'Talk to us'}
                </Link>
              </div>
            </div>
          </div>
        )}

        {kind === 'contact' && (
          <div className="grid gap-12 lg:grid-cols-[.8fr_1.2fr]">
            <aside>
              <h2 className="text-3xl font-bold">
                {es ? 'Aquí para ayudarte.' : 'Here to help.'}
              </h2>
              <p className="mt-4 max-w-sm leading-7 text-muted-foreground">
                {es
                  ? 'Viajes en grupo, celebraciones o una duda sobre tu tour. Cuéntanos los detalles para orientarte mejor.'
                  : 'Group trips, celebrations or a question about your tour. Share a few details so we can help.'}
              </p>
              <a className="mt-8 flex gap-4" href={mailtoUrl()}>
                <Mail className="text-ocean" />
                <span>
                  <strong className="block">Email</strong>
                  <span className="text-muted-foreground">
                    {siteConfig.email}
                  </span>
                </span>
              </a>
              {siteConfig.phone && (
                <a
                  className="mt-6 flex gap-4"
                  href={
                    whatsappUrl(
                      es
                        ? 'Hola, quiero información sobre sus tours.'
                        : 'Hi, I would like information about your tours.',
                    ) ?? `tel:${siteConfig.phone.replace(/\s+/g, '')}`
                  }
                  target="_blank"
                  rel="noopener noreferrer"
                >
                  <Phone className="text-ocean" />
                  <span>
                    <strong className="block">
                      {es ? 'WhatsApp / Teléfono' : 'WhatsApp / Phone'}
                    </strong>
                    <span className="text-muted-foreground">
                      {siteConfig.phone}
                    </span>
                  </span>
                </a>
              )}
              <div className="mt-6 flex gap-4">
                <MapPin className="text-ocean" />
                <span>
                  <strong className="block">Puerto Vallarta, México</strong>
                  <span className="text-muted-foreground">
                    Bahía de Banderas
                  </span>
                </span>
              </div>
              <Link
                href="/help"
                className="mt-8 inline-block text-sm font-semibold text-ocean"
              >
                {es
                  ? 'Consulta las preguntas frecuentes'
                  : 'Browse frequently asked questions'}
              </Link>
            </aside>
            <form
              className="surface space-y-5"
              onSubmit={(e) => {
                e.preventDefault()
                const data = new FormData(e.currentTarget)
                setSendError('')
                if (demo) {
                  try {
                    saveDemoContact({
                      name: String(data.get('name')),
                      email: String(data.get('email')),
                      subject: String(data.get('subject')),
                      message: String(data.get('message')),
                    })
                  } catch {
                    setSendError(
                      es
                        ? 'No pudimos guardar el mensaje en este navegador. Intenta nuevamente.'
                        : 'We could not save this message in your browser. Try again.',
                    )
                    return
                  }
                }
                setEmailHref(
                  mailtoUrl(
                    String(data.get('subject')),
                    `${data.get('name')} · ${data.get('email')}\n\n${data.get('message')}`,
                  ),
                )
                setPrepared(true)
              }}
            >
              <h2 className="text-2xl font-bold">
                {es ? 'Cuéntanos tus planes' : 'Tell us your plans'}
              </h2>
              <div className="grid gap-5 sm:grid-cols-2">
                <label className="field">
                  {es ? 'Tu nombre' : 'Your name'}
                  <input
                    name="name"
                    autoComplete="name"
                    required
                    maxLength={100}
                  />
                </label>
                <label className="field">
                  {es ? 'Correo electrónico' : 'Email address'}
                  <input
                    type="email"
                    name="email"
                    autoComplete="email"
                    required
                  />
                </label>
              </div>
              <label className="field">
                {es ? '¿En qué te ayudamos?' : 'How can we help?'}
                <select name="subject">
                  {(es
                    ? [
                        'Planear mi viaje',
                        'Una reservación existente',
                        'Viaje privado o en grupo',
                        'Colaboraciones',
                      ]
                    : [
                        'Plan my trip',
                        'An existing booking',
                        'Private or group trip',
                        'Partnerships',
                      ]
                  ).map((s) => (
                    <option key={s}>{s}</option>
                  ))}
                </select>
              </label>
              <label className="field">
                {es ? 'Tu mensaje' : 'Your message'}
                <textarea
                  name="message"
                  required
                  minLength={10}
                  maxLength={2000}
                  placeholder={
                    es
                      ? 'Fechas, número de viajeros y lo que te gustaría hacer…'
                      : 'Dates, number of travelers and what you would like to do…'
                  }
                />
              </label>
              <label className="flex items-start gap-3 text-sm leading-6 text-muted-foreground">
                <input
                  type="checkbox"
                  required
                  className="mt-1 size-4 accent-ocean"
                />
                <span>
                  {es
                    ? 'Acepto que utilicen estos datos para responder mi consulta.'
                    : 'I agree to use of these details to answer my inquiry.'}{' '}
                  <Link href="/privacy" className="text-ocean underline">
                    {es ? 'Privacidad' : 'Privacy'}
                  </Link>
                </span>
              </label>
              <p className="text-xs leading-6 text-muted-foreground">
                {demo
                  ? es
                    ? 'Modo de ejemplo: el mensaje se guarda en este navegador y aparece en los contactos del panel. No se envía un correo real.'
                    : 'Sample mode: the message is saved in this browser and appears in the admin contacts. No real email is sent.'
                  : ''}
              </p>
              {sendError && (
                <p role="alert" className="text-sm text-red-700">
                  {sendError}
                </p>
              )}
              <button
                className="action-primary"
                type="submit"
                disabled={prepared}
              >
                {demo
                  ? es
                    ? 'Guardar mensaje de ejemplo'
                    : 'Save sample message'
                  : es
                    ? 'Preparar mensaje'
                    : 'Prepare message'}
              </button>
              {prepared && (
                <div role="status" className="rounded-xl bg-[#edf4f5] p-5">
                  <p className="flex items-center gap-2 font-semibold">
                    <Check className="size-4" />
                    {demo
                      ? es
                        ? 'Mensaje de ejemplo guardado'
                        : 'Sample message saved'
                      : es
                        ? 'Tu mensaje está listo'
                        : 'Your message is ready'}
                  </p>
                  <p className="mt-2 text-sm leading-6">
                    {demo
                      ? es
                        ? 'Puedes consultarlo en el panel de demostración. No se envió ningún mensaje externo.'
                        : 'You can find it in the admin demo. No external message was sent.'
                      : es
                        ? 'Abre tu aplicación de correo para revisarlo y enviarlo. Todavía no se ha enviado.'
                        : 'Open your email app to review and send it. It has not been sent yet.'}
                  </p>
                  {!demo && (
                    <a className="action-secondary mt-4" href={emailHref}>
                      {es ? 'Abrir correo' : 'Open email'}
                    </a>
                  )}
                  {demo && (
                    <button
                      type="button"
                      className="action-secondary mt-4"
                      onClick={() => setPrepared(false)}
                    >
                      {es ? 'Preparar otro mensaje' : 'Prepare another message'}
                    </button>
                  )}
                </div>
              )}
            </form>
          </div>
        )}

        {kind === 'privacy' && (
          <article className="max-w-3xl space-y-8">
            {(es
              ? [
                  [
                    'Tu itinerario y favoritos',
                    'Los tours seleccionados, favoritos, idioma y moneda se guardan en este navegador para que puedas continuar tu visita. Puedes eliminar el itinerario desde Mi viaje y quitar favoritos con el botón de corazón.',
                  ],
                  [
                    'Información de contacto',
                    'En modo de demostración, las solicitudes y mensajes se guardan solo en este navegador para probar el recorrido del turista y el panel. No se envían correos ni se realizan cobros. No introduzcas datos sensibles en la demostración. Fuera de este modo, los formularios preparan un correo que tú decides si envías.',
                  ],
                  [
                    'Servicios del sitio',
                    'El catálogo y el acceso del personal pueden utilizar Supabase. En producción, el sitio incluye Google Analytics para medir visitas de forma agregada. Los enlaces externos y tu proveedor de correo tienen sus propias condiciones.',
                  ],
                  [
                    'Preguntas sobre tus datos',
                    `Para consultas sobre información que hayas compartido con el equipo, escribe a ${siteConfig.email}. Esta página describe el funcionamiento actual del sitio.`,
                  ],
                ]
              : [
                  [
                    'Your itinerary and favorites',
                    'Selected tours, favorites, language and currency are stored in this browser so you can continue your visit. Remove the itinerary from My trip and remove favorites with the heart button.',
                  ],
                  [
                    'Contact information',
                    'In demonstration mode, requests and messages are saved only in this browser to test the traveler journey and admin panel. No emails are sent and no charges are made. Do not enter sensitive details in the demo. Outside demo mode, forms prepare an email that you decide whether to send.',
                  ],
                  [
                    'Site services',
                    'The catalog and staff access may use Supabase. In production, the site includes Google Analytics to measure visits in aggregate. External links and your email provider have their own terms.',
                  ],
                  [
                    'Questions about your information',
                    `For questions about information shared with the team, email ${siteConfig.email}. This page describes how the site currently works.`,
                  ],
                ]
            ).map(([title, body]) => (
              <section key={title}>
                <h2 className="text-2xl font-bold">{title}</h2>
                <p className="mt-4 leading-8 text-muted-foreground">{body}</p>
              </section>
            ))}
          </article>
        )}
      </div>
    </>
  )
}
