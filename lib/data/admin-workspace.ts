import 'server-only'
import {
  getAdminBookings,
  getManagedTours,
  getReviewModerationQueue,
} from '@/lib/data/admin'
import {
  emptyWorkspace,
  type AdminRecord,
  type WorkspaceData,
} from '@/lib/admin-workspace'
import { getFallbackTours } from './fallback-catalog'
import { vallartaDateOffset, toVallartaDate } from '@/lib/time'

export function demoWorkspace(): WorkspaceData {
  const catalog = getFallbackTours()
  const tours: AdminRecord[] = catalog.map((t) => ({
    id: t.id,
    name: t.translations?.['es-MX']?.title ?? t.title,
    subtitle: t.providerName,
    status: 'published',
    image: t.images[0],
    category: t.category,
    location: t.location,
    description: t.shortDescription,
    price: t.retailPrice.mxn,
    amount: t.deposit.mxn,
    quantity: t.availableSpots,
    featured: t.featured,
    popular: t.popular,
    slug: t.slug,
    tour: t,
  }))
  const names = [
    'Sofía Martínez',
    'James Wilson',
    'Valentina Torres',
    'Daniel García',
    'Emma Thompson',
    'Alejandro Ruiz',
    'Camila López',
    'Oliver Brown',
  ]
  const bookings: AdminRecord[] = names.map((name, i) => ({
    id: `demo-booking-${i}`,
    name,
    subtitle: tours[i % tours.length]?.name ?? 'Tour',
    status:
      [
        'confirmed',
        'pending_payment',
        'confirmed',
        'completed',
        'confirmed',
        'cancelled',
        'pending_payment',
        'confirmed',
      ][i] ?? 'confirmed',
    reference: `ED-260${142 + i}`,
    email: `viajero${i + 1}@example.com`,
    phone: '+52 000 000 0000',
    date: vallartaDateOffset(i < 3 ? 0 : i - 2),
    time: i % 2 ? '13:00' : '09:00',
    quantity: [2, 4, 2, 6, 3, 2, 4, 2][i],
    amount: [3200, 7200, 4800, 9600, 5400, 3200, 6800, 4200][i],
    paid: [3200, 1800, 2400, 9600, 5400, 0, 1800, 2100][i],
    currency: 'MXN',
    note:
      i === 1 ? 'Solicita información sobre transporte desde el hotel.' : '',
  }))
  return {
    tours,
    bookings,
    payments: bookings
      .filter((b) => b.status !== 'cancelled')
      .map((b) => ({
        ...b,
        id: `payment-${b.id}`,
        status: b.paid === b.amount ? 'paid' : 'pending',
      })),
    payouts: tours.slice(0, 4).map((t, i) => ({
      id: `payout-${i}`,
      name: t.subtitle,
      subtitle: t.name,
      reference: `OP-10${i + 1}`,
      status: i === 2 ? 'paid' : 'pending',
      amount: [2400, 5600, 3800, 7200][i],
      date: vallartaDateOffset(i + 1),
      currency: 'MXN',
    })),
    contacts: bookings.map((b) => ({
      id: `contact-${b.id}`,
      name: b.name,
      subtitle: b.subtitle,
      status: b.status === 'pending_payment' ? 'new' : 'contacted',
      email: b.email,
      phone: b.phone,
      note: b.note,
    })),
    operators: [...new Set(tours.map((t) => t.subtitle))].map((name, i) => ({
      id: `operator-${i}`,
      name,
      subtitle: 'Puerto Vallarta y Bahía de Banderas',
      status: 'active',
      email: `operador${i + 1}@example.com`,
      phone: '+52 000 000 0000',
    })),
    reviews: bookings.slice(0, 4).map((b, i) => ({
      id: `review-${i}`,
      name: b.name,
      subtitle: b.subtitle,
      status: i < 2 ? 'pending' : 'published',
      rating: i === 2 ? 4 : 5,
      description: [
        'Una experiencia increíble. El guía nos acompañó en todo momento y la bahía estaba preciosa.',
        'Muy buena organización y un paseo que disfrutamos en familia. ¡Volveríamos!',
        'Nos encantó el recorrido. Recomendamos llegar con tiempo al punto de encuentro.',
        'El mejor día de nuestras vacaciones. Todo el equipo fue muy atento.',
      ][i],
      date: vallartaDateOffset(-i),
    })),
  }
}

export async function liveWorkspace(): Promise<WorkspaceData> {
  const [tourResult, bookingResult, reviewResult] = await Promise.all([
    getManagedTours({ pageSize: 100 }),
    getAdminBookings({ pageSize: 100 }),
    getReviewModerationQueue({ pageSize: 100 }),
  ])
  const tours: AdminRecord[] = tourResult.data.map((t) => ({
    id: t.id,
    name: t.title,
    subtitle: t.operator_name,
    status: t.published ? 'published' : 'draft',
    category: t.category,
    location: t.location,
    featured: t.featured,
    popular: t.popular,
    slug: t.slug,
  }))
  const bookings: AdminRecord[] = bookingResult.data.map((b) => ({
    id: b.id,
    reference: b.reference,
    name: b.guest_name ?? b.guest_email,
    subtitle: b.title_snapshot,
    status: b.status,
    email: b.guest_email,
    phone: b.guest_phone ?? '',
    date: toVallartaDate(b.starts_at),
    time: new Date(b.starts_at).toLocaleTimeString('es-MX', {
      timeZone: 'America/Mexico_City',
      hour: '2-digit',
      minute: '2-digit',
    }),
    quantity: b.quantity,
    amount: b.amount_due_minor / 100,
    paid: b.amount_paid_minor / 100,
    currency: b.currency,
    note: b.booking_id,
  }))
  const uniqueBookings = [
    ...new Map(bookings.map((b) => [b.reference, b])).values(),
  ]
  return {
    ...emptyWorkspace,
    tours,
    bookings,
    payments: uniqueBookings.map((b) => ({
      ...b,
      status: (b.paid ?? 0) >= (b.amount ?? 0) ? 'paid' : 'pending',
    })),
    contacts: [
      ...new Map(
        bookings.map((b) => [
          b.email,
          {
            ...b,
            id: b.email ?? b.id,
            subtitle: b.email ?? '',
            status: 'contacted',
          },
        ]),
      ).values(),
    ],
    operators: [
      ...new Map(
        tourResult.data.map((t) => [
          t.operator_id,
          {
            id: t.operator_id,
            name: t.operator_name,
            subtitle: t.location,
            status: 'active',
          },
        ]),
      ).values(),
    ],
    reviews: reviewResult.data.map((r) => ({
      id: r.id,
      name: r.customer_name ?? 'Viajero',
      subtitle: r.tour_title,
      status: r.status,
      rating: r.rating,
      description: r.content,
      date: r.created_at.slice(0, 10),
    })),
  }
}
