'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import {
  ArrowDownLeft,
  ArrowRight,
  ArrowUpRight,
  CalendarDays,
  Check,
  ChevronLeft,
  ChevronRight,
  Compass,
  Download,
  ExternalLink,
  LayoutDashboard,
  LogOut,
  Mail,
  Menu,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  ShieldCheck,
  SlidersHorizontal,
  Star,
  Users,
  Wallet,
  Waves,
  X,
} from 'lucide-react'
import {
  adminSections,
  ADMIN_DEMO_STORAGE_KEY,
  money,
  statusLabels,
  type AdminRecord,
  type AdminSection,
  type WorkspaceData,
} from '@/lib/admin-workspace'
import { createClient } from '@/lib/supabase/client'
import { TOUR_CATEGORIES } from '@/lib/tours'
import { localizeCategory } from '@/lib/i18n'
import { toVallartaDate } from '@/lib/time'
import { siteConfig } from '@/lib/site'
import { AdminModal } from './modal'
import { TourEditor } from './tour-editor'
import { demoRequestBookings, readDemoContacts } from '@/lib/demo-requests'

const icons = {
  overview: LayoutDashboard,
  tours: Compass,
  bookings: CalendarDays,
  calendar: CalendarDays,
  payments: Wallet,
  payouts: ArrowUpRight,
  contacts: Users,
  operators: Waves,
  reviews: Star,
  settings: Settings,
}
const storageKey = ADMIN_DEMO_STORAGE_KEY
type Collection = keyof WorkspaceData
const editableStatuses: Record<Collection, string[]> = {
  tours: ['draft', 'published'],
  bookings: [
    'draft',
    'pending_payment',
    'confirmed',
    'completed',
    'cancelled',
    'refunded',
  ],
  payments: ['pending', 'paid', 'refunded'],
  payouts: ['pending', 'scheduled', 'paid'],
  contacts: ['new', 'contacted'],
  operators: ['active', 'inactive'],
  reviews: ['pending', 'published', 'rejected'],
}
const singular: Record<Collection, string> = {
  tours: 'tour',
  bookings: 'reservación',
  payments: 'cobro',
  payouts: 'pago',
  contacts: 'contacto',
  operators: 'operador',
  reviews: 'reseña',
}

function Badge({ status }: { status: string }) {
  return (
    <span className={`status-badge status-${status}`}>
      {statusLabels[status] ?? status}
    </span>
  )
}
function downloadRows(rows: AdminRecord[], title: string) {
  const quote = (value: unknown) =>
    `"${String(value ?? '')
      .replace(/^[=+@\-\t\r]/, "'$&")
      .replaceAll('"', '""')}"`
  const content =
    '\uFEFF' +
    [
      [
        'Nombre',
        'Descripción',
        'Estado',
        'Referencia',
        'Fecha',
        'Importe',
        'Pagado',
        'Moneda',
        'Email',
      ],
      ...rows.map((r) => [
        r.name,
        r.subtitle,
        statusLabels[r.status] ?? r.status,
        r.reference,
        r.date,
        r.amount,
        r.paid,
        r.currency,
        r.email,
      ]),
    ]
      .map((row) => row.map(quote).join(','))
      .join('\r\n')
  const url = URL.createObjectURL(
    new Blob([content], { type: 'text/csv;charset=utf-8;' }),
  )
  const a = document.createElement('a')
  a.href = url
  a.download = `eddys-${title}.csv`
  a.click()
  URL.revokeObjectURL(url)
}

