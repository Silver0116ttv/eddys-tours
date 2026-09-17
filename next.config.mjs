/**
 * Baseline hardening headers. A full Content-Security-Policy is intentionally
 * left out for now: Next injects inline bootstrap scripts, so a strict policy
 * needs per-request nonces wired through `proxy.ts`. Add that alongside the
 * checkout work rather than shipping a policy loose enough to be theatre.
 */
const securityHeaders = [
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'X-DNS-Prefetch-Control', value: 'on' },
  {
    key: 'Permissions-Policy',
    value: 'camera=(), microphone=(), geolocation=(), browsing-topics=()',
  },
  {
    key: 'Strict-Transport-Security',
    value: 'max-age=63072000; includeSubDomains; preload',
  },
]

/**
 * Canonical host. The apex domain redirects here so search engines and shared
 * links converge on a single origin; `NEXT_PUBLIC_SITE_URL` must match.
 */
const canonicalHost = 'www.eddystourspv.com'

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    formats: ['image/avif', 'image/webp'],
  },
  async headers() {
    return [{ source: '/:path*', headers: securityHeaders }]
  },
  async redirects() {
    return [
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'eddystourspv.com' }],
        destination: `https://${canonicalHost}/:path*`,
        permanent: true,
      },
      // Routes from the previous Wix site that no longer exist.
      { source: '/book-online', destination: '/tours', permanent: true },
      { source: '/book-online/:path*', destination: '/tours', permanent: true },
    ]
  },
}

export default nextConfig
