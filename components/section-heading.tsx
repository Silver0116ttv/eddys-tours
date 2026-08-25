import { cn } from '@/lib/utils'
import Link from 'next/link'

interface SectionHeadingProps {
  eyebrow?: string
  title: string
  subtitle?: string
  action?: { label: string; href: string }
  className?: string
  align?: 'left' | 'center'
}

export function SectionHeading({
  eyebrow,
  title,
  subtitle,
  action,
  className,
  align = 'left',
}: SectionHeadingProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-3 md:flex-row md:items-end md:justify-between',
        align === 'center' && 'items-center text-center md:flex-col md:items-center',
        className,
      )}
    >
      <div className={cn('max-w-2xl', align === 'center' && 'mx-auto')}>
        {eyebrow && (
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.22em] text-ocean">
            {eyebrow}
          </p>
        )}
        <h2 className="font-display text-[clamp(1.6rem,3.5vw,2.5rem)] font-bold leading-tight tracking-tight text-balance text-foreground">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-2 text-pretty text-base leading-relaxed text-muted-foreground">
            {subtitle}
          </p>
        )}
      </div>
      {action && (
        <Link
          href={action.href}
          className="group inline-flex shrink-0 items-center gap-1 text-sm font-semibold text-ocean hover:text-ocean-deep"
        >
          {action.label}
          <span className="transition-transform group-hover:translate-x-0.5" aria-hidden="true">
            →
          </span>
        </Link>
      )}
    </div>
  )
}
