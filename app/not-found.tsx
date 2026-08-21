import type { Metadata } from 'next'
import Link from 'next/link'
import { Logo } from '@/components/logo'

export const metadata: Metadata = {
  title: 'Page not found',
  robots: { index: false, follow: false },
}

export default function NotFound() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-ocean">Error 404</p>
      <h1 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-tight font-bold tracking-tight text-balance text-foreground">
        This trail doesn&apos;t go anywhere
      </h1>
      <p className="max-w-md leading-relaxed text-pretty text-muted-foreground">
        The page you were looking for has moved or never existed. The bay is still out there
        though — head back and pick an adventure.
      </p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-sunset-deep px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
      >
        Back to Eddy&apos;s Tours
      </Link>
    </main>
  )
}
