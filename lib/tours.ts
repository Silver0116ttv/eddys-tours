export type TourCategory =
  | 'Adventure'
  | 'Water'
  | 'Boats'
  | 'Nature'
  | 'Family'
  | 'Couples'
  | 'Wildlife'
  | 'Culture'

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
  retailPriceUSD: number
  retailPriceMXN: number
  providerPrice: number
  depositAmount: number
  availableDates: string[]
  availableTimes: string[]
  availableSpots: number
  meetingPoint: string
  includedItems: string[]
  excludedItems: string[]
  requirements: string[]
  featured: boolean
  popular: boolean
}

const USD_TO_MXN = 18

function mxn(usd: number) {
  return Math.round((usd * USD_TO_MXN) / 5) * 5
}

export const tours: Tour[] = [
  {
    id: 'atv-sierra-madre',
    slug: 'atv-sierra-madre',
    title: 'ATV Sierra Madre',
    providerName: 'Vallarta Off-Road Co.',
    category: 'Adventure',
    location: 'Puerto Vallarta',
    images: ['/images/tour-atv.webp'],
    shortDescription: 'Rip through jungle trails and river crossings in the Sierra Madre foothills.',
    fullDescription:
      'Grab the handlebars and chase muddy trails deep into the Sierra Madre. This guided ride climbs through tropical jungle, crosses shallow rivers, and stops at a scenic mountain lookout before heading back to the coast.',
    duration: '4 hours',
    rating: 4.9,
    reviewsCount: 128,
    retailPriceUSD: 89,
    retailPriceMXN: mxn(89),
    providerPrice: 62,
    depositAmount: 30,
    availableDates: ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-22'],
    availableTimes: ['9:00 AM', '1:00 PM'],
    availableSpots: 8,
    meetingPoint: 'Marina Vallarta main dock',
    includedItems: ['ATV & fuel', 'Certified guide', 'Helmet & goggles', 'Bottled water'],
    excludedItems: ['Gratuities', 'Hotel pickup'],
    requirements: ['Valid ID', 'Minimum age 16 to drive', 'Closed-toe shoes'],
    featured: false,
    popular: true,
  },
  {
    id: 'marietas-islands',
    slug: 'marietas-islands-adventure',
    title: 'Marietas Islands Adventure',
    providerName: 'Banderas Eco Cruises',
    category: 'Water',
    location: 'Islas Marietas',
    images: ['/images/tour-marietas.webp'],
    shortDescription: 'Snorkel, kayak and visit the famous Hidden Beach on a full-day expedition.',
    fullDescription:
      'A full-day expedition to the protected Marietas Islands. Snorkel over vibrant reefs, paddle a kayak into sea caves, and — conditions permitting — visit the legendary Hidden Beach tucked inside the island.',
    duration: '8 hours',
    rating: 4.8,
    reviewsCount: 214,
    retailPriceUSD: 109,
    retailPriceMXN: mxn(109),
    providerPrice: 78,
    depositAmount: 40,
    availableDates: ['2026-08-18', '2026-08-21', '2026-08-23'],
    availableTimes: ['8:00 AM'],
    availableSpots: 20,
    meetingPoint: 'Punta Mita boat ramp',
    includedItems: ['Boat transport', 'Snorkel gear', 'Kayak', 'Lunch & drinks', 'Guide'],
    excludedItems: ['National park fee', 'Gratuities'],
    requirements: ['Basic swimming ability', 'Sunscreen (reef-safe)'],
    featured: true,
    popular: true,
  },
  {
    id: 'sunset-sailing',
    slug: 'sunset-sailing-cruise',
    title: 'Sunset Sailing Cruise',
    providerName: 'Bahía Sail Club',
    category: 'Boats',
    location: 'Bay of Banderas',
    images: ['/images/tour-sunset-sailing.webp'],
    shortDescription: 'Glide across Banderas Bay as the Pacific lights up at golden hour.',
    fullDescription:
      'Set sail across Banderas Bay aboard a classic catamaran as the sun dips into the Pacific. Enjoy an open bar, canapés, and unbeatable views of the coastline glowing at golden hour.',
    duration: '3 hours',
    rating: 4.9,
    reviewsCount: 176,
    retailPriceUSD: 79,
    retailPriceMXN: mxn(79),
    providerPrice: 54,
    depositAmount: 20,
    availableDates: ['2026-08-18', '2026-08-19', '2026-08-20', '2026-08-22'],
    availableTimes: ['5:00 PM'],
    availableSpots: 30,
    meetingPoint: 'Los Muertos Pier',
    includedItems: ['Open bar', 'Canapés', 'Live music', 'Crew'],
    excludedItems: ['Gratuities'],
    requirements: ['Arrive 30 minutes early'],
    featured: false,
    popular: true,
  },
  {
    id: 'los-arcos-snorkeling',
    slug: 'los-arcos-snorkeling',
    title: 'Los Arcos Snorkeling',
    providerName: 'Blue Marlin Divers',
    category: 'Water',
    location: 'Puerto Vallarta',
    images: ['/images/tour-snorkeling.webp'],
    shortDescription: 'Swim among tropical fish beneath the dramatic arches of Los Arcos.',
    fullDescription:
      'Explore the Los Arcos marine sanctuary, a cluster of granite arches teeming with tropical marine life. Perfect for first-timers and families, with calm water and shallow reefs.',
    duration: '3 hours',
    rating: 4.7,
    reviewsCount: 92,
    retailPriceUSD: 65,
    retailPriceMXN: mxn(65),
    providerPrice: 44,
    depositAmount: 20,
    availableDates: ['2026-08-18', '2026-08-19', '2026-08-21'],
    availableTimes: ['9:00 AM', '12:00 PM'],
    availableSpots: 16,
    meetingPoint: 'Boca de Tomatlán pier',
    includedItems: ['Snorkel gear', 'Guide', 'Water & fruit'],
    excludedItems: ['Wetsuit rental', 'Gratuities'],
    requirements: ['Basic swimming ability'],
    featured: false,
    popular: true,
  },
  {
    id: 'private-yacht',
    slug: 'private-yacht-experience',
    title: 'Private Yacht Experience',
    providerName: 'Vallarta Yacht Charters',
    category: 'Boats',
    location: 'Nuevo Vallarta',
    images: ['/images/tour-yacht.webp'],
    shortDescription: 'Your own private yacht and crew for a day on the bay.',
    fullDescription:
      'Charter a private yacht with captain and crew for a fully customizable day on Banderas Bay. Anchor in secluded coves, swim, paddleboard, and cruise the coastline on your schedule.',
    duration: '6 hours',
    rating: 5.0,
    reviewsCount: 41,
    retailPriceUSD: 399,
    retailPriceMXN: mxn(399),
    providerPrice: 300,
    depositAmount: 120,
    availableDates: ['2026-08-19', '2026-08-20', '2026-08-24'],
    availableTimes: ['10:00 AM'],
    availableSpots: 10,
    meetingPoint: 'Paradise Village Marina',
    includedItems: ['Private yacht & crew', 'Fuel', 'Snorkel gear', 'Drinks & snacks'],
    excludedItems: ['Catering upgrades', 'Gratuities'],
    requirements: ['Booking confirmed 48h in advance'],
    featured: false,
    popular: true,
  },
  {
    id: 'whale-watching',
    slug: 'whale-watching',
    title: 'Whale Watching',
    providerName: 'Banderas Eco Cruises',
    category: 'Wildlife',
    location: 'Bay of Banderas',
    images: ['/images/tour-whale.webp'],
    shortDescription: 'Seasonal humpback whale watching with marine biologists aboard.',
    fullDescription:
      'From December to March, humpback whales fill Banderas Bay. Join our small-group boat with an onboard marine biologist for a respectful, unforgettable encounter with these giants.',
    duration: '3.5 hours',
    rating: 4.8,
    reviewsCount: 153,
    retailPriceUSD: 95,
    retailPriceMXN: mxn(95),
    providerPrice: 66,
    depositAmount: 30,
    availableDates: ['2026-08-18', '2026-08-20', '2026-08-23'],
    availableTimes: ['8:30 AM', '11:30 AM'],
    availableSpots: 18,
    meetingPoint: 'Marina Vallarta dock 2',
    includedItems: ['Boat & guide', 'Marine biologist', 'Water & snacks'],
    excludedItems: ['Gratuities'],
    requirements: ['Warm layer recommended'],
    featured: false,
    popular: true,
  },
  {
    id: 'yelapa-day-trip',
    slug: 'yelapa-day-trip',
    title: 'Yelapa Day Trip',
    providerName: 'South Bay Boats',
    category: 'Nature',
    location: 'Yelapa',
    images: ['/images/tour-yelapa.webp'],
    shortDescription: 'Boat to a car-free village, hike to a waterfall, and relax on the beach.',
    fullDescription:
      'Escape to Yelapa, a car-free fishing village reachable only by boat. Hike to a jungle waterfall, sample local pie on the beach, and soak up the slow pace of the southern bay.',
    duration: '7 hours',
    rating: 4.7,
    reviewsCount: 88,
    retailPriceUSD: 99,
    retailPriceMXN: mxn(99),
    providerPrice: 70,
    depositAmount: 35,
    availableDates: ['2026-08-19', '2026-08-21', '2026-08-22'],
    availableTimes: ['9:00 AM'],
    availableSpots: 24,
    meetingPoint: 'Los Muertos Pier',
    includedItems: ['Boat transport', 'Guide', 'Beach time', 'Waterfall hike'],
    excludedItems: ['Lunch', 'Gratuities'],
    requirements: ['Comfortable walking shoes'],
    featured: false,
    popular: true,
  },
  {
    id: 'zipline-jungle',
    slug: 'zipline-jungle-adventure',
    title: 'Zipline Jungle Adventure',
    providerName: 'Canopy River',
    category: 'Adventure',
    location: 'Puerto Vallarta',
    images: ['/images/tour-zipline.webp'],
    shortDescription: 'Fly across the jungle canopy on a network of high-speed ziplines.',
    fullDescription:
      'Soar over the treetops on a circuit of ziplines strung across a jungle river canyon. Combine your flights with rappelling and a mule ride for a full afternoon of adrenaline.',
    duration: '5 hours',
    rating: 4.8,
    reviewsCount: 119,
    retailPriceUSD: 85,
    retailPriceMXN: mxn(85),
    providerPrice: 58,
    depositAmount: 30,
    availableDates: ['2026-08-18', '2026-08-20', '2026-08-24'],
    availableTimes: ['9:00 AM', '1:30 PM'],
    availableSpots: 14,
    meetingPoint: 'El Nogalito trailhead',
    includedItems: ['All gear & harness', 'Guides', 'Transport from meeting point', 'Snack'],
    excludedItems: ['Photos package', 'Gratuities'],
    requirements: ['Max weight 120kg', 'Closed-toe shoes'],
    featured: false,
    popular: true,
  },
]

export function getTourById(id: string) {
  return tours.find((t) => t.id === id)
}

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
    content: 'One of the highlights of our trip to Vallarta. The crew was wonderful and the sunset was unreal.',
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
    content: 'Loved the village and the waterfall hike. A relaxing, authentic day away from the crowds.',
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
    content: 'Worth every penny for our anniversary. Private, relaxed, and the crew took care of everything.',
    verified: true,
    createdAt: '2026-08-11',
  },
]

export function formatPrice(usd: number, currency: 'USD' | 'MXN', mxnValue?: number) {
  if (currency === 'MXN') {
    const value = mxnValue ?? Math.round(usd * USD_TO_MXN)
    return `$${value.toLocaleString('en-US')} MXN`
  }
  return `$${usd.toLocaleString('en-US')} USD`
}
