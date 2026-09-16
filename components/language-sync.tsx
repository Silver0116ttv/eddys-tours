'use client'

import { useEffect } from 'react'
import { usePathname } from 'next/navigation'
import { useCart } from '@/components/cart/cart-context'
import { localeFor, translate } from '@/lib/i18n'

export function LanguageSync() {
  const { language } = useCart()
  const pathname = usePathname()
  const t = (key: Parameters<typeof translate>[1]) => translate(language, key)

  useEffect(() => {
    const spanish = language === 'ES' || pathname.startsWith('/admin')
    document.documentElement.lang = spanish ? 'es-MX' : 'en'
  }, [language, pathname])

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
