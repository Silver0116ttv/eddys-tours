import 'server-only'

import { unstable_cache } from 'next/cache'
import { isTourCategory, price, type Tour } from '@/lib/tours'
import { toVallartaDate, toVallartaTime } from '@/lib/time'
import { getFallbackTours } from '@/lib/data/fallback-catalog'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createPublicClient } from '@/lib/supabase/public'
import type {
  DepartureAvailabilityRow,
  OperatorRow,
  TourMediaRow,
  TourOptionRow,
  TourRow,
  TourTranslationRow,
} from '@/lib/supabase/database.types'

/** How long a cached catalog read stays fresh. Mirrored by the home page's `revalidate`. */
export const CATALOG_REVALIDATE_SECONDS = 300

const PLACEHOLDER_IMAGE = '/placeholder.svg'

function formatDuration(minutes: number) {
  const hours = Math.floor(minutes / 60)
  const remainder = minutes % 60

  if (hours === 0) return `${minutes} minutes`
  if (remainder === 0) return `${hours} ${hours === 1 ? 'hour' : 'hours'}`
  if (remainder === 30) return `${hours}.5 hours`
  return `${hours}h ${remainder}m`
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

  const [operatorsResult, mediaResult, optionsResult, translationsResult, availabilityResults] =
    await Promise.all([
      supabase.from('operators').select('*').in('id', operatorIds),
      supabase.from('tour_media').select('*').in('tour_id', tourIds).order('position'),
      supabase.from('tour_options').select('*').in('tour_id', tourIds).eq('active', true),
      supabase.from('tour_translations').select('*').in('tour_id', tourIds),
      Promise.all(
        tourIds.map((tourId) =>
          supabase.rpc('get_departure_availability', {
            target_tour_id: tourId,
            starts_after: now,
          }),
        ),
      ),
    ])

  const firstError = [
    operatorsResult,
    mediaResult,
    optionsResult,
    translationsResult,
    ...availabilityResults,
  ].find((result) => result.error)?.error
  if (firstError) throw firstError

  const operators = (operatorsResult.data ?? []) as OperatorRow[]
  const media = (mediaResult.data ?? []) as TourMediaRow[]
  const options = (optionsResult.data ?? []) as TourOptionRow[]
  const translations = (translationsResult.data ?? []) as TourTranslationRow[]
  const departures = availabilityResults.flatMap(
    (result) => (result.data ?? []) as DepartureAvailabilityRow[],
  )

  return typedTours.flatMap((row) => {
    const option = options.find((item) => item.tour_id === row.id)
    const operator = operators.find((item) => item.id === row.operator_id)
    const tourDepartures = departures.filter(
      (item) => item.tour_id === row.id && item.remaining_capacity > 0,
    )
    const images = media.filter((item) => item.tour_id === row.id).map((item) => item.url)
    const spanish = translations.find(
      (item) => item.tour_id === row.id && item.locale === 'es-MX',
    )

    if (!option || !operator || !isTourCategory(row.category)) return []

    return [
      {
        id: row.legacy_id ?? row.id,
        slug: row.slug,
        title: row.title,
        providerName: operator.name,
        category: row.category,
        location: row.location,
        images: images.length ? images : [PLACEHOLDER_IMAGE],
        shortDescription: row.short_description,
        fullDescription: row.full_description,
        duration: formatDuration(row.duration_minutes),
        rating: Number(row.rating_average),
        reviewsCount: row.reviews_count,
        retailPrice: price(
          option.retail_price_usd_minor / 100,
          option.retail_price_mxn_minor / 100,
        ),
        deposit: price(option.deposit_usd_minor / 100, option.deposit_mxn_minor / 100),
        availableDates: [
          ...new Set(tourDepartures.map((item) => toVallartaDate(item.starts_at))),
        ],
        availableTimes: [
          ...new Set(tourDepartures.map((item) => toVallartaTime(item.starts_at))),
        ],
        availableSpots: tourDepartures.length
          ? Math.min(...tourDepartures.map((item) => item.remaining_capacity))
          : option.max_participants,
        meetingPoint: row.meeting_point,
        includedItems: row.included_items,
        excludedItems: row.excluded_items,
        requirements: row.requirements,
        featured: row.featured,
        popular: row.popular,
        translations: spanish
          ? {
              'es-MX': {
                title: spanish.title,
                shortDescription: spanish.short_description,
                fullDescription: spanish.full_description,
                meetingPoint: spanish.meeting_point,
                includedItems: spanish.included_items,
                excludedItems: spanish.excluded_items,
                requirements: spanish.requirements,
              },
            }
          : undefined,
      } satisfies Tour,
    ]
  })
}

const getCachedSupabaseCatalog = unstable_cache(fetchCatalogFromSupabase, ['tour-catalog'], {
  revalidate: CATALOG_REVALIDATE_SECONDS,
  tags: ['tour-catalog'],
})

export async function getCatalogTours(): Promise<Tour[]> {
  if (!isSupabaseConfigured()) return getFallbackTours()

  try {
    const catalog = await getCachedSupabaseCatalog()
    return catalog.length ? catalog : getFallbackTours()
  } catch (error) {
    console.error('Supabase catalog unavailable; using the bundled catalog.', error)
    return getFallbackTours()
  }
}
