'use client'

import { useEffect, useMemo, useState } from 'react'
import { Search, SlidersHorizontal, X } from 'lucide-react'
import { TourCard } from '@/components/tour-card'
import { useI18n } from '@/components/use-i18n'
import { localizeCategory, localizeTour } from '@/lib/i18n'
import { TOUR_CATEGORIES, type Tour, type TourCategory } from '@/lib/tours'
import { useCart } from '@/components/cart/cart-context'

interface TourCatalogProps {
  tours: Tour[]
  initialQuery?: string
  initialCategory?: string
  initialDestination?: string
  initialDate?: string
}

export function CatalogHero() {
  const { t } = useI18n()

  return (
    <section className="bg-ocean-deep px-4 pb-20 pt-32 text-white sm:px-6 lg:px-10 lg:pb-24 lg:pt-40">
      <div className="mx-auto max-w-[1440px]">
        <p className="text-xs font-semibold uppercase tracking-[0.24em] text-turquoise">
          {t('catalog.eyebrow')}
        </p>
        <h1 className="mt-4 max-w-4xl font-display text-[clamp(2.5rem,6vw,5rem)] font-bold leading-[0.98] tracking-tight text-balance">
          {t('catalog.title')}
        </h1>
        <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/75 sm:text-lg">
          {t('catalog.subtitle')}
        </p>
      </div>
    </section>
  )
}

