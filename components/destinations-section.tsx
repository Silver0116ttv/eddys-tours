"use client"

import Image from "next/image"
import { destinations } from "@/lib/tours"
import { SectionHeading } from "@/components/section-heading"
import { ArrowUpRight } from "lucide-react"

export function DestinationsSection() {
  return (
    <section id="destinations" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="Explore the region"
          title="Destinations along the bay"
          subtitle="From the cobblestones of old town to car-free villages you can only reach by boat."
        />

        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:grid-cols-3 lg:gap-6">
          {destinations.map((dest) => (
            <a
              key={dest.slug}
              href={`#tours`}
              className="group relative flex aspect-[4/5] flex-col justify-end overflow-hidden rounded-2xl md:aspect-[4/3]"
            >
              <Image
                src={dest.image || "/placeholder.svg"}
                alt={dest.name}
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="relative p-4 md:p-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-serif text-lg leading-tight text-white text-balance md:text-2xl">
                    {dest.name}
                  </h3>
                  <ArrowUpRight className="size-5 shrink-0 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 hidden text-sm leading-relaxed text-white/80 md:block">
                  {dest.description}
                </p>
              </div>
            </a>
          ))}
        </div>
      </div>
    </section>
  )
}
