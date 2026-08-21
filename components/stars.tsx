'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/use-i18n'

interface StarsProps {
  rating: number
  className?: string
  size?: number
  showValue?: boolean
}

export function Stars({ rating, className, size = 14, showValue = false }: StarsProps) {
  const { t } = useI18n()
  return (
    <span
      role="img"
      aria-label={t('stars.rating', { rating })}
      className={cn('inline-flex items-center gap-0.5', className)}
    >
      {Array.from({ length: 5 }).map((_, i) => {
        const filled = i < Math.round(rating)
        return (
          <Star
            key={i}
            style={{ width: size, height: size }}
            className={cn(filled ? 'fill-sunset text-sunset' : 'fill-transparent text-muted-foreground/40')}
            aria-hidden="true"
          />
        )
      })}
      {showValue && <span className="ml-1 text-sm font-medium text-foreground">{rating.toFixed(1)}</span>}
    </span>
  )
}
