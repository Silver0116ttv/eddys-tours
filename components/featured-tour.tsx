"use client"

import Image from "next/image"
import { Button } from "@/components/ui/button"
import { Stars } from "@/components/stars"
import { formatPrice, type Tour } from "@/lib/tours"
import { useCart } from "@/components/cart/cart-context"
import { Check, Clock, MapPin } from "lucide-react"

export function FeaturedTour({ tours }: { tours: Tour[] }) {
  const { addItem, currency } = useCart()
  const tour = tours.find((t) => t.featured) ?? tours[0]

  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src={tour.images[0] || "/placeholder.svg"}
          alt={tour.title}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30 md:to-transparent" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 py-20 sm:px-6 md:py-28 lg:px-10 lg:py-36">
        <div className="max-w-xl">
          <span className="inline-flex items-center rounded-full bg-primary px-3 py-1 font-mono text-xs uppercase tracking-[0.2em] text-primary-foreground">
            Featured trip
          </span>
          <h2 className="mt-5 font-serif text-4xl leading-[1.05] text-foreground text-balance md:text-6xl">
            {tour.title}
          </h2>

          <div className="mt-4 flex flex-wrap items-center gap-x-5 gap-y-2 text-sm text-muted-foreground">
            <span className="flex items-center gap-1.5">
              <Stars rating={tour.rating} />
              <span className="font-medium text-foreground">{tour.rating.toFixed(1)}</span>
              <span>({tour.reviewsCount})</span>
            </span>
            <span className="flex items-center gap-1.5">
              <MapPin className="size-4" />
              {tour.location}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="size-4" />
              {tour.duration}
            </span>
          </div>

          <p className="mt-5 max-w-md leading-relaxed text-muted-foreground text-pretty">
            {tour.fullDescription}
          </p>

          <ul className="mt-6 grid gap-2 sm:grid-cols-2">
            {tour.includedItems.slice(0, 4).map((item) => (
              <li key={item} className="flex items-center gap-2 text-sm text-foreground">
                <Check className="size-4 shrink-0 text-primary" />
                {item}
              </li>
            ))}
          </ul>

          <div className="mt-8 flex flex-wrap items-center gap-5">
            <Button size="lg" onClick={() => addItem(tour)} className="rounded-full">
              Add to trip
            </Button>
            <div className="text-sm text-muted-foreground">
              <span className="text-2xl font-semibold text-foreground">
                {formatPrice(tour.retailPriceUSD, currency, tour.retailPriceMXN)}
              </span>{" "}
              / person
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
