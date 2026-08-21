'use client'

import { useCallback } from 'react'
import { useCart } from '@/components/cart/cart-context'
import { localeFor, translate, type MessageKey } from '@/lib/i18n'

export function useI18n() {
  const { language } = useCart()
  const t = useCallback(
    (key: MessageKey, values?: Record<string, string | number>) =>
      translate(language, key, values),
    [language],
  )

  return {
    language,
    locale: localeFor(language),
    t,
  }
}
