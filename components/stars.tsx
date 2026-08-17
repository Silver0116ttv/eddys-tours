import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface StarsProps {
  rating: number
  className?: string
  size?: number
  showValue?: boolean
}

export function Stars({ rating, className, size = 14, showValue = false }: StarsProps) {
  return (
    <span className={cn('inline-flex items-center gap-0.5', className)} aria-label={`${rating} out of 5 stars`}>
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
