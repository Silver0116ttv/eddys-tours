'use client'

import Image from 'next/image'
import Link from 'next/link'
import { ArrowUpRight } from 'lucide-react'
import { destinations } from '@/lib/tours'
import { SectionHeading } from '@/components/section-heading'
import { useI18n } from '@/components/use-i18n'
import { localizeDestinationDescription } from '@/lib/i18n'

export function DestinationsSection() {
  const { language, t } = useI18n()
  return (
    <section id="destinations" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow={t('destination.eyebrow')}
          title={t('destination.title')}
          subtitle={t('destination.subtitle')}
        />

        <div className="mt-8 grid grid-cols-2 gap-4 md:mt-10 md:grid-cols-3 lg:gap-6">
          {destinations.map((destination) => (
            <Link
              key={destination.slug}
              href={`/tours?destination=${encodeURIComponent(destination.name)}`}
              className="group relative flex aspect-4/5 flex-col justify-end overflow-hidden rounded-2xl md:aspect-4/3"
            >
              <Image
                src={destination.image}
                alt=""
                fill
                sizes="(max-width: 768px) 50vw, 33vw"
                className="object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent" />
              <div className="relative p-4 md:p-6">
                <div className="flex items-center gap-1.5">
                  <h3 className="font-display text-lg leading-tight font-semibold text-balance text-white md:text-2xl">
                    {destination.name}
                  </h3>
                  <ArrowUpRight className="size-5 shrink-0 text-white opacity-0 transition-opacity group-hover:opacity-100" />
                </div>
                <p className="mt-1 hidden text-sm leading-relaxed text-white/80 md:block">
                  {localizeDestinationDescription(destination.slug, destination.description, language)}
                </p>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  )
}
