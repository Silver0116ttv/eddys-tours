'use client'

import { useState } from 'react'
import Link from 'next/link'
import { CalendarDays, Search, ShieldCheck } from 'lucide-react'
import { useI18n } from '@/components/use-i18n'
import { readDemoRequests, type DemoRequest } from '@/lib/demo-requests'
import { formatPrice } from '@/lib/tours'
import { PageIntro } from './page-shell'

export function MyBookings() {
  const { language } = useI18n()
  const es = language === 'ES'
  const [result, setResult] = useState<DemoRequest | null>(null)
  const [searched, setSearched] = useState(false)
  return (
    <>
      <PageIntro
        title={
          es ? 'Tu viaje, siempre a la mano.' : 'Your trip, always at hand.'
        }
        description={
          es
            ? 'Consulta el itinerario de tu solicitud de ejemplo con la referencia y el correo que registraste.'
            : 'Look up your sample itinerary with the reference and email you used.'
        }
      />
      <div className="travel-container grid items-start gap-8 py-12 lg:grid-cols-[380px_1fr]">
        <form
          className="surface space-y-5"
          onSubmit={(e) => {
            e.preventDefault()
            const form = new FormData(e.currentTarget)
            setResult(
              readDemoRequests().find(
                (r) =>
                  r.reference ===
                    String(form.get('reference')).trim().toUpperCase() &&
                  r.email.toLowerCase() ===
                    String(form.get('email')).trim().toLowerCase(),
              ) ?? null,
            )
            setSearched(true)
          }}
        >
          <h2 className="text-xl font-bold">
            {es ? 'Buscar mi solicitud' : 'Find my request'}
          </h2>
          <label className="field">
            {es ? 'Referencia' : 'Reference'}
            <input
              required
              name="reference"
              placeholder="DEMO-XXXXXXXX"
              autoCapitalize="characters"
            />
          </label>
          <label className="field">
            {es ? 'Correo electrónico' : 'Email address'}
            <input required name="email" type="email" autoComplete="email" />
          </label>
          <button type="submit" className="action-primary w-full">
            <Search className="size-4" />
            {es ? 'Consultar itinerario' : 'Find itinerary'}
          </button>
          <p className="flex gap-2 text-xs leading-6 text-muted-foreground">
            <ShieldCheck className="mt-1 size-4 shrink-0" />
            {es
              ? 'En esta demostración solo se consultan solicitudes guardadas en este navegador. No hay reservas ni cobros reales.'
              : 'This demo only retrieves requests saved in this browser. There are no real bookings or charges.'}
          </p>
        </form>
        <section>
          {result ? (
            <div className="surface">
              <div className="flex flex-wrap justify-between gap-3">
                <div>
                  <p className="text-sm font-semibold text-ocean">
                    {result.reference}
                  </p>
                  <h2 className="mt-2 text-2xl font-bold">{result.name}</h2>
                </div>
                <span className="h-fit rounded-full bg-amber-50 px-4 py-2 text-xs font-semibold text-amber-800">
                  {es ? 'Solicitud de ejemplo' : 'Sample request'}
                </span>
              </div>
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                {es
                  ? 'El itinerario se guardó para revisar el flujo. Todavía requiere confirmación de disponibilidad y pago por parte del equipo.'
                  : 'This itinerary was saved to preview the workflow. Availability and payment still require confirmation from the team.'}
              </p>
              <div className="mt-6 space-y-4">
                {result.items.map((item) => (
                  <div key={item.lineId} className="rounded-xl border p-5">
                    <h3 className="font-semibold">{item.title}</h3>
                    <p className="mt-2 flex flex-wrap items-center gap-2 text-sm text-muted-foreground">
                      <CalendarDays className="size-4" />
                      {item.date} / {item.time} / {item.adults}{' '}
                      {es ? 'viajeros' : 'travelers'}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-6 flex justify-between gap-4 border-t pt-5">
                <span>{es ? 'Total estimado' : 'Estimated total'}</span>
                <strong>{formatPrice(result.total, result.currency)}</strong>
              </div>
              <div className="mt-6 flex flex-wrap gap-3">
                <Link href="/contact" className="action-secondary">
                  {es ? 'Solicitar un cambio' : 'Request a change'}
                </Link>
                <Link href="/tours" className="action-primary">
                  {es ? 'Explorar más tours' : 'Explore more tours'}
                </Link>
              </div>
            </div>
          ) : (
            <div className="empty-state">
              <CalendarDays className="size-10 text-ocean" />
              <h2>
                {searched
                  ? es
                    ? 'No encontramos esa solicitud'
                    : 'We could not find that request'
                  : es
                    ? 'Todo tu itinerario en un lugar'
                    : 'Your whole itinerary in one place'}
              </h2>
              <p>
                {searched
                  ? es
                    ? 'Revisa la referencia y el correo. Usa el mismo navegador donde guardaste la solicitud.'
                    : 'Check your reference and email. Use the browser where you saved the request.'
                  : es
                    ? 'Después de armar tu viaje podrás consultar aquí los detalles de cada experiencia.'
                    : 'After building your trip, you can find the details of every experience here.'}
              </p>
              <Link
                href={searched ? '/contact' : '/tours'}
                className="action-secondary"
              >
                {searched
                  ? es
                    ? 'Necesito ayuda'
                    : 'I need help'
                  : es
                    ? 'Explorar tours'
                    : 'Explore tours'}
              </Link>
            </div>
          )}
        </section>
      </div>
    </>
  )
}
