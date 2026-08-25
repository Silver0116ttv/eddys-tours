'use client'

import Link from 'next/link'
import { Logo } from '@/components/logo'
import { useI18n } from '@/components/use-i18n'

const copy = {
  EN: {
    title: "This trail doesn't go anywhere",
    body: 'The page you were looking for has moved or never existed. The bay is still out there though — head back and pick an adventure.',
    action: "Back to Eddy's Tours",
  },
  ES: {
    title: 'Este camino no lleva a ningún lado',
    body: 'La página que buscabas cambió de lugar o nunca existió. La bahía sigue ahí: vuelve al inicio y elige una aventura.',
    action: "Volver a Eddy's Tours",
  },
} as const

export function NotFoundContent() {
  const { language } = useI18n()
  const text = copy[language]

  return (
    <main id="main" className="flex min-h-screen flex-col items-center justify-center gap-6 px-6 text-center">
      <Logo />
      <p className="text-xs font-semibold tracking-[0.22em] uppercase text-ocean">Error 404</p>
      <h1 className="font-display text-[clamp(1.8rem,5vw,3rem)] leading-tight font-bold tracking-tight text-balance text-foreground">
        {text.title}
      </h1>
      <p className="max-w-md leading-relaxed text-pretty text-muted-foreground">{text.body}</p>
      <Link
        href="/"
        className="inline-flex items-center justify-center rounded-full bg-sunset-deep px-7 py-3.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95"
      >
        {text.action}
      </Link>
    </main>
  )
}
