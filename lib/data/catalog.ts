import 'server-only'

import { unstable_cache } from 'next/cache'
import { tours as fallbackTours, type Tour, type TourCategory } from '@/lib/tours'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createPublicClient } from '@/lib/supabase/public'
import type {
  DepartureRow,
  OperatorRow,
  TourMediaRow,
  TourOptionRow,
  TourRow,
} from '@/lib/supabase/database.types'

const TOUR_CATEGORIES: TourCategory[] = [
  'Adventure',
  'Water',
  'Boats',
  'Nature',
  'Family',
  'Couples',
  'Wildlife',
  'Culture',
]

function isTourCategory(value: string): value is TourCategory {
  return TOUR_CATEGORIES.includes(value as TourCategory)
}

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainingMinutes = minutes % 60

  if (!remainingMinutes) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  return `${hours}.${Math.round((remainingMinutes / 60) * 10)} hours`
}

function dateInVallarta(value: string) {
  const parts = new Intl.DateTimeFormat('en-US', {
    day: '2-digit',
    month: '2-digit',
    timeZone: 'America/Mexico_City',
    year: 'numeric',
  }).formatToParts(new Date(value))
  const part = (type: Intl.DateTimeFormatPartTypes) =>
    parts.find((item) => item.type === type)?.value ?? ''

  return `${part('year')}-${part('month')}-${part('day')}`
}

function timeInVallarta(value: string) {
  return new Intl.DateTimeFormat('en-US', {
    hour: 'numeric',
    minute: '2-digit',
    timeZone: 'America/Mexico_City',
  }).format(new Date(value))
}

async function fetchCatalogFromSupabase(): Promise<Tour[]> {
  const supabase = createPublicClient()
  const { data: tourRows, error: toursError } = await supabase
    .from('tours')
    .select('*')
    .eq('published', true)
    .order('popular', { ascending: false })
    .order('title')

  if (toursError) throw toursError
  if (!tourRows?.length) return []

  const typedTours = tourRows as TourRow[]
  const tourIds = typedTours.map((tour) => tour.id)
  const operatorIds = [...new Set(typedTours.map((tour) => tour.operator_id))]
  const now = new Date().toISOString()

  const [operatorsResult, mediaResult, optionsResult, departuresResult] = await Promise.all([
    supabase.from('operators').select('*').in('id', operatorIds),
    supabase.from('tour_media').select('*').in('tour_id', tourIds).order('position'),
    supabase.from('tour_options').select('*').in('tour_id', tourIds).eq('active', true),
    supabase
      .from('departures')
      .select('*')
      .in('tour_id', tourIds)
      .eq('status', 'scheduled')
      .gte('starts_at', now)
      .order('starts_at'),
  ])

  const firstError = [operatorsResult, mediaResult, optionsResult, departuresResult].find(
    (result) => result.error,
  )?.error
  if (firstError) throw firstError

  const operators = (operatorsResult.data ?? []) as OperatorRow[]
  const media = (mediaResult.data ?? []) as TourMediaRow[]
  const options = (optionsResult.data ?? []) as TourOptionRow[]
  const departures = (departuresResult.data ?? []) as DepartureRow[]

  return typedTours.flatMap((row) => {
    const option = options.find((item) => item.tour_id === row.id)
    const operator = operators.find((item) => item.id === row.operator_id)
    const tourDepartures = departures.filter((item) => item.tour_id === row.id)
    const images = media.filter((item) => item.tour_id === row.id).map((item) => item.url)

    if (!option || !operator || !isTourCategory(row.category)) return []

    const availableDates = [...new Set(tourDepartures.map((item) => dateInVallarta(item.starts_at)))]
    const availableTimes = [...new Set(tourDepartures.map((item) => timeInVallarta(item.starts_at)))]

    return [
      {
        id: row.legacy_id ?? row.id,
        slug: row.slug,
        title: row.title,
        providerName: operator.name,
        category: row.category,
        location: row.location,
        images: images.length ? images : ['/placeholder.svg'],
        shortDescription: row.short_description,
        fullDescription: row.full_description,
        duration: formatDuration(row.duration_minutes),
        rating: Number(row.rating_average),
        reviewsCount: row.reviews_count,
        retailPriceUSD: option.retail_price_usd_minor / 100,
        retailPriceMXN: option.retail_price_mxn_minor / 100,
        providerPrice: 0,
        depositAmount: option.deposit_usd_minor / 100,
        availableDates,
        availableTimes,
        availableSpots: tourDepartures.length
          ? Math.min(...tourDepartures.map((item) => item.capacity))
          : option.max_participants,
        meetingPoint: row.meeting_point,
        includedItems: row.included_items,
        excludedItems: row.excluded_items,
        requirements: row.requirements,
        featured: row.featured,
        popular: row.popular,
      } satisfies Tour,
    ]
  })
}

const getCachedSupabaseCatalog = unstable_cache(fetchCatalogFromSupabase, ['tour-catalog'], {
  revalidate: 300,
  tags: ['tour-catalog'],
})

export async function getCatalogTours(): Promise<Tour[]> {
  if (!isSupabaseConfigured()) return fallbackTours

  try {
    const catalog = await getCachedSupabaseCatalog()
    return catalog.length ? catalog : fallbackTours
  } catch (error) {
    console.error('Supabase catalog unavailable; using the bundled catalog.', error)
    return fallbackTours
  }
}
