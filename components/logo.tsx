import { cn } from '@/lib/utils'

interface LogoProps {
  tone?: 'light' | 'dark'
  className?: string
}

/**
 * Eddy's Tours brand lockup: a sun-over-waves mark + wordmark.
 * `tone="light"` is for use over dark imagery (hero).
 */
export function Logo({ tone = 'dark', className }: LogoProps) {
  const wordColor = tone === 'light' ? 'text-white' : 'text-charcoal'
  const subColor = tone === 'light' ? 'text-white/70' : 'text-muted-foreground'

  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        aria-hidden="true"
        className="grid size-9 shrink-0 place-items-center rounded-full bg-ocean text-white shadow-sm"
      >
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
          <circle cx="12" cy="9" r="3.4" fill="var(--sunset)" />
          <g stroke="var(--sunset)" strokeWidth="1.4" strokeLinecap="round">
            <line x1="12" y1="1.5" x2="12" y2="3.2" />
            <line x1="19.4" y1="4.6" x2="18.2" y2="5.8" />
            <line x1="4.6" y1="4.6" x2="5.8" y2="5.8" />
          </g>
          <path
            d="M2.5 16.2c1.7 0 1.7 1.3 3.5 1.3s1.8-1.3 3.5-1.3 1.8 1.3 3.5 1.3 1.8-1.3 3.5-1.3 1.7 1.3 3.5 1.3"
            stroke="currentColor"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
          <path
            d="M2.5 19.8c1.7 0 1.7 1.3 3.5 1.3s1.8-1.3 3.5-1.3 1.8 1.3 3.5 1.3 1.8-1.3 3.5-1.3 1.7 1.3 3.5 1.3"
            stroke="var(--turquoise)"
            strokeWidth="1.6"
            strokeLinecap="round"
            fill="none"
          />
        </svg>
      </span>
      <span className="flex flex-col leading-none">
        <span className={cn('font-display text-lg font-bold tracking-tight', wordColor)}>
          Eddy&apos;s Tours
        </span>
        <span className={cn('text-[0.62rem] font-medium uppercase tracking-[0.22em]', subColor)}>
          Puerto Vallarta
        </span>
      </span>
    </span>
  )
}
