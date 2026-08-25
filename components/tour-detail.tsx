'use client'

import { useMemo, useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import {
  ArrowLeft,
  BadgeCheck,
  Check,
  Clock,
  MapPin,
  Minus,
  Plus,
  ShieldCheck,
  Users,
  X,
} from 'lucide-react'
import { useCart, type PaymentType } from '@/components/cart/cart-context'
import { Stars } from '@/components/stars'
import { TourCard } from '@/components/tour-card'
import { useI18n } from '@/components/use-i18n'
import { localizeCategory, localizeReview, localizeTour } from '@/lib/i18n'
import { formatPrice, reviews, scalePrice, type Tour } from '@/lib/tours'

function formatTourDate(iso: string, locale: string) {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return iso
  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function TourDetail({ tour, related }: { tour: Tour; related: Tour[] }) {
  const { addItem, currency } = useCart()
  const { language, locale, t } = useI18n()
  const displayTour = localizeTour(tour, language)
  const [date, setDate] = useState(tour.availableDates[0] ?? '')
  const [time, setTime] = useState(tour.availableTimes[0] ?? '')
  const [adults, setAdults] = useState(2)
  const [paymentType, setPaymentType] = useState<PaymentType>('deposit')

  const total = scalePrice(tour.retailPrice, adults)
  const deposit = scalePrice(tour.deposit, adults)
  const dueToday = paymentType === 'deposit' ? deposit : total
  const tourReviews = useMemo(
    () => reviews.filter((review) => review.tourId === tour.id),
    [tour.id],
  )

  function addConfiguredTour() {
    addItem(tour, { date, time, adults, paymentType })
  }

  return (
    <>
      <section className="relative min-h-[66svh] overflow-hidden bg-charcoal pt-20 md:min-h-[72svh]">
        <Image
          src={tour.images[0] ?? '/placeholder.svg'}
          alt={displayTour.title}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-black/30" />

        <div className="relative mx-auto flex min-h-[calc(66svh-5rem)] max-w-[1440px] flex-col justify-between px-4 pb-10 pt-8 sm:px-6 md:min-h-[calc(72svh-5rem)] md:pb-14 lg:px-10">
          <Link
            href="/tours"
            className="inline-flex w-fit items-center gap-2 rounded-full border border-white/30 bg-black/20 px-4 py-2 text-sm font-semibold text-white backdrop-blur-md transition-colors hover:bg-black/35"
          >
            <ArrowLeft className="size-4" aria-hidden="true" />
            {t('detail.back')}
          </Link>

          <div className="max-w-4xl">
            <div className="mb-4 flex flex-wrap items-center gap-2">
              <span className="rounded-full bg-white/90 px-3 py-1 text-xs font-bold uppercase tracking-[0.14em] text-charcoal">
                {localizeCategory(tour.category, language)}
              </span>
              <span className="rounded-full bg-black/25 px-3 py-1 text-xs font-semibold text-white backdrop-blur-sm">
                {t('detail.spots', { count: tour.availableSpots })}
              </span>
            </div>
            <h1 className="font-display text-[clamp(2.6rem,7vw,5.5rem)] font-bold leading-[0.94] tracking-tight text-balance text-white">
              {displayTour.title}
            </h1>
            <p className="mt-5 max-w-2xl text-base leading-relaxed text-white/85 sm:text-lg">
              {displayTour.shortDescription}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3 text-sm font-medium text-white/90">
              <span className="inline-flex items-center gap-2">
                <Stars rating={tour.rating} />
                {tour.rating.toFixed(1)} · {tour.reviewsCount} {t('common.reviews')}
              </span>
              <span className="inline-flex items-center gap-2">
                <Clock className="size-4" aria-hidden="true" />
                {displayTour.duration}
              </span>
              <span className="inline-flex items-center gap-2">
                <MapPin className="size-4" aria-hidden="true" />
                {displayTour.location}
              </span>
            </div>
          </div>
        </div>
      </section>

      <section className="py-12 md:py-20">
        <div className="mx-auto grid max-w-[1440px] gap-10 px-4 sm:px-6 lg:grid-cols-[minmax(0,1fr)_380px] lg:gap-16 lg:px-10">
          <div className="min-w-0">
            <p className="text-sm font-semibold text-ocean">
              {t('detail.operator', { name: tour.providerName })}
            </p>
            <h2 className="mt-3 font-display text-3xl font-bold tracking-tight text-foreground">
              {t('detail.about')}
            </h2>
            <p className="mt-5 max-w-3xl text-base leading-8 text-muted-foreground">
              {displayTour.fullDescription}
            </p>

            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              <section className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {t('detail.included')}
                </h3>
                <ul className="mt-4 space-y-3">
                  {displayTour.includedItems.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <Check className="mt-0.5 size-4 shrink-0 text-jungle" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl border border-border bg-card p-6">
                <h3 className="font-display text-lg font-bold text-foreground">
                  {t('detail.notIncluded')}
                </h3>
                <ul className="mt-4 space-y-3">
                  {displayTour.excludedItems.map((item) => (
                    <li key={item} className="flex gap-3 text-sm leading-relaxed text-muted-foreground">
                      <X className="mt-0.5 size-4 shrink-0 text-sunset-deep" aria-hidden="true" />
                      {item}
                    </li>
                  ))}
                </ul>
              </section>
            </div>

            <div className="mt-4 grid gap-4 sm:grid-cols-2">
              <section className="rounded-2xl bg-secondary/60 p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                  <ShieldCheck className="size-5 text-ocean" aria-hidden="true" />
                  {t('detail.requirements')}
                </h3>
                <ul className="mt-4 space-y-2 text-sm leading-relaxed text-muted-foreground">
                  {displayTour.requirements.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </section>

              <section className="rounded-2xl bg-secondary/60 p-6">
                <h3 className="flex items-center gap-2 font-display text-lg font-bold text-foreground">
                  <MapPin className="size-5 text-ocean" aria-hidden="true" />
                  {t('detail.meeting')}
                </h3>
                <p className="mt-4 text-sm leading-relaxed text-muted-foreground">
                  {displayTour.meetingPoint}
                </p>
              </section>
            </div>

            {tourReviews.length > 0 && (
              <section className="mt-12 border-t border-border pt-10">
                <h2 className="font-display text-3xl font-bold tracking-tight text-foreground">
                  {tour.rating.toFixed(1)} · {tour.reviewsCount} {t('common.reviews')}
                </h2>
                <div className="mt-6 grid gap-4 sm:grid-cols-2">
                  {tourReviews.map((sourceReview) => {
                    const review = localizeReview(sourceReview, language)
                    return (
                      <figure key={review.id} className="rounded-2xl border border-border bg-card p-6">
                        <Stars rating={review.rating} />
                        <blockquote className="mt-4 leading-relaxed text-muted-foreground">
                          “{review.content}”
                        </blockquote>
                        <figcaption className="mt-5 flex items-center gap-2 text-sm font-semibold text-foreground">
                          {review.customerName}
                          <BadgeCheck className="size-4 text-ocean" aria-label={t('reviews.verified')} />
                        </figcaption>
                      </figure>
                    )
                  })}
                </div>
              </section>
            )}
          </div>

          <aside className="lg:sticky lg:top-28 lg:self-start">
            <div className="rounded-3xl border border-border bg-card p-5 shadow-xl shadow-charcoal/8 sm:p-6">
              <div className="flex items-end justify-between gap-4 border-b border-border pb-5">
                <div>
                  <p className="text-xs text-muted-foreground">{t('common.from')}</p>
                  <p className="font-display text-2xl font-bold text-foreground">
                    {formatPrice(tour.retailPrice, currency)}
                  </p>
                </div>
                <p className="text-xs text-muted-foreground">/ {t('common.person')}</p>
              </div>

              <h2 className="mt-5 font-display text-xl font-bold text-foreground">
                {t('detail.book')}
              </h2>

              <div className="mt-5 grid gap-4 sm:grid-cols-2 lg:grid-cols-1">
                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('detail.date')}
                  </span>
                  <select
                    value={date}
                    onChange={(event) => setDate(event.target.value)}
                    className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    {tour.availableDates.map((item) => (
                      <option key={item} value={item}>
                        {formatTourDate(item, locale)}
                      </option>
                    ))}
                  </select>
                </label>

                <label className="block">
                  <span className="mb-2 block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('detail.time')}
                  </span>
                  <select
                    value={time}
                    onChange={(event) => setTime(event.target.value)}
                    className="h-12 w-full rounded-xl border border-input bg-background px-4 text-sm font-medium outline-none focus:ring-2 focus:ring-ring/40"
                  >
                    {tour.availableTimes.map((item) => (
                      <option key={item} value={item}>{item}</option>
                    ))}
                  </select>
                </label>
              </div>

              <div className="mt-4 flex items-center justify-between rounded-xl border border-input px-4 py-3">
                <span>
                  <span className="block text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                    {t('detail.travelers')}
                  </span>
                  <span className="mt-1 flex items-center gap-1.5 text-sm font-medium text-foreground">
                    <Users className="size-4" aria-hidden="true" /> {adults}
                  </span>
                </span>
                <span className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setAdults((value) => Math.max(1, value - 1))}
                    disabled={adults <= 1}
                    className="grid size-9 place-items-center rounded-full border border-border text-foreground disabled:opacity-35"
                    aria-label={language === 'ES' ? 'Quitar viajero' : 'Remove traveler'}
                  >
                    <Minus className="size-4" aria-hidden="true" />
                  </button>
                  <button
                    type="button"
                    onClick={() => setAdults((value) => Math.min(tour.availableSpots, value + 1))}
                    disabled={adults >= tour.availableSpots}
                    className="grid size-9 place-items-center rounded-full border border-border text-foreground disabled:opacity-35"
                    aria-label={language === 'ES' ? 'Agregar viajero' : 'Add traveler'}
                  >
                    <Plus className="size-4" aria-hidden="true" />
                  </button>
                </span>
              </div>

              <fieldset className="mt-5">
                <legend className="text-xs font-semibold uppercase tracking-[0.14em] text-muted-foreground">
                  {t('detail.payment')}
                </legend>
                <div className="mt-2 grid grid-cols-2 gap-2">
                  {(['deposit', 'full'] as const).map((option) => (
                    <label
                      key={option}
                      className={`cursor-pointer rounded-xl border p-3 text-sm font-semibold transition-colors ${
                        paymentType === option
                          ? 'border-ocean bg-ocean/5 text-ocean'
                          : 'border-border text-muted-foreground hover:text-foreground'
                      }`}
                    >
                      <input
                        type="radio"
                        name="payment"
                        value={option}
                        checked={paymentType === option}
                        onChange={() => setPaymentType(option)}
                        className="sr-only"
                      />
                      {option === 'deposit' ? t('detail.deposit') : t('detail.full')}
                    </label>
                  ))}
                </div>
              </fieldset>

              <dl className="mt-5 space-y-2 border-t border-border pt-5 text-sm">
                <div className="flex items-center justify-between gap-4 text-muted-foreground">
                  <dt>{t('detail.tripTotal')}</dt>
                  <dd>{formatPrice(total, currency)}</dd>
                </div>
                <div className="flex items-center justify-between gap-4 font-bold text-foreground">
                  <dt>{t('detail.dueToday')}</dt>
                  <dd>{formatPrice(dueToday, currency)}</dd>
                </div>
              </dl>

              <button
                type="button"
                onClick={addConfiguredTour}
                disabled={!date || !time}
                className="mt-5 inline-flex h-13 w-full items-center justify-center gap-2 rounded-full bg-sunset-deep px-6 text-sm font-bold text-white shadow-sm transition-transform hover:scale-[1.02] active:scale-[0.98] disabled:opacity-50"
              >
                <Plus className="size-4" aria-hidden="true" />
                {t('detail.add')}
              </button>
              <p className="mt-3 flex items-start justify-center gap-2 text-center text-xs leading-relaxed text-muted-foreground">
                <ShieldCheck className="mt-0.5 size-3.5 shrink-0" aria-hidden="true" />
                {t('detail.secure')}
              </p>
            </div>
          </aside>
        </div>
      </section>

      {related.length > 0 && (
        <section className="bg-secondary/45 py-16 md:py-24">
          <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
            <h2 className="font-display text-3xl font-bold tracking-tight text-foreground md:text-4xl">
              {t('detail.related')}
            </h2>
            <p className="mt-2 max-w-2xl text-muted-foreground">{t('detail.relatedBody')}</p>
            <div className="mt-8 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item) => (
                <TourCard key={item.id} tour={item} />
              ))}
            </div>
          </div>
        </section>
      )}
    </>
  )
}
