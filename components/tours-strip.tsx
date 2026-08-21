'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'motion/react'
import { formatPrice, type Tour } from '@/lib/tours'
import { useCart } from '@/components/cart/cart-context'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/use-i18n'
import { localizeTour } from '@/lib/i18n'

function StripCard({ tour, decorative = false }: { tour: Tour; decorative?: boolean }) {
  const { currency } = useCart()
  const { language, t } = useI18n()
  const displayTour = localizeTour(tour, language)

  return (
    <a
      href="#tours"
      className="group flex w-[220px] shrink-0 items-center gap-3 rounded-xl border border-border bg-card p-2 pr-4 shadow-sm transition-shadow hover:shadow-md"
      draggable={false}
      // The marquee renders the list twice to loop seamlessly; the second pass
      // is a visual duplicate and must not reach assistive tech or the tab order.
      aria-hidden={decorative || undefined}
      tabIndex={decorative ? -1 : undefined}
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={tour.images[0] ?? '/placeholder.svg'}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
          draggable={false}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{displayTour.title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          {t('common.from')}{' '}
          <span className="font-semibold text-ocean">
            {formatPrice(tour.retailPrice, currency)}
          </span>
        </span>
      </span>
    </a>
  )
}

export function ToursStrip({ tours }: { tours: Tour[] }) {
  const { t } = useI18n()
  const reduce = useReducedMotion()
  const [interacted, setInteracted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const manual = Boolean(reduce) || interacted

  // Any first meaningful interaction stops the auto-motion permanently.
  useEffect(() => {
    if (manual) return

    const stop = () => setInteracted(true)
    const options = { passive: true, once: true } as const
    const events = ['scroll', 'wheel', 'touchstart', 'pointerdown'] as const

    events.forEach((event) => window.addEventListener(event, stop, options))
    return () => events.forEach((event) => window.removeEventListener(event, stop))
  }, [manual])

  const onPointerDown = (event: React.PointerEvent) => {
    if (!manual) return
    const element = scrollRef.current
    if (!element) return

    drag.current = {
      active: true,
      startX: event.clientX,
      startScroll: element.scrollLeft,
      moved: false,
    }
    element.setPointerCapture(event.pointerId)
  }

  const onPointerMove = (event: React.PointerEvent) => {
    if (!drag.current.active || !scrollRef.current) return
    const deltaX = event.clientX - drag.current.startX
    if (Math.abs(deltaX) > 4) drag.current.moved = true
    scrollRef.current.scrollLeft = drag.current.startScroll - deltaX
  }

  const onPointerUp = () => {
    drag.current.active = false
  }

  return (
    <section aria-label={t('strip.label')} className="border-y border-border bg-secondary/50 py-5">
      {!manual ? (
        <div className="relative overflow-hidden" onMouseEnter={() => setInteracted(true)}>
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-secondary/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-secondary/80 to-transparent" />
          <div
            className="flex w-max animate-marquee gap-3 px-3"
            style={{ ['--marquee-duration' as string]: '55s' }}
          >
            {tours.map((tour) => (
              <StripCard key={tour.id} tour={tour} />
            ))}
            {tours.map((tour) => (
              <StripCard key={`${tour.id}-loop`} tour={tour} decorative />
            ))}
          </div>
        </div>
      ) : (
        <div
          ref={scrollRef}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={onPointerUp}
          onPointerCancel={onPointerUp}
          className={cn(
            'no-scrollbar flex gap-3 overflow-x-auto px-3 sm:px-4 lg:px-6',
            'cursor-grab touch-pan-x select-none active:cursor-grabbing',
          )}
        >
          {tours.map((tour) => (
            <StripCard key={tour.id} tour={tour} />
          ))}
        </div>
      )}
    </section>
  )
}
