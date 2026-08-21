'use client'

import Image from 'next/image'
import { motion, useReducedMotion } from 'motion/react'
import { HeroSearch } from '@/components/hero-search'
import { useI18n } from '@/components/use-i18n'

export function Hero() {
  const reduce = useReducedMotion()
  const { t } = useI18n()

  const rise = (delay: number) => ({
    initial: reduce ? { opacity: 0 } : { opacity: 0, y: 24 },
    animate: { opacity: 1, y: 0 },
    transition: { duration: 0.7, delay, ease: [0.22, 1, 0.36, 1] as const },
  })

  return (
    <section id="top" className="relative flex min-h-[88svh] flex-col justify-end md:min-h-[100svh]">
      {/*
        * Only the artwork is clipped. Putting `overflow-hidden` on the section
        * itself would also clip anything the content opens downward — the
        * search bar sits at the bottom edge, so its date picker was being cut
        * off at the fold.
        */}
      <div className="absolute inset-0 overflow-hidden">
        <Image
          src="/images/hero.webp"
        alt={t('hero.alt')}
          fill
          priority
          sizes="100vw"
          className="object-cover"
        />
        {/* legibility overlays */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/25 to-black/40" />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
      </div>

      <div className="relative mx-auto w-full max-w-[1440px] px-4 pb-10 pt-28 sm:px-6 lg:px-10 lg:pb-16">
        <div className="max-w-2xl">
          <motion.p
            {...rise(0.1)}
            className="mb-4 text-xs font-semibold uppercase tracking-[0.28em] text-white/80"
          >
            {t('hero.kicker')}
          </motion.p>
          <motion.h1
            {...rise(0.2)}
            className="font-display text-[clamp(2.5rem,7vw,5rem)] font-bold leading-[0.98] tracking-tight text-balance text-white"
          >
            {t('hero.title')}
          </motion.h1>
          <motion.p
            {...rise(0.35)}
            className="mt-5 max-w-xl text-pretty text-base leading-relaxed text-white/85 sm:text-lg"
          >
            {t('hero.body')}
          </motion.p>

          <motion.div {...rise(0.5)} className="mt-8 flex flex-wrap items-center gap-3">
            <a
              href="#tours"
              className="inline-flex items-center justify-center rounded-full bg-sunset-deep px-7 py-3.5 text-sm font-semibold text-white shadow-lg transition-transform hover:scale-[1.03] active:scale-95"
            >
              {t('nav.explore')}
            </a>
            <a
              href="#tours"
              className="inline-flex items-center justify-center rounded-full border border-white/40 bg-white/10 px-7 py-3.5 text-sm font-semibold text-white backdrop-blur-sm transition-colors hover:bg-white/20"
            >
              {t('hero.available')}
            </a>
          </motion.div>
        </div>

        <motion.div
          {...rise(0.65)}
          className="mt-10 max-w-4xl lg:mt-14"
        >
          <HeroSearch />
        </motion.div>
      </div>
    </section>
  )
}
