export type TourCategory =
  | 'Adventure'
  | 'Water'
  | 'Boats'
  | 'Nature'
  | 'Family'
  | 'Couples'
  | 'Wildlife'
  | 'Culture'

export const TOUR_CATEGORIES: readonly TourCategory[] = [
  'Adventure',
  'Water',
  'Boats',
  'Nature',
  'Family',
  'Couples',
  'Wildlife',
  'Culture',
]

export function isTourCategory(value: string): value is TourCategory {
  return (TOUR_CATEGORIES as readonly string[]).includes(value)
}

export type Currency = 'USD' | 'MXN'

/**
 * A single amount carried in both currencies we sell in. Keeping the pair
 * together — instead of converting a USD total at display time — is what makes
 * line items add up to the cart total in whichever currency is on screen.
 */
export interface Price {
  usd: number
  mxn: number
}

const USD_TO_MXN = 18

/** Peso shelf price: converted, then rounded to the nearest 5 for a clean tag. */
export function toMXN(usd: number): number {
  return Math.round((usd * USD_TO_MXN) / 5) * 5
}

/** Build a price from USD, optionally with an operator-supplied peso price. */
export function price(usd: number, mxn: number = toMXN(usd)): Price {
  return { usd, mxn }
}

export function scalePrice({ usd, mxn }: Price, quantity: number): Price {
  return { usd: usd * quantity, mxn: mxn * quantity }
}

export function sumPrices(prices: Price[]): Price {
  return prices.reduce<Price>(
    (total, item) => ({ usd: total.usd + item.usd, mxn: total.mxn + item.mxn }),
    { usd: 0, mxn: 0 },
  )
}

export function subtractPrice(a: Price, b: Price): Price {
  return { usd: a.usd - b.usd, mxn: a.mxn - b.mxn }
}

export function formatPrice(value: Price, currency: Currency): string {
  const amount = currency === 'MXN' ? value.mxn : value.usd
  return `$${amount.toLocaleString('en-US')} ${currency}`
}

export interface Tour {
  id: string
  slug: string
  title: string
  providerName: string
  category: TourCategory
  location: string
  images: string[]
  shortDescription: string
  fullDescription: string
  duration: string
  rating: number
  reviewsCount: number
  /** Retail price per person. */
  retailPrice: Price
  /** Amount held per person when paying a deposit. */
  deposit: Price
  availableDates: string[]
  availableTimes: string[]
  availableSpots: number
  meetingPoint: string
  includedItems: string[]
  excludedItems: string[]
  requirements: string[]
  featured: boolean
  popular: boolean
  translations?: Partial<Record<'es-MX', TourLocalizedCopy>>
}

export type TourLocalizedCopy = Pick<
  Tour,
  | 'title'
  | 'shortDescription'
  | 'fullDescription'
  | 'meetingPoint'
  | 'includedItems'
  | 'excludedItems'
  | 'requirements'
>

export interface CategoryItem {
  name: TourCategory
  image: string
  count: number
  size: 'large' | 'wide' | 'tall' | 'normal'
}

export const categories: CategoryItem[] = [
  { name: 'Adventure', image: '/images/cat-adventure.webp', count: 18, size: 'large' },
  { name: 'Water', image: '/images/cat-water.webp', count: 24, size: 'normal' },
  { name: 'Boats', image: '/images/cat-boats.webp', count: 15, size: 'tall' },
  { name: 'Nature', image: '/images/cat-nature.webp', count: 12, size: 'normal' },
  { name: 'Family', image: '/images/cat-family.webp', count: 20, size: 'wide' },
  { name: 'Couples', image: '/images/cat-couples.webp', count: 9, size: 'normal' },
  { name: 'Wildlife', image: '/images/cat-wildlife.webp', count: 7, size: 'normal' },
  { name: 'Culture', image: '/images/cat-culture.webp', count: 11, size: 'normal' },
]

export interface Destination {
  name: string
  slug: string
  image: string
  description: string
}

export const destinations: Destination[] = [
  {
    name: 'Puerto Vallarta',
    slug: 'puerto-vallarta-tours',
    image: '/images/dest-puerto-vallarta.webp',
    description: 'Cobblestone old town, the Malecón, and the heart of the bay.',
  },
  {
    name: 'Nuevo Vallarta',
    slug: 'nuevo-vallarta-tours',
    image: '/images/dest-nuevo-vallarta.webp',
    description: 'Wide golden beaches, marinas, and easy family days.',
  },
  {
    name: 'Sayulita',
    slug: 'sayulita-tours',
    image: '/images/dest-sayulita.webp',
    description: 'Surf, jungle and small-town charm.',
  },
  {
    name: 'Punta Mita',
    slug: 'punta-mita-tours',
    image: '/images/dest-punta-mita.webp',
    description: 'Upscale point breaks and turquoise water.',
  },
  {
    name: 'Yelapa',
    slug: 'yelapa-tours',
    image: '/images/dest-yelapa.webp',
    description: 'A car-free village, waterfalls and quiet coves.',
  },
  {
    name: 'San Sebastián del Oeste',
    slug: 'san-sebastian-tours',
    image: '/images/dest-san-sebastian.webp',
    description: 'A historic silver town high in the Sierra Madre.',
  },
]

export interface Review {
  id: string
  tourId: string
  bookingId: string
  customerName: string
  customerLocation: string
  rating: number
  content: string
  verified: boolean
  createdAt: string
}

export const reviews: Review[] = [
  {
    id: 'r1',
    tourId: 'sunset-sailing',
    bookingId: 'bk-1042',
    customerName: 'Sarah',
    customerLocation: 'California, USA',
    rating: 5,
    content:
      'One of the highlights of our trip to Vallarta. The crew was wonderful and the sunset was unreal.',
    verified: true,
    createdAt: '2026-07-28',
  },
  {
    id: 'r2',
    tourId: 'atv-sierra-madre',
    bookingId: 'bk-1088',
    customerName: 'Diego',
    customerLocation: 'Guadalajara, MX',
    rating: 5,
    content: 'So much fun and the trails were beautiful. Our guide made sure everyone felt safe.',
    verified: true,
    createdAt: '2026-07-30',
  },
  {
    id: 'r3',
    tourId: 'marietas-islands',
    bookingId: 'bk-1101',
    customerName: 'Emily',
    customerLocation: 'Toronto, CA',
    rating: 5,
    content: 'Booking was easy and the day was perfectly organized. Snorkeling was incredible.',
    verified: true,
    createdAt: '2026-08-02',
  },
  {
    id: 'r4',
    tourId: 'whale-watching',
    bookingId: 'bk-1123',
    customerName: 'Marcus',
    customerLocation: 'Berlin, DE',
    rating: 5,
    content: 'We saw several humpbacks up close. The marine biologist on board was fantastic.',
    verified: true,
    createdAt: '2026-08-05',
  },
  {
    id: 'r5',
    tourId: 'yelapa-day-trip',
    bookingId: 'bk-1150',
    customerName: 'Ana',
    customerLocation: 'Ciudad de México, MX',
    rating: 4,
    content:
      'Loved the village and the waterfall hike. A relaxing, authentic day away from the crowds.',
    verified: true,
    createdAt: '2026-08-08',
  },
  {
    id: 'r6',
    tourId: 'private-yacht',
    bookingId: 'bk-1170',
    customerName: 'James',
    customerLocation: 'Austin, USA',
    rating: 5,
    content:
      'Worth every penny for our anniversary. Private, relaxed, and the crew took care of everything.',
    verified: true,
    createdAt: '2026-08-11',
  },
]
