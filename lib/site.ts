export const siteConfig = {
  name: "Eddy's Tours",
  title: "Eddy's Tours — Tours & Experiences in Puerto Vallarta, Mexico",
  description:
    'Discover unforgettable tours and experiences across Puerto Vallarta and the Bay of Banderas — ATV, yacht, snorkeling, whale watching, sailing and more. Book local, hand-picked adventures.',
  locale: 'en_US',
} as const

/**
 * Canonical origin for metadata, `robots.txt` and the sitemap.
 *
 * `NEXT_PUBLIC_SITE_URL` wins so a custom domain can be pinned; otherwise we
 * fall back to the Vercel-provided production host, then to localhost for
 * development. Always returns an origin with no trailing slash.
 */
export function getSiteUrl(): string {
  const configured =
    process.env.NEXT_PUBLIC_SITE_URL ??
    (process.env.VERCEL_PROJECT_PRODUCTION_URL
      ? `https://${process.env.VERCEL_PROJECT_PRODUCTION_URL}`
      : undefined)

  if (!configured) return 'http://localhost:3000'

  const withProtocol = /^https?:\/\//.test(configured) ? configured : `https://${configured}`
  return withProtocol.replace(/\/+$/, '')
}
