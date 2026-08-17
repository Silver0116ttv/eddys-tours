'use client'

import { useEffect, useRef, useState } from 'react'
import Image from 'next/image'
import { useReducedMotion } from 'motion/react'
import { tours, formatPrice } from '@/lib/tours'
import { useCart } from '@/components/cart/cart-context'
import { cn } from '@/lib/utils'

function StripCard({ tourId }: { tourId: string }) {
  const tour = tours.find((t) => t.id === tourId)!
  const { currency } = useCart()
  return (
    <a
      href="#tours"
      className="group flex w-[220px] shrink-0 items-center gap-3 rounded-xl border border-border bg-card p-2 pr-4 shadow-sm transition-shadow hover:shadow-md"
      draggable={false}
    >
      <span className="relative size-14 shrink-0 overflow-hidden rounded-lg">
        <Image
          src={tour.images[0]}
          alt=""
          fill
          sizes="56px"
          className="object-cover"
          draggable={false}
        />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-semibold text-foreground">{tour.title}</span>
        <span className="mt-0.5 block text-xs text-muted-foreground">
          From{' '}
          <span className="font-semibold text-ocean">
            {formatPrice(tour.retailPriceUSD, currency, tour.retailPriceMXN)}
          </span>
        </span>
      </span>
    </a>
  )
}

export function ToursStrip() {
  const reduce = useReducedMotion()
  const [interacted, setInteracted] = useState(false)
  const scrollRef = useRef<HTMLDivElement>(null)
  const drag = useRef({ active: false, startX: 0, startScroll: 0, moved: false })
  const manual = Boolean(reduce) || interacted

  const stop = () => setInteracted(true)

  // Any first meaningful interaction stops the auto-motion permanently.
  useEffect(() => {
    if (manual) return
    const onScroll = () => stop()
    const opts = { passive: true, once: true } as const
    window.addEventListener('scroll', onScroll, opts)
    window.addEventListener('wheel', onScroll, opts)
    window.addEventListener('touchstart', onScroll, opts)
    window.addEventListener('pointerdown', onScroll, opts)
    return () => {
      window.removeEventListener('scroll', onScroll)
      window.removeEventListener('wheel', onScroll)
      window.removeEventListener('touchstart', onScroll)
      window.removeEventListener('pointerdown', onScroll)
    }
  }, [manual])

  // drag-to-scroll for manual mode
  const onPointerDown = (e: React.PointerEvent) => {
    if (!manual) return
    const el = scrollRef.current
    if (!el) return
    drag.current = { active: true, startX: e.clientX, startScroll: el.scrollLeft, moved: false }
    el.setPointerCapture(e.pointerId)
  }
  const onPointerMove = (e: React.PointerEvent) => {
    if (!drag.current.active || !scrollRef.current) return
    const dx = e.clientX - drag.current.startX
    if (Math.abs(dx) > 4) drag.current.moved = true
    scrollRef.current.scrollLeft = drag.current.startScroll - dx
  }
  const onPointerUp = () => {
    drag.current.active = false
  }

  const items = [...tours, ...tours]

  return (
    <section aria-label="Tours quick browse" className="border-y border-border bg-secondary/50 py-5">
      {!manual ? (
        <div
          className="group relative overflow-hidden"
          onMouseEnter={stop}
          role="marquee"
        >
          {/* edge fades */}
          <div className="pointer-events-none absolute inset-y-0 left-0 z-10 w-16 bg-gradient-to-r from-secondary/80 to-transparent" />
          <div className="pointer-events-none absolute inset-y-0 right-0 z-10 w-16 bg-gradient-to-l from-secondary/80 to-transparent" />
          <div className="flex w-max animate-marquee gap-3 px-3" style={{ ['--marquee-duration' as string]: '55s' }}>
            {items.map((t, i) => (
              <StripCard key={`${t.id}-${i}`} tourId={t.id} />
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
            'cursor-grab active:cursor-grabbing touch-pan-x select-none',
          )}
        >
          {tours.map((t) => (
            <StripCard key={t.id} tourId={t.id} />
          ))}
        </div>
      )}
    </section>
  )
}
