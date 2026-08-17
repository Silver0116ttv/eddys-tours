'use client'

import { useState } from 'react'
import Image from 'next/image'
import { Clock, Heart, MapPin, Plus } from 'lucide-react'
import { type Tour, formatPrice } from '@/lib/tours'
import { useCart } from '@/components/cart/cart-context'
import { Stars } from '@/components/stars'
import { cn } from '@/lib/utils'

export function TourCard({ tour, className }: { tour: Tour; className?: string }) {
  const { addItem, currency } = useCart()
  const [wished, setWished] = useState(false)
  const lowSpots = tour.availableSpots <= 10

  return (
    <article
      className={cn(
        'group flex h-full flex-col overflow-hidden rounded-2xl border border-border bg-card transition-all duration-300 hover:-translate-y-1 hover:shadow-xl',
        className,
      )}
    >
      <div className="relative aspect-[4/3] overflow-hidden">
        <Image
          src={tour.images[0]}
          alt={tour.title}
          fill
          sizes="(max-width: 640px) 80vw, (max-width: 1024px) 45vw, 24vw"
          className="object-cover transition-transform duration-500 group-hover:scale-105"
        />
        <div className="absolute inset-x-0 top-0 flex items-start justify-between p-3">
          <span className="rounded-full bg-white/90 px-2.5 py-1 text-[0.7rem] font-semibold uppercase tracking-wide text-charcoal backdrop-blur-sm">
            {tour.category}
          </span>
          <button
            type="button"
            onClick={() => setWished((w) => !w)}
            aria-label={wished ? 'Remove from wishlist' : 'Add to wishlist'}
            aria-pressed={wished}
            className="grid size-8 place-items-center rounded-full bg-white/90 text-charcoal backdrop-blur-sm transition-colors hover:bg-white"
          >
            <Heart className={cn('size-4', wished && 'fill-sunset text-sunset')} />
          </button>
        </div>
        {lowSpots && (
          <span className="absolute bottom-3 left-3 rounded-full bg-sunset px-2.5 py-1 text-[0.7rem] font-semibold text-white">
            Only {tour.availableSpots} spots left
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col p-4">
        <div className="mb-1.5 flex items-center gap-1.5 text-sm">
          <Stars rating={tour.rating} size={13} />
          <span className="font-semibold text-foreground">{tour.rating.toFixed(1)}</span>
          <span className="text-muted-foreground">· {tour.reviewsCount} reviews</span>
        </div>

        <h3 className="font-display text-base font-semibold leading-snug text-foreground">
          {tour.title}
        </h3>

        <div className="mt-2 flex flex-wrap items-center gap-x-3 gap-y-1 text-xs text-muted-foreground">
          <span className="inline-flex items-center gap-1">
            <Clock className="size-3.5" />
            {tour.duration}
          </span>
          <span className="inline-flex items-center gap-1">
            <MapPin className="size-3.5" />
            {tour.location}
          </span>
        </div>

        <div className="mt-4 flex items-end justify-between border-t border-border pt-3">
          <div>
            <span className="block text-[0.7rem] text-muted-foreground">From</span>
            <span className="font-display text-lg font-bold text-foreground">
              {formatPrice(tour.retailPriceUSD, currency, tour.retailPriceMXN)}
            </span>
          </div>
          <button
            type="button"
            onClick={() => addItem(tour)}
            aria-label={`Add ${tour.title} to your trip`}
            className="inline-flex items-center gap-1.5 rounded-full bg-ocean px-4 py-2 text-sm font-semibold text-white transition-transform hover:scale-[1.04] active:scale-95"
          >
            <Plus className="size-4" />
            Add
          </button>
        </div>
      </div>
    </article>
  )
}