export function AdminWorkspace({
  section,
  initialData,
  name,
  demo = false,
}: {
  section: AdminSection
  initialData: WorkspaceData
  name: string
  demo?: boolean
}) {
  const router = useRouter()
  const [data, setData] = useState(initialData)
  const [mobile, setMobile] = useState(false)
  const sidebarRef = useRef<HTMLElement>(null)
  const [query, setQuery] = useState('')
  const [status, setStatus] = useState('')
  const [page, setPage] = useState(1)
  const [toast, setToast] = useState('')
  const [selected, setSelected] = useState<AdminRecord | null>(null)
  const [editing, setEditing] = useState<AdminRecord | null>(null)
  const [confirmDelete, setConfirmDelete] = useState<AdminRecord | null>(null)
  const [busy, setBusy] = useState(false)
  const [formError, setFormError] = useState('')
  const [currency, setCurrency] = useState<'MXN' | 'USD'>('MXN')
  const [calendarDay, setCalendarDay] = useState(
    initialData.bookings.find((b) => b.date)?.date ??
      toVallartaDate(new Date()),
  )
  const [calendarMonth, setCalendarMonth] = useState(
    () =>
      new Date(
        `${initialData.bookings.find((b) => b.date)?.date ?? toVallartaDate(new Date())}T12:00:00`,
      ),
  )
  const [settings, setSettings] = useState({
    company: 'Eddy’s Tours',
    email: siteConfig.email,
    location: 'Puerto Vallarta, Jalisco',
    currency: 'MXN',
    notify: true,
  })
  const base = demo ? '/admin/demo' : '/admin'
  const current = adminSections.find((s) => s.id === section)!
  const collection: Collection =
    section === 'overview' || section === 'calendar' || section === 'settings'
      ? 'bookings'
      : section

  useEffect(() => {
    if (!demo) return
    const restore = () => {
      let restored = initialData
      try {
        const raw = localStorage.getItem(storageKey)
        if (raw) {
          const stored = JSON.parse(raw)
          if (
            Object.keys(initialData).every(
              (k) =>
                Array.isArray(stored[k]) &&
                stored[k].every(
                  (r: AdminRecord) =>
                    typeof r.id === 'string' && typeof r.name === 'string',
                ),
            )
          )
            restored = stored
        }
        const prefs = localStorage.getItem(`${storageKey}.settings`)
        if (prefs) {
          const value = JSON.parse(prefs)
          if (
            typeof value.company === 'string' &&
            typeof value.email === 'string'
          )
            setSettings(value)
        }
      } catch {
        /* An invalid demo snapshot falls back to the supplied sample. */
      }
      const requests = demoRequestBookings()
      const mergedBookings = [
        ...new Map(
          [...requests, ...restored.bookings].map((r) => [r.id, r]),
        ).values(),
      ]
      const requestPayments = requests.map((r) => ({
        ...r,
        id: `payment-${r.id}`,
        status: 'pending',
      }))
      setData({
        ...restored,
        bookings: mergedBookings,
        payments: [
          ...new Map(
            [...requestPayments, ...restored.payments].map((r) => [r.id, r]),
          ).values(),
        ],
        contacts: [
          ...new Map(
            [
              ...readDemoContacts(),
              ...requests.map((r) => ({
                ...r,
                id: r.email ?? r.id,
                status: 'new',
              })),
              ...restored.contacts,
            ].map((r) => [r.id, r]),
          ).values(),
        ],
      })
    }
    const timer = window.setTimeout(restore, 0)
    window.addEventListener('demo-requests-change', restore)
    return () => {
      window.clearTimeout(timer)
      window.removeEventListener('demo-requests-change', restore)
    }
  }, [demo, initialData])
  useEffect(() => {
    if (!toast) return
    const timer = setTimeout(() => setToast(''), 5000)
    return () => clearTimeout(timer)
  }, [toast])

  useEffect(() => {
    if (!mobile) return
    const previousFocus = document.activeElement as HTMLElement | null
    const previousOverflow = document.body.style.overflow
    document.body.style.overflow = 'hidden'
    const links = () =>
      Array.from(
        sidebarRef.current?.querySelectorAll<HTMLElement>('a, button') ?? [],
      ).filter((el) => el.offsetParent !== null)
    links()[0]?.focus()
    function onKey(event: KeyboardEvent) {
      if (event.key === 'Escape') setMobile(false)
      if (event.key !== 'Tab') return
      const controls = links()
      if (event.shiftKey && document.activeElement === controls[0]) {
        event.preventDefault()
        controls.at(-1)?.focus()
      } else if (
        !event.shiftKey &&
        document.activeElement === controls.at(-1)
      ) {
        event.preventDefault()
        controls[0]?.focus()
      }
    }
    const media = window.matchMedia('(min-width: 1024px)')
    const onResize = () => {
      if (media.matches) setMobile(false)
    }
    media.addEventListener('change', onResize)
    document.addEventListener('keydown', onKey)
    return () => {
      document.body.style.overflow = previousOverflow
      document.removeEventListener('keydown', onKey)
      media.removeEventListener('change', onResize)
      previousFocus?.focus()
    }
  }, [mobile])

  function commit(next: WorkspaceData) {
    setData(next)
    if (demo) {
      try {
        localStorage.setItem(storageKey, JSON.stringify(next))
      } catch {
        setToast(
          'Cambio aplicado en esta vista. El navegador no permite guardarlo.',
        )
      }
    }
  }
  const filtered = data[collection].filter(
    (r) =>
      (!status || r.status === status) &&
      `${r.name} ${r.subtitle} ${r.reference ?? ''} ${r.email ?? ''}`
        .toLowerCase()
        .includes(query.toLowerCase()),
  )
  const visible = filtered.slice((page - 1) * 8, page * 8)
  const finance = data.payments.filter(
    (p) =>
      p.currency === currency && !['cancelled', 'refunded'].includes(p.status),
  )
  const paid = finance.reduce((sum, b) => sum + (b.paid ?? 0), 0)
  const due = finance.reduce(
    (sum, b) => sum + Math.max(0, (b.amount ?? 0) - (b.paid ?? 0)),
    0,
  )
  const today = toVallartaDate(new Date())
  const upcoming = data.bookings
    .filter(
      (b) =>
        (b.date ?? '') >= today &&
        !['cancelled', 'refunded', 'completed'].includes(b.status),
    )
    .sort((a, b) => `${a.date}${a.time}`.localeCompare(`${b.date}${b.time}`))

  async function saveRecord(record: AdminRecord) {
    if (demo && collection === 'tours' && data.tours.some(t => t.id !== record.id && t.slug === record.slug)) { setFormError('Ya existe un tour con ese enlace. Elige uno diferente.'); return }
    if (demo && collection === 'payments' && record.status === 'paid')
      record = { ...record, paid: record.amount }
    if (demo && collection === 'payments' && record.status === 'refunded')
      record = { ...record, paid: 0 }
    setBusy(true)
    setFormError('')
    try {
      if (!demo) {
        if (!['tours', 'bookings', 'reviews'].includes(collection))
          throw new Error(
            'Esta acción estará disponible cuando se conecte la gestión de este módulo.',
          )
        const id =
          collection === 'bookings' ? (record.note ?? record.id) : record.id
        const body =
          collection === 'tours'
            ? {
                published: record.status === 'published',
                featured: Boolean(record.featured),
                popular: Boolean(record.popular),
              }
            : { status: record.status }
        const response = await fetch(
          `/api/admin/${collection}/${encodeURIComponent(id)}`,
          {
            method: 'PATCH',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(body),
          },
        )
        if (!response.ok)
          throw new Error(
            response.status === 401
              ? 'Tu sesión venció. Vuelve a iniciar sesión.'
              : 'No se pudo guardar el cambio. Revisa el estado e intenta de nuevo.',
          )
      }
      const next = {
        ...data,
        [collection]: data[collection].some((r) => r.id === record.id)
          ? data[collection].map((r) => (r.id === record.id ? record : r))
          : [record, ...data[collection]],
      }
      if (collection === 'bookings') {
        const relatedBooking = (r: AdminRecord) =>
          r.reference === record.reference
        next.bookings = next.bookings.map((r) =>
          relatedBooking(r)
            ? { ...r, status: record.status, paid: record.paid }
            : r,
        )
        const payment = {
          ...record,
          id: `payment-${record.id}`,
          status: ['cancelled', 'refunded'].includes(record.status)
            ? record.status
            : (record.paid ?? 0) >= (record.amount ?? 0)
              ? 'paid'
              : 'pending',
        }
        next.payments = next.payments.some(relatedBooking)
          ? next.payments.map((r) =>
              relatedBooking(r) ? { ...payment, id: r.id } : r,
            )
          : [...next.payments, payment]
      }
      if (demo && collection === 'payments') {
        next.bookings = next.bookings.map((r) =>
          r.reference === record.reference ? { ...r, paid: record.paid } : r,
        )
      }
      commit(next)
      setEditing(null)
      setSelected(null)
      setPage(1)
      setToast(
        demo ? 'Cambios guardados en la demostración.' : 'Cambios guardados.',
      )
    } catch (error) {
      setFormError(
        error instanceof Error
          ? error.message
          : 'No se pudo guardar el cambio.',
      )
    } finally {
      setBusy(false)
    }
  }
  function addNew() {
    setFormError('')
    setEditing({
      id: `demo-${crypto.randomUUID()}`,
      name: '',
      subtitle: '',
      status: editableStatuses[collection][0] ?? 'draft',
      currency: 'MXN',
      category: 'Adventure',
      location: 'Puerto Vallarta',
      quantity: 2,
      amount: 0,
      paid: 0,
      price: 0,
      image: collection === 'tours' ? '/images/tour-atv.webp' : undefined,
      date: collection === 'tours' ? undefined : today,
    })
  }

  function recordTable(rows: AdminRecord[], compact = false) {
    return (
      <div className="overflow-x-auto">
        <table className="admin-table">
          <thead>
            <tr>
              <th>
                {collection === 'tours' && !compact
                  ? 'Experiencia'
                  : collection === 'contacts'
                    ? 'Contacto'
                    : collection === 'operators'
                      ? 'Operador'
                      : 'Viajero / concepto'}
              </th>
              {!compact && (
                <th>
                  {collection === 'tours' ? 'Destino' : 'Referencia / fecha'}
                </th>
              )}
              <th>Estado</th>
              {!['contacts', 'operators'].includes(collection) && (
                <th>
                  {collection === 'tours' && !compact
                    ? 'Precio desde'
                    : 'Importe'}
                </th>
              )}
              <th>
                <span className="sr-only">Acciones</span>
              </th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id}>
                <td>
                  <button
                    className="flex items-center gap-3 text-left"
                    onClick={() => {
                      setSelected(r)
                      setFormError('')
                    }}
                  >
                    {r.image ? (
                      <Image
                        src={r.image}
                        alt=""
                        width={52}
                        height={52}
                        className="size-13 rounded-lg object-cover"
                      />
                    ) : (
                      <span className="grid size-10 shrink-0 place-items-center rounded-full bg-[#eaf1f3] text-xs font-semibold text-ocean">
                        {r.name
                          .split(' ')
                          .map((s) => s[0])
                          .slice(0, 2)
                          .join('')}
                      </span>
                    )}
                    <span>
                      <strong className="block max-w-[270px] font-semibold">
                        {r.name}
                      </strong>
                      <span className="mt-1 block max-w-[270px] truncate text-xs text-muted-foreground">
                        {r.subtitle}
                      </span>
                    </span>
                  </button>
                </td>
                {!compact && (
                  <td>
                    <span className="block">
                      {collection === 'tours'
                        ? r.location
                        : (r.reference ?? r.email ?? '—')}
                    </span>
                    <span className="mt-1 block text-xs text-muted-foreground">
                      {r.date ?? r.category ?? ''}
                    </span>
                  </td>
                )}
                <td>
                  <Badge status={r.status} />
                </td>
                {!['contacts', 'operators'].includes(collection) && (
                  <td className="whitespace-nowrap font-semibold">
                    {collection === 'tours' && !compact
                      ? r.price != null
                        ? money(r.price)
                        : 'Ver catálogo'
                      : money(r.amount, r.currency)}
                  </td>
                )}
                <td>
                  <button
                    aria-label={`Ver detalles de ${r.name}`}
                    onClick={() => {
                      setSelected(r)
                      setFormError('')
                    }}
                    className="rounded-lg p-2 hover:bg-muted"
                  >
                    <MoreHorizontal className="size-5" />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )
  }

  return (
    <div className="admin-app">
      {mobile && (
        <button
          aria-label="Cerrar navegación"
          className="fixed inset-0 z-50 bg-black/40 lg:hidden"
          onClick={() => setMobile(false)}
        />
      )}
      <aside
        ref={sidebarRef}
        role={mobile ? 'dialog' : undefined}
        aria-modal={mobile || undefined}
        aria-label={mobile ? 'Menú de administración' : undefined}
        className={`admin-sidebar ${mobile ? 'is-open' : ''}`}
      >
        <button
          className="absolute right-3 top-2 rounded-full p-2 text-white lg:hidden"
          aria-label="Cerrar menú"
          onClick={() => setMobile(false)}
        >
          <X className="size-4" />
        </button>
        <Link
          href={`${base}/overview`}
          className="flex items-center gap-3 px-5 pb-8 pt-7"
        >
          <span className="grid size-10 place-items-center rounded-xl bg-[#82c7c7] text-[#163f48]">
            <Waves className="size-6" />
          </span>
          <span className="text-xl font-bold tracking-tight text-white">
            Eddy’s Tours
            <span className="mt-0.5 block text-[11px] font-normal tracking-normal text-white/55">
              Espacio de trabajo
            </span>
          </span>
        </Link>
        <div className="mb-4 px-5 text-xs text-white/45">Operación</div>
        <nav aria-label="Administración" className="flex-1 space-y-1 px-3">
          {adminSections.map(({ id, title }) => {
            const Icon = icons[id]
            const count =
              id === 'reviews'
                ? data.reviews.filter((r) => r.status === 'pending').length
                : 0
            return (
              <Link
                key={id}
                href={`${base}/${id}`}
                aria-current={section === id ? 'page' : undefined}
                onClick={() => setMobile(false)}
                className={`admin-nav-item ${section === id ? 'active' : ''}`}
              >
                <Icon className="size-[18px]" />
                <span>{title}</span>
                {count > 0 && (
                  <span className="ml-auto rounded-md bg-white/15 px-1.5 text-xs">
                    {count}
                  </span>
                )}
              </Link>
            )
          })}
        </nav>
        <div className="m-4 rounded-xl border border-white/15 p-4">
          <span className="flex items-center gap-2 text-sm text-white">
            <span className="size-2 rounded-full bg-[#8cc8a6]" />
            {demo ? 'Espacio de demostración' : 'Sesión protegida'}
          </span>
          <p className="mt-2 text-xs leading-5 text-white/50">
            {demo
              ? 'Explora y prueba los flujos con datos de ejemplo.'
              : 'Solo el equipo autorizado tiene acceso a esta información.'}
          </p>
        </div>
        <Link
          href="/"
          className="flex items-center gap-3 border-t border-white/10 px-6 py-5 text-sm text-white/65"
        >
          <ExternalLink className="size-4" />
          Ver sitio web
        </Link>
      </aside>
      <div className="admin-main" inert={mobile}>
        <header className="admin-topbar">
          <div className="flex items-center gap-3">
            <button
              className="rounded-lg p-2 lg:hidden"
              aria-label="Abrir navegación"
              onClick={() => setMobile(true)}
            >
              <Menu className="size-5" />
            </button>
            <span className="text-sm text-muted-foreground">
              Administración <span className="mx-2 text-border">/</span>{' '}
              <span className="text-foreground">{current.title}</span>
            </span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/help"
              className="hidden text-xs text-muted-foreground md:block"
            >
              Centro de ayuda
            </Link>
            <span className="hidden h-6 w-px bg-border sm:block" />
            <div className="flex items-center gap-2">
              <span className="grid size-9 place-items-center rounded-full bg-[#dfebeb] text-xs font-bold text-ocean">
                {name
                  .split(' ')
                  .map((s) => s[0])
                  .slice(0, 2)
                  .join('')}
              </span>
              <span className="hidden text-xs sm:block">
                <strong className="block font-semibold">{name}</strong>
                <span className="text-muted-foreground">
                  {demo ? 'Demostración' : 'Administrador'}
                </span>
              </span>
            </div>
            <button
              aria-label={demo ? 'Salir de demostración' : 'Cerrar sesión'}
              onClick={async () => {
                try {
                  if (!demo) {
                    const { error } = await createClient().auth.signOut()
                    if (error) throw error
                  }
                  router.replace('/admin/login')
                  router.refresh()
                } catch {
                  setToast('No pudimos cerrar la sesión. Intenta nuevamente.')
                }
              }}
              className="rounded-lg p-2 hover:bg-muted"
            >
              <LogOut className="size-4 text-muted-foreground" />
            </button>
          </div>
        </header>
        {demo && (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-[#d9e8e7] bg-[#eaf3f1] px-6 py-2.5 text-xs text-[#38655b]">
            <span className="flex items-center gap-2">
              <ShieldCheck className="size-3.5" />
              Demostración · Datos ficticios. Los cambios solo se guardan en
              este navegador.
            </span>
            <button
              className="font-semibold underline underline-offset-2"
              onClick={() =>
                setConfirmDelete({
                  id: 'reset-demo',
                  name: 'Restablecer demostración',
                  subtitle: '',
                  status: '',
                })
              }
            >
              Restablecer datos
            </button>
          </div>
        )}
        <main id="main" className="admin-content">
          <div className="mb-8 flex flex-wrap items-start justify-between gap-5">
            <div>
              <p className="mb-2 text-sm text-muted-foreground">
                {section === 'overview'
                  ? 'Todo listo para un nuevo día en la bahía'
                  : 'Eddy’s Tours'}
              </p>
              <h1 className="text-3xl font-bold tracking-tight md:text-[36px]">
                {section === 'overview'
                  ? 'Una gran experiencia empieza aquí.'
                  : current.title}
              </h1>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-muted-foreground">
                {current.description}
              </p>
            </div>
            <div className="flex flex-wrap gap-2">
              {section === 'overview' ? (
                <Link href={`${base}/bookings`} className="admin-primary">
                  <CalendarDays className="size-4" />
                  Ver reservaciones
                </Link>
              ) : (
                !['settings', 'calendar'].includes(section) && (
                  <>
                    <button
                      className="admin-secondary"
                      onClick={() => {
                        downloadRows(filtered, section)
                        setToast('Archivo exportado.')
                      }}
                    >
                      <Download className="size-4" />
                      Exportar
                    </button>
                    {demo && !['reviews', 'payments'].includes(section) && (
                      <button onClick={addNew} className="admin-primary">
                        <Plus className="size-4" />
                        {collection === 'tours'
                          ? 'Crear tour'
                          : `Agregar ${singular[collection]}`}
                      </button>
                    )}
                  </>
                )
              )}
            </div>
          </div>
          {!demo && (
            <div className="mb-6 rounded-xl border bg-white px-5 py-3 text-xs leading-6 text-muted-foreground">
              Vista de los 100 registros más recientes por módulo. Tours,
              estados de reservación y moderación de reseñas se guardan en la
              operación. Los cobros muestran importes registrados por reserva;
              pagos a operadores y configuración están pendientes de conexión.
            </div>
          )}

          {section === 'overview' && (
            <>
              <div className="mb-4 flex justify-end">
                <label className="flex items-center gap-2 text-xs text-muted-foreground">
                  Moneda de los importes
                  <select
                    aria-label="Moneda de los importes"
                    value={currency}
                    onChange={(e) =>
                      setCurrency(e.target.value as 'MXN' | 'USD')
                    }
                    className="rounded-md border bg-white p-2"
                  >
                    <option>MXN</option>
                    <option>USD</option>
                  </select>
                </label>
              </div>
              <div className="admin-stats">
                {[
                  {
                    label: 'Reservaciones',
                    value: new Set(
                      data.bookings.map((b) => b.reference ?? b.id),
                    ).size,
                    detail: `${upcoming.length} experiencias próximas`,
                    icon: CalendarDays,
                  },
                  {
                    label: 'Cobrado',
                    value: money(paid, currency).replace(' ' + currency, ''),
                    detail: 'Pagos registrados en las reservas',
                    icon: ArrowDownLeft,
                  },
                  {
                    label: 'Saldo por cobrar',
                    value: money(due, currency).replace(' ' + currency, ''),
                    detail: `${finance.filter((b) => b.status === 'pending').length} reservaciones con saldo`,
                    icon: Wallet,
                  },
                  {
                    label: 'Tours publicados',
                    value: data.tours.filter((t) => t.status === 'published')
                      .length,
                    detail: `${data.operators.length} operadores en el catálogo`,
                    icon: Compass,
                  },
                ].map(({ label, value, detail, icon: Icon }) => (
                  <div key={label} className="admin-stat">
                    <div className="flex items-center justify-between gap-3">
                      <p className="text-sm text-muted-foreground">{label}</p>
                      <Icon className="size-5 text-ocean" />
                    </div>
                    <strong className="mt-5 block text-[clamp(1.25rem,2vw,1.9rem)] font-bold tracking-tight">
                      {value}
                    </strong>
                    <p className="mt-3 text-xs text-muted-foreground">
                      {detail}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-7 grid gap-6 xl:grid-cols-[1.6fr_1fr]">
                <section className="admin-panel">
                  <div className="admin-panel-heading">
                    <div>
                      <h2>Próximas aventuras</h2>
                      <p>Salidas por atender en los siguientes días</p>
                    </div>
                    <Link
                      href={`${base}/calendar`}
                      className="text-xs font-semibold text-ocean"
                    >
                      Ver calendario
                    </Link>
                  </div>
                  <div className="px-6">
                    {upcoming.slice(0, 4).map((b) => (
                      <Link
                        href={`${base}/bookings`}
                        key={b.id}
                        className="flex items-center gap-4 border-t py-5"
                      >
                        <div className="grid size-12 shrink-0 place-items-center rounded-xl bg-[#edf3f4] text-ocean">
                          <span className="text-center text-xs">
                            <strong className="block text-lg leading-5">
                              {b.date?.slice(8)}
                            </strong>
                            {new Date(`${b.date}T12:00:00`).toLocaleDateString(
                              'es-MX',
                              { month: 'short' },
                            )}
                          </span>
                        </div>
                        <div className="min-w-0 flex-1">
                          <strong className="block truncate text-sm">
                            {b.subtitle}
                          </strong>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {b.time} · {b.quantity} viajeros · {b.name}
                          </p>
                        </div>
                        <ChevronRight className="size-4 text-muted-foreground" />
                      </Link>
                    ))}
                    {!upcoming.length && (
                      <p className="py-10 text-sm text-muted-foreground">
                        No hay salidas próximas en las reservaciones cargadas.
                      </p>
                    )}
                  </div>
                </section>
                <section className="overflow-hidden rounded-2xl bg-[#174954] text-white">
                  <div className="relative h-36">
                    <Image
                      src="/images/dest-yelapa.webp"
                      alt="Costa de Yelapa"
                      fill
                      sizes="400px"
                      className="object-cover"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-[#174954] to-transparent" />
                  </div>
                  <div className="px-7 pb-7">
                    <p className="text-xs text-[#a9d7d3]">
                      Tu atención hace la diferencia
                    </p>
                    <h2 className="mt-3 text-2xl font-semibold">
                      Pequeños detalles.
                      <br />
                      Grandes recuerdos.
                    </h2>
                    <div className="mt-6 space-y-3">
                      <Link
                        className="flex items-center justify-between rounded-lg border border-white/20 p-3 text-sm"
                        href={`${base}/bookings`}
                      >
                        Reservaciones por cobrar{' '}
                        <span>
                          {
                            data.bookings.filter(
                              (b) => b.status === 'pending_payment',
                            ).length
                          }
                        </span>
                      </Link>
                      <Link
                        className="flex items-center justify-between rounded-lg border border-white/20 p-3 text-sm"
                        href={`${base}/reviews`}
                      >
                        Reseñas por revisar{' '}
                        <span>
                          {
                            data.reviews.filter((r) => r.status === 'pending')
                              .length
                          }
                        </span>
                      </Link>
                    </div>
                  </div>
                </section>
              </div>
              <section className="admin-panel mt-7">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Reservaciones recientes</h2>
                    <p>
                      Los viajeros que están planeando su próxima experiencia
                    </p>
                  </div>
                  <Link
                    href={`${base}/bookings`}
                    className="text-xs font-semibold text-ocean"
                  >
                    Ver todas
                  </Link>
                </div>
                {recordTable(data.bookings.slice(0, 5), true)}
              </section>
            </>
          )}

          {section === 'calendar' && (
            <div className="grid items-start gap-6 xl:grid-cols-[1.6fr_1fr]">
              <section className="admin-panel p-5 sm:p-7">
                <div className="mb-7 flex items-center justify-between">
                  <h2 className="text-lg font-bold capitalize">
                    {calendarMonth.toLocaleDateString('es-MX', {
                      month: 'long',
                      year: 'numeric',
                    })}
                  </h2>
                  <div className="flex gap-2">
                    <button
                      className="admin-icon-button"
                      aria-label="Mes anterior"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() - 1,
                            1,
                          ),
                        )
                      }
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <button
                      className="admin-secondary"
                      onClick={() => {
                        setCalendarMonth(new Date(`${today}T12:00:00`))
                        setCalendarDay(today)
                      }}
                    >
                      Hoy
                    </button>
                    <button
                      className="admin-icon-button"
                      aria-label="Mes siguiente"
                      onClick={() =>
                        setCalendarMonth(
                          new Date(
                            calendarMonth.getFullYear(),
                            calendarMonth.getMonth() + 1,
                            1,
                          ),
                        )
                      }
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
                <div className="grid grid-cols-7 text-center text-xs text-muted-foreground">
                  {['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(
                    (d) => (
                      <span className="py-3" key={d}>
                        {d}
                      </span>
                    ),
                  )}
                </div>
                <div className="grid grid-cols-7 overflow-hidden rounded-xl border">
                  {Array.from({ length: 42 }, (_, index) => {
                    const first = new Date(
                      calendarMonth.getFullYear(),
                      calendarMonth.getMonth(),
                      1,
                    )
                    const date = new Date(
                      first.getFullYear(),
                      first.getMonth(),
                      index - ((first.getDay() + 6) % 7) + 1,
                    )
                    const iso = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`
                    const departures = data.bookings.filter(
                      (b) =>
                        b.date === iso &&
                        !['cancelled', 'refunded'].includes(b.status),
                    )
                    return (
                      <button
                        key={iso}
                        aria-label={`${iso}, ${departures.length} reservaciones`}
                        aria-pressed={calendarDay === iso}
                        onClick={() => setCalendarDay(iso)}
                        className={`min-h-20 border-b border-r p-2 text-left sm:min-h-24 ${calendarDay === iso ? 'bg-[#dceceb] ring-2 ring-inset ring-ocean' : 'hover:bg-muted'} ${date.getMonth() !== calendarMonth.getMonth() ? 'text-slate-300' : ''}`}
                      >
                        <span
                          className={`inline-grid size-6 place-items-center text-xs ${iso === today ? 'rounded-full bg-ocean text-white' : ''}`}
                        >
                          {date.getDate()}
                        </span>
                        {departures.length > 0 && (
                          <span className="mt-3 block rounded-md bg-ocean/10 p-1 text-center text-[10px] font-semibold text-ocean">
                            {departures.length}
                            <span className="hidden sm:inline"> salidas</span>
                          </span>
                        )}
                      </button>
                    )
                  })}
                </div>
                <p className="mt-5 text-xs text-muted-foreground">
                  Horarios locales de Puerto Vallarta. Se muestran las salidas
                  de las reservaciones cargadas.
                </p>
              </section>
              <section className="admin-panel">
                <div className="admin-panel-heading">
                  <div>
                    <h2>Agenda del día</h2>
                    <p>
                      {new Date(`${calendarDay}T12:00:00`).toLocaleDateString(
                        'es-MX',
                        { weekday: 'long', day: 'numeric', month: 'long' },
                      )}
                    </p>
                  </div>
                  <CalendarDays className="size-5 text-ocean" />
                </div>
                <div className="px-6 pb-6">
                  {data.bookings
                    .filter(
                      (b) =>
                        b.date === calendarDay &&
                        !['cancelled', 'refunded'].includes(b.status),
                    )
                    .map((b) => (
                      <button
                        key={b.id}
                        className="mt-3 w-full rounded-xl border-l-4 border-ocean bg-[#f0f5f5] p-4 text-left"
                        onClick={() => setSelected(b)}
                      >
                        <span className="text-xs font-semibold text-ocean">
                          {b.time}
                        </span>
                        <strong className="mt-2 block text-sm">
                          {b.subtitle}
                        </strong>
                        <p className="mt-2 text-xs text-muted-foreground">
                          {b.quantity} viajeros · {b.name}
                        </p>
                        <div className="mt-3">
                          <Badge status={b.status} />
                        </div>
                      </button>
                    ))}
                  {!data.bookings.some(
                    (b) =>
                      b.date === calendarDay &&
                      !['cancelled', 'refunded'].includes(b.status),
                  ) && (
                    <div className="py-10 text-center">
                      <CalendarDays className="mx-auto mb-4 size-8 text-muted-foreground" />
                      <p className="text-sm text-muted-foreground">
                        Un día sin salidas programadas.
                      </p>
                      <Link
                        className="mt-4 inline-block text-sm text-ocean"
                        href={`${base}/bookings`}
                      >
                        Ver reservaciones
                      </Link>
                    </div>
                  )}
                </div>
              </section>
            </div>
          )}

          {!['overview', 'calendar', 'settings'].includes(section) && (
            <>
              {['payments', 'payouts'].includes(section) && (
                <div className="mb-6 grid gap-4 sm:grid-cols-3">
                  {(section === 'payments'
                    ? [
                        [
                          'Cobrado (MXN)',
                          data.payments
                            .filter((p) => p.currency === 'MXN')
                            .reduce((s, p) => s + (p.paid ?? 0), 0),
                        ],
                        [
                          'Pendiente (MXN)',
                          data.payments
                            .filter((p) => p.currency === 'MXN')
                            .reduce(
                              (s, p) =>
                                s +
                                Math.max(0, (p.amount ?? 0) - (p.paid ?? 0)),
                              0,
                            ),
                        ],
                        [
                          'Cobrado (USD)',
                          data.payments
                            .filter((p) => p.currency === 'USD')
                            .reduce((s, p) => s + (p.paid ?? 0), 0),
                        ],
                      ]
                    : [
                        [
                          'Pendiente (MXN)',
                          data.payouts
                            .filter(
                              (p) =>
                                p.status !== 'paid' && p.currency === 'MXN',
                            )
                            .reduce((s, p) => s + (p.amount ?? 0), 0),
                        ],
                        [
                          'Pagado (MXN)',
                          data.payouts
                            .filter(
                              (p) =>
                                p.status === 'paid' && p.currency === 'MXN',
                            )
                            .reduce((s, p) => s + (p.amount ?? 0), 0),
                        ],
                        [
                          'Pendiente (USD)',
                          data.payouts
                            .filter(
                              (p) =>
                                p.status !== 'paid' && p.currency === 'USD',
                            )
                            .reduce((s, p) => s + (p.amount ?? 0), 0),
                        ],
                      ]
                  ).map(([title, value]) => (
                    <div key={String(title)} className="admin-stat">
                      <p className="text-sm text-muted-foreground">{title}</p>
                      <strong className="mt-3 block text-2xl">
                        {money(
                          Number(value),
                          String(title).includes('USD') ? 'USD' : 'MXN',
                        )}
                      </strong>
                    </div>
                  ))}
                </div>
              )}
              <section className="admin-panel">
                <div className="flex flex-wrap items-center justify-between gap-4 border-b p-5">
                  <div className="flex flex-wrap items-center gap-2">
                    {['', ...editableStatuses[collection]].map((s) => (
                      <button
                        key={s}
                        onClick={() => {
                          setStatus(s)
                          setPage(1)
                        }}
                        aria-pressed={status === s}
                        className={`rounded-lg px-3 py-2 text-xs font-semibold ${status === s ? 'bg-[#e6efef] text-ocean' : 'text-muted-foreground hover:bg-muted'}`}
                      >
                        {s ? statusLabels[s] : 'Todos'}
                        <span className="ml-2 text-[10px] opacity-65">
                          {s
                            ? data[collection].filter((r) => r.status === s)
                                .length
                            : data[collection].length}
                        </span>
                      </button>
                    ))}
                  </div>
                  <span className="flex items-center gap-2 rounded-lg border px-3">
                    <Search className="size-4 text-muted-foreground" />
                    <input
                      type="search"
                      aria-label={`Buscar ${current.title.toLowerCase()}`}
                      placeholder="Buscar por nombre, referencia…"
                      value={query}
                      onChange={(e) => {
                        setQuery(e.target.value)
                        setPage(1)
                      }}
                      className="h-10 min-w-0 max-w-52 bg-transparent text-xs outline-none"
                    />
                  </span>
                </div>
                {visible.length ? (
                  section === 'reviews' ? (
                    <div className="grid gap-5 p-6 md:grid-cols-2">
                      {visible.map((r) => (
                        <article key={r.id} className="rounded-xl border p-5">
                          <div className="flex items-center justify-between gap-3">
                            <div
                              className="flex gap-0.5 text-[#c28c33]"
                              aria-label={`${r.rating} de 5 estrellas`}
                            >
                              {Array.from({ length: r.rating ?? 5 }, (_, i) => (
                                <Star key={i} className="size-4 fill-current" />
                              ))}
                            </div>
                            <Badge status={r.status} />
                          </div>
                          <p className="mt-5 text-sm leading-7">
                            “{r.description}”
                          </p>
                          <p className="mt-5 text-sm font-semibold">{r.name}</p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            {r.subtitle}
                          </p>
                          <div className="mt-5 flex gap-2">
                            <button
                              className="admin-secondary"
                              onClick={() => {
                                setEditing(r)
                                setFormError('')
                              }}
                            >
                              Revisar reseña
                            </button>
                          </div>
                        </article>
                      ))}
                    </div>
                  ) : (
                    recordTable(visible)
                  )
                ) : (
                  <div className="px-6 py-16 text-center">
                    <SlidersHorizontal className="mx-auto size-9 text-ocean" />
                    <h2 className="mt-5 text-xl font-bold">
                      {query || status
                        ? 'No hay resultados para estos filtros'
                        : 'Todo listo para empezar'}
                    </h2>
                    <p className="mx-auto mt-3 max-w-md text-sm leading-6 text-muted-foreground">
                      {query || status
                        ? 'Prueba otro nombre o consulta todos los estados.'
                        : section === 'payouts' && !demo
                          ? 'Los pagos a operadores aparecerán aquí cuando se conecte este módulo.'
                          : 'Los registros aparecerán aquí conforme avance tu operación.'}
                    </p>
                    {(query || status) && (
                      <button
                        className="admin-secondary mt-5"
                        onClick={() => {
                          setQuery('')
                          setStatus('')
                          setPage(1)
                        }}
                      >
                        Limpiar filtros
                      </button>
                    )}
                    {demo && !query && !status && (
                      <button onClick={addNew} className="admin-primary mt-5">
                        Agregar {singular[collection]}
                      </button>
                    )}
                  </div>
                )}
                <div className="flex items-center justify-between gap-4 border-t px-6 py-4">
                  <p role="status" className="text-xs text-muted-foreground">
                    {filtered.length
                      ? `${(page - 1) * 8 + 1}–${Math.min(page * 8, filtered.length)} de ${filtered.length}`
                      : '0 registros'}
                  </p>
                  <div className="flex items-center gap-3 text-xs">
                    <button
                      className="admin-icon-button"
                      aria-label="Página anterior"
                      disabled={page === 1}
                      onClick={() => setPage(page - 1)}
                    >
                      <ChevronLeft className="size-4" />
                    </button>
                    <span>
                      {page} / {Math.max(1, Math.ceil(filtered.length / 8))}
                    </span>
                    <button
                      className="admin-icon-button"
                      aria-label="Página siguiente"
                      disabled={page * 8 >= filtered.length}
                      onClick={() => setPage(page + 1)}
                    >
                      <ChevronRight className="size-4" />
                    </button>
                  </div>
                </div>
              </section>
            </>
          )}

          {section === 'settings' && (
            <div className="grid items-start gap-6 lg:grid-cols-[1.4fr_1fr]">
              <form
                className="admin-panel p-7"
                onSubmit={(e) => {
                  e.preventDefault()
                  if (!demo) {
                    setToast(
                      'La edición de configuración aún no está conectada.',
                    )
                    return
                  }
                  try {
                    localStorage.setItem(
                      `${storageKey}.settings`,
                      JSON.stringify(settings),
                    )
                    setToast('Preferencias guardadas en la demostración.')
                  } catch {
                    setToast(
                      'El navegador no permite guardar las preferencias.',
                    )
                  }
                }}
              >
                <h2 className="text-xl font-bold">Información del negocio</h2>
                <p className="mt-2 text-sm text-muted-foreground">
                  Los datos de contacto de tu equipo.
                </p>
                <div className="mt-7 space-y-5">
                  <label className="field">
                    Nombre comercial
                    <input
                      required
                      value={settings.company}
                      onChange={(e) =>
                        setSettings({ ...settings, company: e.target.value })
                      }
                      disabled={!demo}
                    />
                  </label>
                  <label className="field">
                    Correo de contacto
                    <input
                      type="email"
                      required
                      value={settings.email}
                      onChange={(e) =>
                        setSettings({ ...settings, email: e.target.value })
                      }
                      disabled={!demo}
                    />
                  </label>
                  <label className="field">
                    Ubicación
                    <input
                      required
                      value={settings.location}
                      onChange={(e) =>
                        setSettings({ ...settings, location: e.target.value })
                      }
                      disabled={!demo}
                    />
                  </label>
                  <label className="field">
                    Moneda predeterminada
                    <select
                      value={settings.currency}
                      onChange={(e) =>
                        setSettings({ ...settings, currency: e.target.value })
                      }
                      disabled={!demo}
                    >
                      <option>MXN</option>
                      <option>USD</option>
                    </select>
                  </label>
                  <label className="flex items-start gap-3 border-t pt-5 text-sm">
                    <input
                      type="checkbox"
                      className="mt-1 size-4 accent-ocean"
                      checked={settings.notify}
                      onChange={(e) =>
                        setSettings({ ...settings, notify: e.target.checked })
                      }
                      disabled={!demo}
                    />
                    <span>
                      Notificaciones de reservaciones
                      <span className="mt-1 block text-xs leading-5 text-muted-foreground">
                        Preferencia de demostración para avisos de nuevas
                        solicitudes.
                      </span>
                    </span>
                  </label>
                  <button disabled={!demo} className="admin-primary">
                    <Check className="size-4" />
                    Guardar cambios
                  </button>
                </div>
              </form>
              <div className="space-y-6">
                <section className="admin-panel p-7">
                  <ShieldCheck className="size-7 text-ocean" />
                  <h2 className="mt-4 text-xl font-bold">Acceso y seguridad</h2>
                  <p className="mt-3 text-sm leading-7 text-muted-foreground">
                    El acceso a la operación requiere una cuenta con permisos de
                    administrador. La demostración está separada de la
                    información real.
                  </p>
                  <Link href="/admin/login" className="admin-secondary mt-5">
                    Gestionar mi acceso
                    <ArrowRight className="size-4" />
                  </Link>
                </section>
                <section className="admin-panel p-7">
                  <h2 className="text-lg font-bold">Zona horaria</h2>
                  <p className="mt-3 text-sm text-muted-foreground">
                    Puerto Vallarta · America/Mexico_City
                  </p>
                  <p className="mt-3 text-xs leading-6 text-muted-foreground">
                    Los horarios de salida se muestran en la hora local del
                    destino.
                  </p>
                </section>
              </div>
            </div>
          )}
          <footer className="mt-10 flex flex-wrap justify-between gap-3 border-t pt-5 text-[11px] text-muted-foreground">
            <span>Eddy’s Tours · Hecho para vivir la bahía</span>
            <span>
              Horarios de Puerto Vallarta ·{' '}
              {demo ? 'Demostración' : 'Administración'}
            </span>
          </footer>
        </main>
      </div>

      {toast && (
        <div
          role="status"
          className="fixed bottom-6 right-6 z-[100] flex max-w-[calc(100vw-48px)] items-center gap-3 rounded-xl bg-[#173e47] px-5 py-4 text-sm text-white shadow-xl"
        >
          <Check className="size-4 shrink-0" />
          {toast}
          <button aria-label="Cerrar aviso" onClick={() => setToast('')}>
            <X className="size-4" />
          </button>
        </div>
      )}
      {selected && (
        <AdminModal
          title={
            selected.reference ??
            (collection === 'tours'
              ? 'Detalle del tour'
              : 'Detalle del registro')
          }
          onClose={() => setSelected(null)}
        >
          {selected.image && (
            <Image
              src={selected.image}
              alt={selected.name}
              width={600}
              height={240}
              className="mb-6 h-48 w-full rounded-xl object-cover"
            />
          )}
          <div className="flex items-start justify-between gap-4">
            <div>
              <h3 className="text-2xl font-bold">{selected.name}</h3>
              <p className="mt-2 text-sm leading-6 text-muted-foreground">
                {selected.subtitle}
              </p>
            </div>
            <Badge status={selected.status} />
          </div>
          <dl className="mt-7 grid gap-5 border-y py-6 sm:grid-cols-2">
            {Object.entries({
              Correo: selected.email,
              Teléfono: selected.phone,
              Fecha: selected.date,
              Salida: selected.time,
              'Viajeros / cupo': selected.quantity,
              Destino: selected.location,
              Importe:
                selected.amount != null
                  ? money(selected.amount, selected.currency)
                  : undefined,
              Pagado:
                selected.paid != null
                  ? money(selected.paid, selected.currency)
                  : undefined,
            })
              .filter(([, value]) => value != null && value !== '')
              .map(([label, value]) => (
                <div key={label}>
                  <dt className="text-xs text-muted-foreground">{label}</dt>
                  <dd className="mt-1 break-words text-sm font-medium">
                    {value}
                  </dd>
                </div>
              ))}
          </dl>
          {selected.description && (
            <p className="mt-5 text-sm leading-7 text-muted-foreground">
              {selected.description}
            </p>
          )}
          {demo && selected.note && (
            <p className="mt-4 rounded-lg bg-muted p-4 text-sm">
              {selected.note}
            </p>
          )}
          <div className="mt-7 flex flex-wrap gap-3">
            {(demo ||
              ['tours', 'bookings', 'reviews'].includes(collection)) && (
              <button
                className="admin-primary"
                onClick={() => {
                  setEditing(selected)
                  setSelected(null)
                  setFormError('')
                }}
              >
                Editar {singular[collection]}
              </button>
            )}
            {selected.email && (
              <a className="admin-secondary" href={`mailto:${selected.email}`}>
                <Mail className="size-4" />
                Contactar
              </a>
            )}
            {selected.slug && (
              <Link
                href={
                  demo
                    ? `/admin/demo/preview/${encodeURIComponent(selected.id)}`
                    : `/tours/${selected.slug}`
                }
                className="admin-secondary"
                target="_blank"
              >
                Ver en el sitio
                <ExternalLink className="size-4" />
              </Link>
            )}
            {demo && (
              <button
                className="text-sm text-red-700"
                onClick={() => {
                  setConfirmDelete(selected)
                  setSelected(null)
                }}
              >
                Eliminar
              </button>
            )}
          </div>
        </AdminModal>
      )}
      {editing && collection === 'tours' && demo && (
        <AdminModal
          title={
            data.tours.some((t) => t.id === editing.id)
              ? 'Editar tour'
              : 'Crear tour'
          }
          onClose={() => {
            if (!busy) setEditing(null)
          }}
        >
          <TourEditor
            record={editing}
            busy={busy}
            error={formError}
            onSave={(record) => void saveRecord(record)}
            onCancel={() => setEditing(null)}
          />
        </AdminModal>
      )}
      {editing && !(collection === 'tours' && demo) && (
        <AdminModal
          title={`${data[collection].some((r) => r.id === editing.id) ? 'Editar' : 'Agregar'} ${singular[collection]}`}
          onClose={() => {
            if (!busy) setEditing(null)
          }}
        >
          <form
            className="space-y-5"
            onSubmit={(e) => {
              e.preventDefault()
              if (
                collection === 'tours' &&
                (editing.amount ?? 0) > (editing.price ?? 0) &&
                demo
              ) {
                setFormError('El anticipo no puede superar el precio del tour.')
                return
              }
              void saveRecord(editing)
            }}
          >
            {!demo && (
              <p className="rounded-lg bg-muted p-4 text-sm leading-6">
                {collection === 'tours'
                  ? 'Actualiza la publicación y la posición editorial del tour. El contenido y los precios se administran en el catálogo de origen.'
                  : 'Actualiza el estado del registro. Los datos originales del viajero se conservan.'}
              </p>
            )}
            <label className="field">
              {['contacts', 'operators'].includes(collection)
                ? 'Nombre completo / razón social'
                : collection === 'tours'
                  ? 'Nombre de la experiencia'
                  : 'Nombre del viajero / concepto'}
              <input
                autoFocus
                required
                maxLength={140}
                disabled={!demo}
                value={editing.name}
                onChange={(e) =>
                  setEditing({ ...editing, name: e.target.value })
                }
              />
            </label>
            {demo && (
              <label className="field">
                {collection === 'tours'
                  ? 'Operador'
                  : collection === 'bookings'
                    ? 'Experiencia'
                    : 'Descripción breve'}
                {collection === 'bookings' ? (
                  <select
                    required
                    value={editing.subtitle}
                    onChange={(e) =>
                      setEditing({ ...editing, subtitle: e.target.value })
                    }
                  >
                    <option value="">Selecciona un tour</option>
                    {data.tours.map((t) => (
                      <option key={t.id}>{t.name}</option>
                    ))}
                  </select>
                ) : (
                  <input
                    required
                    maxLength={160}
                    value={editing.subtitle}
                    onChange={(e) =>
                      setEditing({ ...editing, subtitle: e.target.value })
                    }
                  />
                )}
              </label>
            )}
            <label className="field">
              Estado
              <select
                value={editing.status}
                onChange={(e) =>
                  setEditing({ ...editing, status: e.target.value })
                }
              >
                {editableStatuses[collection].map((s) => (
                  <option key={s} value={s}>
                    {statusLabels[s]}
                  </option>
                ))}
              </select>
            </label>
            {collection === 'tours' && (
              <>
                {demo && (
                  <>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <label className="field">
                        Categoría
                        <select
                          value={editing.category}
                          onChange={(e) =>
                            setEditing({ ...editing, category: e.target.value })
                          }
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
                          value={editing.location ?? ''}
                          onChange={(e) =>
                            setEditing({ ...editing, location: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        Precio por persona (MXN)
                        <input
                          type="number"
                          min="1"
                          step="0.01"
                          required
                          value={editing.price ?? ''}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              price: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label className="field">
                        Anticipo por persona (MXN)
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          required
                          value={editing.amount ?? ''}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              amount: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label className="field">
                        Cupo por salida
                        <input
                          type="number"
                          min="1"
                          max="200"
                          required
                          value={editing.quantity ?? ''}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              quantity: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                      <label className="field">
                        Fotografía
                        <select
                          value={editing.image ?? '/images/tour-atv.webp'}
                          onChange={(e) =>
                            setEditing({ ...editing, image: e.target.value })
                          }
                        >
                          <option value="/images/tour-atv.webp">
                            Aventura en la selva
                          </option>
                          <option value="/images/dest-yelapa.webp">
                            Costa de Yelapa
                          </option>
                          <option value="/images/dest-puerto-vallarta.webp">
                            Puerto Vallarta
                          </option>
                          <option value="/images/cat-boats.webp">
                            Paseo en barco
                          </option>
                          {editing.image &&
                            ![
                              '/images/tour-atv.webp',
                              '/images/dest-yelapa.webp',
                              '/images/dest-puerto-vallarta.webp',
                              '/images/cat-boats.webp',
                            ].includes(editing.image) && (
                              <option value={editing.image}>
                                Fotografía actual
                              </option>
                            )}
                        </select>
                      </label>
                    </div>
                    <label className="field">
                      Descripción
                      <textarea
                        required
                        value={editing.description ?? ''}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            description: e.target.value,
                          })
                        }
                      />
                    </label>
                  </>
                )}
                <div className="flex flex-wrap gap-5">
                  {(['featured', 'popular'] as const).map((field) => (
                    <label
                      key={field}
                      className="flex items-center gap-2 text-sm"
                    >
                      <input
                        type="checkbox"
                        checked={Boolean(editing[field])}
                        onChange={(e) =>
                          setEditing({ ...editing, [field]: e.target.checked })
                        }
                        className="size-4 accent-ocean"
                      />
                      {field === 'featured'
                        ? 'Experiencia destacada'
                        : 'Tour popular'}
                    </label>
                  ))}
                </div>
              </>
            )}
            {demo &&
              ['bookings', 'payments', 'payouts'].includes(collection) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="field">
                    Referencia
                    <input
                      required
                      maxLength={40}
                      value={editing.reference ?? ''}
                      onChange={(e) =>
                        setEditing({ ...editing, reference: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    Fecha
                    <input
                      type="date"
                      required
                      value={editing.date ?? ''}
                      onChange={(e) =>
                        setEditing({ ...editing, date: e.target.value })
                      }
                    />
                  </label>
                  {collection === 'bookings' && (
                    <>
                      <label className="field">
                        Hora de salida
                        <input
                          type="time"
                          required
                          value={editing.time ?? ''}
                          onChange={(e) =>
                            setEditing({ ...editing, time: e.target.value })
                          }
                        />
                      </label>
                      <label className="field">
                        Viajeros
                        <input
                          type="number"
                          min="1"
                          max="200"
                          required
                          value={editing.quantity ?? 1}
                          onChange={(e) =>
                            setEditing({
                              ...editing,
                              quantity: Number(e.target.value),
                            })
                          }
                        />
                      </label>
                    </>
                  )}
                  <label className="field">
                    Importe
                    <input
                      type="number"
                      min="0"
                      step="0.01"
                      required
                      value={editing.amount ?? ''}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          amount: Number(e.target.value),
                        })
                      }
                    />
                  </label>
                  <label className="field">
                    Moneda
                    <select
                      value={editing.currency}
                      onChange={(e) =>
                        setEditing({
                          ...editing,
                          currency: e.target.value as 'MXN' | 'USD',
                        })
                      }
                    >
                      <option>MXN</option>
                      <option>USD</option>
                    </select>
                  </label>
                  {collection !== 'payouts' && (
                    <label className="field">
                      Pagado
                      <input
                        type="number"
                        min="0"
                        max={editing.amount}
                        step="0.01"
                        required
                        value={editing.paid ?? 0}
                        onChange={(e) =>
                          setEditing({
                            ...editing,
                            paid: Number(e.target.value),
                          })
                        }
                      />
                    </label>
                  )}
                </div>
              )}
            {demo &&
              ['contacts', 'operators', 'bookings'].includes(collection) && (
                <div className="grid gap-4 sm:grid-cols-2">
                  <label className="field">
                    Correo electrónico
                    <input
                      type="email"
                      required
                      value={editing.email ?? ''}
                      onChange={(e) =>
                        setEditing({ ...editing, email: e.target.value })
                      }
                    />
                  </label>
                  <label className="field">
                    Teléfono
                    <input
                      type="tel"
                      value={editing.phone ?? ''}
                      onChange={(e) =>
                        setEditing({ ...editing, phone: e.target.value })
                      }
                    />
                  </label>
                </div>
              )}
            {collection === 'reviews' && (
              <blockquote className="rounded-xl bg-muted p-5 text-sm leading-7">
                {editing.description}
              </blockquote>
            )}
            {formError && (
              <p
                role="alert"
                className="rounded-lg bg-red-50 p-4 text-sm text-red-800"
              >
                {formError}
              </p>
            )}
            <div className="flex justify-end gap-3 border-t pt-5">
              <button
                type="button"
                disabled={busy}
                className="admin-secondary"
                onClick={() => setEditing(null)}
              >
                Cancelar
              </button>
              <button disabled={busy} className="admin-primary">
                {busy ? 'Guardando…' : 'Guardar cambios'}
              </button>
            </div>
          </form>
        </AdminModal>
      )}
      {confirmDelete && (
        <AdminModal
          title={
            confirmDelete.id === 'reset-demo'
              ? 'Restablecer demostración'
              : `Eliminar ${singular[collection]}`
          }
          onClose={() => setConfirmDelete(null)}
        >
          <p className="text-sm leading-7 text-muted-foreground">
            {confirmDelete.id === 'reset-demo'
              ? 'Se borrarán los cambios de esta demostración y se recuperarán los datos de ejemplo.'
              : `Se eliminará “${confirmDelete.name}” de la demostración. Esta acción no modifica la operación real.`}
          </p>
          <div className="mt-7 flex justify-end gap-3">
            <button
              className="admin-secondary"
              onClick={() => setConfirmDelete(null)}
            >
              Cancelar
            </button>
            <button
              className="admin-primary bg-red-700!"
              onClick={() => {
                if (confirmDelete.id === 'reset-demo') {
                  try {
                    localStorage.removeItem(storageKey)
                    localStorage.removeItem(`${storageKey}.settings`)
                  } catch {
                    /* Reset the current view regardless. */
                  }
                  setData(initialData)
                  router.replace(`${base}/overview`)
                  router.refresh()
                } else {
                  commit({
                    ...data,
                    [collection]: data[collection].filter(
                      (r) => r.id !== confirmDelete.id,
                    ),
                  })
                  setPage(1)
                  setToast('Registro eliminado de la demostración.')
                }
                setConfirmDelete(null)
              }}
            >
              {confirmDelete.id === 'reset-demo'
                ? 'Restablecer'
                : 'Eliminar registro'}
            </button>
          </div>
        </AdminModal>
      )}
    </div>
  )
}
