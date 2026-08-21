'use client'

import { BadgeCheck } from 'lucide-react'
import { reviews, type Tour } from '@/lib/tours'
import { Stars } from '@/components/stars'
import { useI18n } from '@/components/use-i18n'
import { localizeReview, localizeTour } from '@/lib/i18n'

export function ReviewsSection({ tours }: { tours: Tour[] }) {
  const { language, t } = useI18n()
  const titleByTourId = new Map(tours.map((tour) => [tour.id, localizeTour(tour, language).title]))
  const averageRating =
    reviews.reduce((sum, review) => sum + review.rating, 0) / (reviews.length || 1)

  return (
    <section id="reviews" className="scroll-mt-24 bg-foreground py-16 text-background md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <p className="font-mono text-xs tracking-[0.25em] uppercase text-turquoise">
            {t('reviews.eyebrow')}
          </p>
          <h2 className="mt-4 font-display text-4xl leading-tight text-balance md:text-5xl">
            {t('reviews.title', { rating: averageRating.toFixed(1) })}
          </h2>
          <p className="mt-4 leading-relaxed text-pretty text-background/70">
            {t('reviews.subtitle')}
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {reviews.map((sourceReview) => {
            const review = localizeReview(sourceReview, language)
            const tourTitle = titleByTourId.get(review.tourId)

            return (
              <figure
                key={review.id}
                className="flex flex-col gap-4 rounded-2xl bg-background/5 p-6 ring-1 ring-background/10 backdrop-blur"
              >
                <Stars rating={review.rating} />
                <blockquote className="flex-1 leading-relaxed text-background/90">
                  &ldquo;{review.content}&rdquo;
                </blockquote>
                <figcaption className="border-t border-background/10 pt-4">
                  <div className="flex items-center gap-1.5 font-medium">
                    {review.customerName}
                    {review.verified && (
                      <span className="flex items-center gap-1 text-xs font-normal text-turquoise">
                        <BadgeCheck className="size-4" />
                        {t('reviews.verified')}
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm text-background/60">
                    {review.customerLocation}
                    {tourTitle ? ` · ${tourTitle}` : ''}
                  </div>
                </figcaption>
              </figure>
            )
          })}
        </div>
      </div>
    </section>
  )
}
