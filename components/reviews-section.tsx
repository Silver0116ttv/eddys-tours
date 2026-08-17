"use client"

import { reviews, getTourById } from "@/lib/tours"
import { Stars } from "@/components/stars"
import { BadgeCheck } from "lucide-react"

export function ReviewsSection() {
  return (
    <section className="bg-foreground py-16 text-background md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <div className="max-w-2xl">
          <span className="font-mono text-xs uppercase tracking-[0.25em] text-primary">
            Loved by travelers
          </span>
          <h2 className="mt-4 font-serif text-4xl leading-tight text-balance md:text-5xl">
            4.9 average from 900+ verified trips
          </h2>
          <p className="mt-4 leading-relaxed text-background/70 text-pretty">
            Every review comes from a real, completed booking. No fakes, no filler.
          </p>
        </div>

        <div className="mt-10 grid gap-4 md:mt-14 md:grid-cols-2 lg:grid-cols-3 lg:gap-6">
          {reviews.map((review) => {
            const tour = getTourById(review.tourId)
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
                      <span className="flex items-center gap-1 text-xs font-normal text-primary">
                        <BadgeCheck className="size-4" />
                        Verified
                      </span>
                    )}
                  </div>
                  <div className="mt-0.5 text-sm text-background/60">
                    {review.customerLocation}
                    {tour ? ` · ${tour.title}` : ""}
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
