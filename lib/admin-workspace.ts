import type { Tour } from '@/lib/tours'
export const ADMIN_DEMO_STORAGE_KEY = 'eddys.admin-demo.v2'

export type AdminSection =
  | 'overview'
  | 'tours'
  | 'bookings'
  | 'calendar'
  | 'payments'
  | 'payouts'
  | 'contacts'
  | 'operators'
  | 'reviews'
  | 'settings'
export const adminSections: {
  id: AdminSection
  title: string
  description: string
}[] = [
  {
    id: 'overview',
    title: 'Resumen',
    description: 'Un vistazo a tu operación y a las próximas aventuras.',
  },
  {
    id: 'tours',
    title: 'Tours y experiencias',
    description: 'Cuida cada detalle de las experiencias de tu catálogo.',
  },
  {
    id: 'bookings',
    title: 'Reservaciones',
    description: 'Acompaña a cada viajero, desde su solicitud hasta la salida.',
  },
  {
    id: 'calendar',
    title: 'Calendario de salidas',
    description: 'Organiza los próximos tours y a sus viajeros.',
  },
  {
    id: 'payments',
    title: 'Cobros',
    description: 'Consulta los pagos de tus viajeros y los saldos por cobrar.',
  },
  {
    id: 'payouts',
    title: 'Pagos a operadores',
    description: 'Lleva el control de los compromisos con tus socios locales.',
  },
  {
    id: 'contacts',
    title: 'Contactos',
    description: 'Las personas detrás de cada viaje, en un solo lugar.',
  },
  {
    id: 'operators',
    title: 'Operadores',
    description: 'Tu red de expertos en Puerto Vallarta y la bahía.',
  },
  {
    id: 'reviews',
    title: 'Reseñas',
    description: 'Escucha a los viajeros y revisa sus experiencias.',
  },
  {
    id: 'settings',
    title: 'Configuración',
    description:
      'Información del negocio y preferencias de tu espacio de trabajo.',
  },
]
export type AdminRecord = {
  id: string
  name: string
  subtitle: string
  status: string
  email?: string
  phone?: string
  date?: string
  time?: string
  quantity?: number
  amount?: number
  paid?: number
  currency?: 'USD' | 'MXN'
  reference?: string
  image?: string
  category?: string
  location?: string
  description?: string
  price?: number
  featured?: boolean
  popular?: boolean
  slug?: string
  rating?: number
  note?: string
  tour?: Tour
}
export type WorkspaceData = Record<
  | 'tours'
  | 'bookings'
  | 'payments'
  | 'payouts'
  | 'contacts'
  | 'operators'
  | 'reviews',
  AdminRecord[]
>
export const emptyWorkspace: WorkspaceData = {
  tours: [],
  bookings: [],
  payments: [],
  payouts: [],
  contacts: [],
  operators: [],
  reviews: [],
}
export const statusLabels: Record<string, string> = {
  published: 'Publicado',
  draft: 'Borrador',
  pending_payment: 'Por cobrar',
  confirmed: 'Confirmada',
  completed: 'Completada',
  cancelled: 'Cancelada',
  refunded: 'Reembolsada',
  paid: 'Pagado',
  pending: 'Pendiente',
  active: 'Activo',
  inactive: 'Inactivo',
  new: 'Nuevo',
  contacted: 'Contactado',
  scheduled: 'Programado',
  rejected: 'Rechazada',
}
export function money(value = 0, currency = 'MXN') {
  return (
    new Intl.NumberFormat('es-MX', {
      style: 'currency',
      currency,
      currencyDisplay: 'narrowSymbol',
      maximumFractionDigits: 2,
    }).format(value) + ` ${currency}`
  )
}
