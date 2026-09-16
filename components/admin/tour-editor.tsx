'use client'

import { useState } from 'react'
import Image from 'next/image'
import { CalendarDays, Check, ImagePlus, Plus, X } from 'lucide-react'
import { localizeCategory, localizeTour } from '@/lib/i18n'
import { TOUR_CATEGORIES, type Tour } from '@/lib/tours'
import type { AdminRecord } from '@/lib/admin-workspace'

const tabs = ['Información', 'Precios', 'Contenido y fotos', 'Salidas']
const photos = [
  '/images/tour-atv.webp',
  '/images/tour-marietas.webp',
  '/images/tour-sunset-sailing.webp',
  '/images/tour-snorkeling.webp',
  '/images/tour-yacht.webp',
  '/images/tour-whale.webp',
  '/images/tour-yelapa.webp',
  '/images/dest-san-sebastian.webp',
]
const lines = (value: string) =>
  value
    .split('\n')
    .map((s) => s.trim())
    .filter(Boolean)

export function TourEditor({
  record,
  busy,
  error,
  onSave,
  onCancel,
}: {
  record: AdminRecord
  busy: boolean
  error: string
  onSave: (record: AdminRecord) => void
  onCancel: () => void
}) {
  const source = record.tour
  const spanish = source ? localizeTour(source, 'ES') : undefined
  const [tab, setTab] = useState(0)
  const [validation, setValidation] = useState('')
  const [date, setDate] = useState('')
  const [time, setTime] = useState('09:00')
  const [form, setForm] = useState({
    name: spanish?.title ?? record.name,
    englishName: source?.title ?? '',
    slug: record.slug ?? '',
    operator: record.subtitle,
    category: record.category ?? 'Adventure',
    location: record.location ?? 'Puerto Vallarta',
    duration: String(parseFloat(source?.duration ?? '3') * 60),
    status: record.status,
    description: spanish?.shortDescription ?? record.description ?? '',
    fullDescription: spanish?.fullDescription ?? '',
    englishDescription: source?.fullDescription ?? '',
    included: spanish?.includedItems.join('\n') ?? '',
    excluded: spanish?.excludedItems.join('\n') ?? '',
    requirements: spanish?.requirements.join('\n') ?? '',
    meeting: spanish?.meetingPoint ?? '',
    usd: source?.retailPrice.usd ?? 0,
    mxn: record.price ?? 0,
    depositUsd: source?.deposit.usd ?? 0,
    depositMxn: record.amount ?? 0,
    capacity: record.quantity ?? 20,
    featured: Boolean(record.featured),
    popular: Boolean(record.popular),
    dates: source?.availableDates ?? [],
    times: source?.availableTimes ?? [],
    images: source?.images ?? [record.image ?? photos[0]!],
  })
  function update<K extends keyof typeof form>(
    key: K,
    value: (typeof form)[K],
  ) {
    setForm((current) => ({ ...current, [key]: value }))
  }
  function save() {
    const slug =
      form.slug.trim() ||
      form.name
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
    if (
      !form.name.trim() ||
      !form.operator.trim() ||
      !form.location.trim() ||
      !slug
    ) {
      setTab(0)
      setValidation('Completa el nombre, operador y destino.')
      return
    }
    if (
      form.mxn < 0 ||
      form.usd < 0 ||
      form.depositMxn > form.mxn ||
      form.depositUsd > form.usd
    ) {
      setTab(1)
      setValidation('El anticipo no puede superar el precio en ninguna moneda.')
      return
    }
    if (
      form.status === 'published' &&
      (!form.description.trim() ||
        !form.fullDescription.trim() ||
        !form.meeting.trim())
    ) {
      setTab(2)
      setValidation(
        'Agrega descripción, itinerario y punto de encuentro antes de publicar.',
      )
      return
    }
    if (
      form.status === 'published' &&
      (!form.dates.length || !form.times.length)
    ) {
      setTab(3)
      setValidation('Agrega al menos una fecha y un horario antes de publicar.')
      return
    }
    const tour: Tour = {
      id: record.id,
      slug,
      sample: true,
      title: form.englishName.trim() || form.name.trim(),
      providerName: form.operator.trim(),
      category: form.category as Tour['category'],
      location: form.location.trim(),
      images: form.images,
      shortDescription: form.englishDescription || form.description,
      fullDescription: form.englishDescription || form.fullDescription,
      duration: `${Number(form.duration) / 60} hours`,
      retailPrice: { usd: form.usd, mxn: form.mxn },
      deposit: { usd: form.depositUsd, mxn: form.depositMxn },
      rating: source?.rating ?? 0,
      reviewsCount: source?.reviewsCount ?? 0,
      availableDates: form.dates,
      availableTimes: form.times,
      availableSpots: form.capacity,
      meetingPoint: form.meeting,
      includedItems: lines(form.included),
      excludedItems: lines(form.excluded),
      requirements: lines(form.requirements),
      featured: form.featured,
      popular: form.popular,
      translations: {
        'es-MX': {
          title: form.name,
          duration: `${Number(form.duration) / 60} horas`,
          shortDescription: form.description,
          fullDescription: form.fullDescription,
          meetingPoint: form.meeting,
          includedItems: lines(form.included),
          excludedItems: lines(form.excluded),
          requirements: lines(form.requirements),
        },
      },
    }
    onSave({
      ...record,
      name: form.name,
      subtitle: form.operator,
      slug,
      status: form.status,
      category: form.category,
      location: form.location,
      description: form.description,
      price: form.mxn,
      amount: form.depositMxn,
      quantity: form.capacity,
      image: form.images[0],
      featured: form.featured,
      popular: form.popular,
      tour,
    })
  }

  return (
    <form
      className="space-y-6"
      onSubmit={(e) => {
        e.preventDefault()
        save()
      }}
    >
      <div
        className="flex gap-1 overflow-x-auto border-b pb-4"
        role="tablist"
        aria-label="Secciones del tour"
      >
        {tabs.map((title, i) => (
          <button
            key={title}
            type="button"
            role="tab"
            aria-selected={tab === i}
            tabIndex={tab === i ? 0 : -1}
            aria-controls={`tour-panel-${i}`}
            id={`tour-tab-${i}`}
            onKeyDown={(e) => {
              const next = e.key === 'ArrowRight' ? (i + 1) % tabs.length
                : e.key === 'ArrowLeft' ? (i - 1 + tabs.length) % tabs.length
                : e.key === 'Home' ? 0 : e.key === 'End' ? tabs.length - 1 : null
              if (next === null) return
              e.preventDefault()
              setTab(next)
              setValidation('')
              document.getElementById(`tour-tab-${next}`)?.focus()
            }}
            onClick={() => {
              setTab(i)
              setValidation('')
            }}
            className={`shrink-0 rounded-lg px-3 py-2 text-xs font-semibold ${tab === i ? 'bg-ocean text-white' : 'bg-muted text-muted-foreground'}`}
          >
            {title}
          </button>
        ))}
      </div>
      <div
        role="tabpanel"
        id={`tour-panel-${tab}`}
        aria-labelledby={`tour-tab-${tab}`}
        className="space-y-5"
      >
        {tab === 0 && (
          <>
            <p className="text-sm leading-6 text-muted-foreground">
              La información que ayudará al viajero a encontrar esta
              experiencia.
            </p>
            <label className="field">
              Nombre en español
              <input
                required
                maxLength={140}
                value={form.name}
                onChange={(e) => update('name', e.target.value)}
              />
            </label>
            <label className="field">
              Nombre en inglés
              <input
                maxLength={140}
                value={form.englishName}
                onChange={(e) => update('englishName', e.target.value)}
              />
            </label>
            <label className="field">
              Enlace del tour
              <input
                pattern="[a-z0-9]+(-[a-z0-9]+)*"
                placeholder="Se genera a partir del nombre"
                value={form.slug}
                onChange={(e) => update('slug', e.target.value)}
              />
              <span className="text-xs text-muted-foreground">
                /tours/{form.slug || 'nombre-de-la-experiencia'}
              </span>
            </label>
            <label className="field">
              Operador
              <input
                required
                value={form.operator}
                onChange={(e) => update('operator', e.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                Categoría
                <select
                  value={form.category}
                  onChange={(e) => update('category', e.target.value)}
                >
                  {TOUR_CATEGORIES.map((c) => (
                    <option key={c} value={c}>
                      {localizeCategory(c, 'ES')}
                    </option>
                  ))}
                </select>
              </label>
              <label className="field">
                Destino
                <input
                  required
                  value={form.location}
                  onChange={(e) => update('location', e.target.value)}
                />
              </label>
              <label className="field">
                Duración en minutos
                <input
                  required
                  type="number"
                  min="15"
                  max="10080"
                  step="15"
                  value={form.duration}
                  onChange={(e) => update('duration', e.target.value)}
                />
              </label>
              <label className="field">
                Publicación
                <select
                  value={form.status}
                  onChange={(e) => update('status', e.target.value)}
                >
                  <option value="draft">Borrador</option>
                  <option value="published">Publicado</option>
                </select>
              </label>
            </div>
            <div className="flex flex-wrap gap-4">
              {(['featured', 'popular'] as const).map((k) => (
                <label key={k} className="flex items-center gap-2 text-sm">
                  <input
                    type="checkbox"
                    checked={form[k]}
                    onChange={(e) => update(k, e.target.checked)}
                    className="size-4 accent-ocean"
                  />
                  {k === 'featured'
                    ? 'Destacado en portada'
                    : 'Experiencia popular'}
                </label>
              ))}
            </div>
          </>
        )}
        {tab === 1 && (
          <>
            <div className="rounded-xl bg-[#edf4f5] p-5">
              <h3 className="font-semibold">Precios por persona</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                Define ambos precios de forma independiente. El viajero puede
                elegir anticipo o pago completo.
              </p>
            </div>
            {(['MXN', 'USD'] as const).map((currency) => {
              const priceKey = currency === 'MXN' ? 'mxn' : 'usd'
              const depositKey =
                currency === 'MXN' ? 'depositMxn' : 'depositUsd'
              return (
                <fieldset
                  className="grid gap-4 rounded-xl border p-5 sm:grid-cols-2"
                  key={currency}
                >
                  <legend className="px-2 text-sm font-bold">{currency}</legend>
                  <label className="field">
                    Precio por persona ({currency})
                    <input
                      required
                      type="number"
                      min="0"
                      step="0.01"
                      value={form[priceKey]}
                      onChange={(e) => update(priceKey, Number(e.target.value))}
                    />
                  </label>
                  <label className="field">
                    Anticipo ({currency})
                    <input
                      required
                      type="number"
                      min="0"
                      max={form[priceKey]}
                      step="0.01"
                      value={form[depositKey]}
                      onChange={(e) =>
                        update(depositKey, Number(e.target.value))
                      }
                    />
                  </label>
                  <p className="text-xs text-muted-foreground sm:col-span-2">
                    Saldo por persona:{' '}
                    {Math.max(
                      0,
                      form[priceKey] - form[depositKey],
                    ).toLocaleString('es-MX')}{' '}
                    {currency}
                  </p>
                </fieldset>
              )
            })}
          </>
        )}
        {tab === 2 && (
          <>
            <label className="field">
              Descripción breve (español)
              <textarea
                maxLength={250}
                value={form.description}
                onChange={(e) => update('description', e.target.value)}
              />
              <span className="text-xs text-muted-foreground">
                {form.description.length} / 250 caracteres
              </span>
            </label>
            <label className="field">
              Itinerario y descripción completa (español)
              <textarea
                value={form.fullDescription}
                onChange={(e) => update('fullDescription', e.target.value)}
              />
            </label>
            <label className="field">
              Descripción en inglés
              <textarea
                value={form.englishDescription}
                onChange={(e) => update('englishDescription', e.target.value)}
              />
            </label>
            <div className="grid gap-4 sm:grid-cols-2">
              <label className="field">
                Qué incluye
                <textarea
                  placeholder="Un elemento por línea"
                  value={form.included}
                  onChange={(e) => update('included', e.target.value)}
                />
              </label>
              <label className="field">
                Qué no incluye
                <textarea
                  placeholder="Un elemento por línea"
                  value={form.excluded}
                  onChange={(e) => update('excluded', e.target.value)}
                />
              </label>
            </div>
            <label className="field">
              Requisitos y qué llevar
              <textarea
                placeholder="Un requisito por línea"
                value={form.requirements}
                onChange={(e) => update('requirements', e.target.value)}
              />
            </label>
            <label className="field">
              Punto de encuentro
              <textarea
                value={form.meeting}
                onChange={(e) => update('meeting', e.target.value)}
              />
            </label>
            <div>
              <h3 className="font-semibold">Galería de fotografías</h3>
              <p className="mt-2 text-xs leading-6 text-muted-foreground">
                La primera fotografía es la portada. Selecciona imágenes de
                ejemplo; la carga de archivos se conectará al almacenamiento del
                catálogo.
              </p>
              <div className="mt-4 grid grid-cols-4 gap-2">
                {photos.map((photo) => (
                  <button
                    key={photo}
                    type="button"
                    aria-label={`Seleccionar foto ${photos.indexOf(photo) + 1}`}
                    aria-pressed={form.images.includes(photo)}
                    onClick={() =>
                      update(
                        'images',
                        form.images.includes(photo)
                          ? form.images.length > 1
                            ? form.images.filter((p) => p !== photo)
                            : form.images
                          : [...form.images, photo],
                      )
                    }
                    className={`relative aspect-square overflow-hidden rounded-xl border-2 ${form.images.includes(photo) ? 'border-ocean' : 'border-transparent'}`}
                  >
                    <Image
                      src={photo}
                      alt="Fotografía de ejemplo"
                      fill
                      sizes="120px"
                      className="object-cover"
                    />
                    {form.images.includes(photo) && (
                      <span className="absolute right-1 top-1 rounded-full bg-ocean p-1 text-white">
                        <Check className="size-3" />
                      </span>
                    )}
                  </button>
                ))}
              </div>
              <p className="mt-3 flex items-center gap-2 text-xs text-ocean">
                <ImagePlus className="size-4" />
                {form.images.length} fotografías seleccionadas
              </p>
            </div>
          </>
        )}
        {tab === 3 && (
          <>
            <div className="flex gap-3 rounded-xl bg-[#edf4f5] p-5">
              <CalendarDays className="size-5 shrink-0 text-ocean" />
              <p className="text-sm leading-6">
                Las fechas y horarios se muestran en la hora de Puerto Vallarta.
                El cupo es por salida.
              </p>
            </div>
            <label className="field">
              Cupo máximo de viajeros
              <input
                required
                type="number"
                min="1"
                max="200"
                value={form.capacity}
                onChange={(e) => update('capacity', Number(e.target.value))}
              />
            </label>
            <div className="flex items-end gap-2">
              <label className="field flex-1">
                Agregar fecha
                <input
                  type="date"
                  value={date}
                  onChange={(e) => setDate(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="admin-secondary mb-1"
                disabled={!date}
                onClick={() => {
                  update('dates', [...new Set([...form.dates, date])].sort())
                  setDate('')
                }}
              >
                <Plus className="size-4" />
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.dates.map((d) => (
                <span
                  key={d}
                  className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs"
                >
                  {d}
                  <button
                    type="button"
                    aria-label={`Quitar fecha ${d}`}
                    onClick={() =>
                      update(
                        'dates',
                        form.dates.filter((v) => v !== d),
                      )
                    }
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            <div className="flex items-end gap-2">
              <label className="field flex-1">
                Agregar horario
                <input
                  type="time"
                  value={time}
                  onChange={(e) => setTime(e.target.value)}
                />
              </label>
              <button
                type="button"
                className="admin-secondary mb-1"
                disabled={!time}
                onClick={() =>
                  update('times', [...new Set([...form.times, time])].sort())
                }
              >
                <Plus className="size-4" />
                Agregar
              </button>
            </div>
            <div className="flex flex-wrap gap-2">
              {form.times.map((t) => (
                <span
                  key={t}
                  className="flex items-center gap-2 rounded-lg bg-muted px-3 py-2 text-xs"
                >
                  {t}
                  <button
                    type="button"
                    aria-label={`Quitar horario ${t}`}
                    onClick={() =>
                      update(
                        'times',
                        form.times.filter((v) => v !== t),
                      )
                    }
                  >
                    <X className="size-3" />
                  </button>
                </span>
              ))}
            </div>
            {!form.dates.length && (
              <p className="text-sm text-muted-foreground">
                Agrega una fecha para habilitar la reservación.
              </p>
            )}
          </>
        )}
      </div>
      {(validation || error) && (
        <p
          role="alert"
          className="rounded-lg bg-red-50 p-4 text-sm text-red-800"
        >
          {validation || error}
        </p>
      )}
      <div className="flex flex-wrap justify-between gap-3 border-t pt-5">
        <button
          type="button"
          className="admin-secondary"
          disabled={busy}
          onClick={onCancel}
        >
          Cancelar
        </button>
        <div className="flex gap-2">
          {tab < 3 && (
            <button
              className="admin-secondary"
              type="button"
              onClick={() => setTab(tab + 1)}
            >
              Siguiente sección
            </button>
          )}
          <button className="admin-primary" disabled={busy} type="submit">
            {busy ? 'Guardando…' : 'Guardar tour'}
          </button>
        </div>
      </div>
    </form>
  )
}
