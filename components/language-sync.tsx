'use client'

import { useEffect } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { localeFor, translate } from '@/lib/i18n'

export function LanguageSync() {
  const { language } = useCart()
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key)

  useEffect(() => {
    const spanish = language === 'ES'
    document.documentElement.lang = spanish ? 'es-MX' : 'en'
    document.title = spanish
      ? "Eddy's Tours — Tours y experiencias en Puerto Vallarta, México"
      : "Eddy's Tours — Tours & Experiences in Puerto Vallarta, Mexico"

    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]')
    description?.setAttribute(
      'content',
      spanish
        ? 'Descubre experiencias inolvidables en Puerto Vallarta y la Bahía de Banderas.'
        : 'Discover unforgettable experiences across Puerto Vallarta and the Bay of Banderas.',
    )
  }, [language])

  return (
    <a
      href="#main"
      lang={localeFor(language)}
      className="sr-only focus:not-sr-only focus:fixed focus:top-4 focus:left-4 focus:z-100 focus:rounded-full focus:bg-background focus:px-5 focus:py-3 focus:text-sm focus:font-semibold focus:text-foreground focus:shadow-lg focus:outline-2 focus:outline-ring"
    >
      {t('skip.content')}
    </a>
  )
}