export function TourCatalog({
  tours,
  initialQuery = '',
  initialCategory = '',
  initialDestination = '',
  initialDate = '',
}: TourCatalogProps) {
  const { language, t } = useI18n()
  const { currency } = useCart()
  const [sort, setSort] = useState('recommended')
  const [query, setQuery] = useState(initialQuery)
  const [category, setCategory] = useState<TourCategory | ''>(
    TOUR_CATEGORIES.includes(initialCategory as TourCategory)
      ? (initialCategory as TourCategory)
      : '',
  )
  const [destination, setDestination] = useState(initialDestination)
  const [date, setDate] = useState(initialDate)

  const availableCategories = useMemo(
    () =>
      TOUR_CATEGORIES.filter((item) =>
        tours.some((tour) => tour.category === item),
      ),
    [tours],
  )

  const destinations = useMemo(
    () => [...new Set(tours.map((tour) => tour.location))].sort(),
    [tours],
  )

  const filtered = useMemo(() => {
    const term = query.trim().toLocaleLowerCase()

    const result = tours.filter((tour) => {
      const localized = localizeTour(tour, language)
      const searchable = [
        localized.title,
        localized.shortDescription,
        localized.location,
        localizeCategory(tour.category, language),
      ]
        .join(' ')
        .toLocaleLowerCase()

      return (
        (!term || searchable.includes(term)) &&
        (!category || tour.category === category) &&
        (!destination || tour.location === destination) &&
        (!date || tour.availableDates.includes(date))
      )
    })
    return result.sort((a, b) =>
      sort === 'price-low'
        ? a.retailPrice[currency === 'MXN' ? 'mxn' : 'usd'] -
          b.retailPrice[currency === 'MXN' ? 'mxn' : 'usd']
        : sort === 'price-high'
          ? b.retailPrice[currency === 'MXN' ? 'mxn' : 'usd'] -
            a.retailPrice[currency === 'MXN' ? 'mxn' : 'usd']
          : sort === 'rating'
            ? b.rating - a.rating
            : Number(b.popular) - Number(a.popular),
    )
  }, [category, date, destination, language, query, tours, sort, currency])

  useEffect(() => {
    const params = new URLSearchParams()
    if (query) params.set('q', query)
    if (category) params.set('category', category)
    if (destination) params.set('destination', destination)
    if (date) params.set('date', date)
    const url = `/tours${params.size ? `?${params}` : ''}`
    const timer = setTimeout(() => {
      window.history.replaceState(null, '', url)
    }, 250)
    return () => clearTimeout(timer)
  }, [query, category, destination, date])

  function clearFilters() {
    setQuery('')
    setCategory('')
    setDestination('')
    setDate('')
  }

  const hasFilters = Boolean(query || category || destination || date)

  return (
    <section className="pb-20 md:pb-28">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="-mt-8 relative z-10 rounded-2xl border border-border bg-card p-4 shadow-xl shadow-charcoal/5 md:p-5">
          <div className="grid gap-3 md:grid-cols-[1fr_220px_180px_auto] md:items-end">
            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('catalog.search')}
              </span>
              <span className="flex h-12 items-center gap-3 rounded-xl border border-input bg-background px-4 focus-within:ring-2 focus-within:ring-ring/40">
                <Search
                  className="size-4.5 shrink-0 text-muted-foreground"
                  aria-hidden="true"
                />
                <input
                  type="search"
                  value={query}
                  onChange={(event) => setQuery(event.target.value)}
                  placeholder={t('catalog.searchPlaceholder')}
                  className="min-w-0 flex-1 bg-transparent text-sm outline-none placeholder:text-muted-foreground"
                />
              </span>
            </label>

            <label className="block">
              <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.16em] text-muted-foreground">
                {t('catalog.destination')}
              </span>
              <select
                value={destination}
                onChange={(event) => setDestination(event.target.value)}
                className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm outline-none focus:ring-2 focus:ring-ring/40"
              >
                <option value="">{t('catalog.anyDestination')}</option>
                {destinations.map((item) => (
                  <option key={item} value={item}>
                    {item}
                  </option>
                ))}
              </select>
            </label>

            <label className="field">
              <span>
                {language === 'ES' ? 'Fecha de tu tour' : 'Tour date'}
              </span>
              <input
                type="date"
                value={date}
                onChange={(event) => setDate(event.target.value)}
              />
            </label>
            {hasFilters && (
              <button
                type="button"
                onClick={clearFilters}
                className="inline-flex h-12 items-center justify-center gap-2 rounded-xl px-4 text-sm font-semibold text-ocean transition-colors hover:bg-muted"
              >
                <X className="size-4" aria-hidden="true" />
                {t('catalog.clear')}
              </button>
            )}
          </div>

          <div
            className="mt-4 flex items-center gap-2 overflow-x-auto pb-1 no-scrollbar"
            role="group"
            aria-label={t('nav.categories')}
          >
            <SlidersHorizontal
              className="mr-1 size-4 shrink-0 text-muted-foreground"
              aria-hidden="true"
            />
            <button
              type="button"
              onClick={() => setCategory('')}
              aria-pressed={!category}
              className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                !category
                  ? 'bg-ocean text-white'
                  : 'bg-muted text-muted-foreground hover:text-foreground'
              }`}
            >
              {t('catalog.all')}
            </button>
            {availableCategories.map((item) => (
              <button
                key={item}
                type="button"
                onClick={() => setCategory(item)}
                aria-pressed={category === item}
                className={`shrink-0 rounded-full px-4 py-2 text-sm font-semibold transition-colors ${
                  category === item
                    ? 'bg-ocean text-white'
                    : 'bg-muted text-muted-foreground hover:text-foreground'
                }`}
              >
                {localizeCategory(item, language)}
              </button>
            ))}
          </div>
        </div>

        <div className="mt-10 flex flex-wrap items-center justify-between gap-4">
          <p className="text-sm font-semibold text-foreground" role="status">
            {t('catalog.count', { count: filtered.length })}
          </p>
          <label className="flex items-center gap-3 text-sm text-muted-foreground">
            {language === 'ES' ? 'Ordenar por' : 'Sort by'}
            <select
              className="rounded-lg border bg-white p-2 text-foreground"
              value={sort}
              onChange={(e) => setSort(e.target.value)}
            >
              <option value="recommended">
                {language === 'ES' ? 'Recomendados' : 'Recommended'}
              </option>
              <option value="price-low">
                {language === 'ES' ? 'Menor precio' : 'Lowest price'}
              </option>
              <option value="price-high">
                {language === 'ES' ? 'Mayor precio' : 'Highest price'}
              </option>
              <option value="rating">
                {language === 'ES' ? 'Mejor valorados' : 'Best rated'}
              </option>
            </select>
          </label>
          {date && (
            <p className="rounded-full bg-sand px-3 py-1.5 text-xs font-semibold text-foreground">
              {date}
            </p>
          )}
        </div>

        {filtered.length ? (
          <div className="mt-5 grid gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {filtered.map((tour, index) => (
              <TourCard key={tour.id} tour={tour} eager={index === 0} />
            ))}
          </div>
        ) : (
          <div className="mt-8 rounded-3xl border border-dashed border-border bg-secondary/40 px-6 py-20 text-center">
            <h2 className="font-display text-2xl font-bold text-foreground">
              {t('catalog.noResults')}
            </h2>
            <p className="mx-auto mt-2 max-w-md text-muted-foreground">
              {t('catalog.noResultsBody')}
            </p>
            <button
              type="button"
              onClick={clearFilters}
              className="mt-6 rounded-full bg-ocean px-6 py-3 text-sm font-semibold text-white"
            >
              {t('catalog.clear')}
            </button>
          </div>
        )}
      </div>
    </section>
  )
}
