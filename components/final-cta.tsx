'use client'

import Image from 'next/image'
import Link from 'next/link'
import { useI18n } from '@/components/use-i18n'

export function FinalCta() {
  const { language, t } = useI18n()
  const es = language === 'ES'
  return (
    <section className="relative overflow-hidden">
      <div className="absolute inset-0">
        <Image
          src="/images/final-cta.webp"
          alt={t('cta.alt')}
          fill
          sizes="100vw"
          className="object-cover"
        />
        <div className="absolute inset-0 bg-foreground/60" />
      </div>
      <div className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-6 md:py-32 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl font-semibold leading-tight text-white text-balance md:text-6xl">
            {es
              ? 'Tu próximo gran recuerdo está aquí.'
              : 'Your next great memory starts here.'}
          </h2>
          <p className="mx-auto mt-5 max-w-lg leading-7 text-white/85">
            {es
              ? 'Encuentra tu experiencia favorita o deja que nuestro equipo local te ayude a planear el viaje.'
              : 'Find your favorite experience or let our local team help you plan your trip.'}
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link href="/tours" className="action-primary bg-sunset-deep!">
              {es ? 'Explorar experiencias' : 'Explore experiences'}
            </Link>
            <Link href="/contact" className="action-secondary">
              {es ? 'Ayúdame a planear' : 'Help me plan'}
            </Link>
          </div>
        </div>
      </div>
    </section>
  )
}
