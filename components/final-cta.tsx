'use client'

import Image from 'next/image'
import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { useI18n } from '@/components/use-i18n'

export function FinalCta() {
  const [email, setEmail] = useState("")
  const [submitted, setSubmitted] = useState(false)
  const { t } = useI18n()

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
        <div className="absolute inset-0 bg-foreground/55" />
      </div>

      <div className="relative mx-auto max-w-[1440px] px-4 py-24 sm:px-6 md:py-32 lg:px-10">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="font-display text-4xl leading-tight text-background text-balance md:text-6xl">
            {t('cta.title')}
          </h2>
          <p className="mx-auto mt-5 max-w-lg leading-relaxed text-background/85 text-pretty">
            {t('cta.body')}
          </p>

          {submitted ? (
            <p className="mt-8 font-medium text-background" role="status">
              {t('cta.success')}
            </p>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                if (email.trim()) setSubmitted(true)
              }}
              className="mx-auto mt-8 flex w-full max-w-md flex-col gap-3 sm:flex-row"
            >
              <label htmlFor="cta-email" className="sr-only">
                {t('cta.email')}
              </label>
              <input
                id="cta-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                className="h-12 flex-1 rounded-full border border-background/30 bg-background/95 px-5 text-foreground outline-none ring-primary placeholder:text-muted-foreground focus:ring-2"
              />
              <Button type="submit" size="lg" className="h-12 rounded-full px-8">
                {t('cta.submit')}
              </Button>
            </form>
          )}
        </div>
      </div>
    </section>
  )
}
