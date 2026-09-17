export const siteConfig = {
  name: "Eddy's Tours",
  title: "Eddy's Tours — Tours & Experiences in Puerto Vallarta, Mexico",
  description:
    'Discover unforgettable tours and experiences across Puerto Vallarta and the Bay of Banderas — ATV, yacht, snorkeling, whale watching, sailing and more. Book local, hand-picked adventures.',
  locale: 'en_US',
  /** Public contact address shown in the footer, policies and error pages. */
  email: 'heribertoestrella25@gmail.com' as string,
  /** Display form of the business phone; `whatsapp` is the same number for links. */
  phone: '+52 322 151 7643' as string,
  /**
   * WhatsApp Business number in international format, digits only. Leave
   * empty to hide every WhatsApp action. If a `wa.me` link ever fails to open
   * the chat, try the legacy Mexican mobile form with a `1` after `52`.
   */
  whatsapp: '523221517643' as string,
  facebook: 'https://www.facebook.com/cazanova70' as string,
} as const

/**
 * Canonical origin for metadata, `robots.txt` and the sitemap.
 *
 * `NEXT_PUBLIC_SITE_URL` wins so a custom domain can be pinned; otherwise we
 * fall back to localhost for development. Always returns an origin with no
 * trailing slash.
 */
export function getSiteUrl(): string {
  const configured = process.env.NEXT_PUBLIC_SITE_URL

  if (!configured) return 'http://localhost:3000'

  const withProtocol = /^https?:\/\//.test(configured) ? configured : `https://${configured}`
  return withProtocol.replace(/\/+$/, '')
}

/** `mailto:` link to the public contact address with an optional subject and body. */
export function mailtoUrl(subject?: string, body?: string): string {
  const params = new URLSearchParams()
  if (subject) params.set('subject', subject)
  if (body) params.set('body', body)
  const query = params.toString().replace(/\+/g, '%20')
  return query ? `mailto:${siteConfig.email}?${query}` : `mailto:${siteConfig.email}`
}

/** `wa.me` link with a prefilled message, or `null` when no number is configured. */
export function whatsappUrl(text: string): string | null {
  if (!siteConfig.whatsapp) return null
  return `https://wa.me/${siteConfig.whatsapp}?text=${encodeURIComponent(text)}`
}
