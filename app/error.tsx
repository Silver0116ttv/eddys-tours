'use client'

import { useEffect } from 'react'
import { Logo } from '@/components/logo'
import { mailtoUrl, siteConfig } from '@/lib/site'

/**
 * Route-level error boundary. Next renders this in place of the page when a
 * server or client render throws, so a single bad section never blanks the site.
 */
export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    console.error('Unhandled error on the storefront.', error)
  }, [error])

  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-ocean">
        Something went wrong
      </p>
      <h1 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-tight font-bold tracking-tight text-balance text-foreground">
        We hit rough water
      </h1>
      <p className="max-w-md leading-relaxed text-pretty text-muted-foreground">
        This page failed to load. Try again — if it keeps happening, reach us at{' '}
        <a className="font-medium text-ocean hover:text-ocean-deep" href={mailtoUrl()}>
          {siteConfig.email}
        </a>
        .
      </p>
      {error.digest && (
        <p className="font-mono text-xs text-muted-foreground">Reference: {error.digest}</p>
      )}
      <button
        type="button"
        onClick={reset}
        className="inline-flex items-center justify-center rounded-full bg-sunset-deep px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
      >
        Try again
      </button>
    </main>
  )
}
