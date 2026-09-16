import type { MetadataRoute } from 'next'
import { getCatalogTours } from '@/lib/data/catalog'
import { getSiteUrl } from '@/lib/site'

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const siteUrl = getSiteUrl()
  const tours = await getCatalogTours()

  return [
    ...['destinations', 'categories', 'about', 'help', 'contact', 'privacy'].map(path => ({ url: `${siteUrl}/${path}`, changeFrequency: 'monthly' as const, priority: 0.6 })),
    {
      url: `${siteUrl}/`,
      lastModified: new Date(),
      changeFrequency: 'weekly',
      priority: 1,
    },
    {
      url: `${siteUrl}/tours`,
      lastModified: new Date(),
      changeFrequency: 'daily',
      priority: 0.9,
    },
    ...tours.map((tour) => ({
      url: `${siteUrl}/tours/${tour.slug}`,
      lastModified: new Date(),
      changeFrequency: 'weekly' as const,
      priority: 0.8,
    })),
    {
      url: `${siteUrl}/booking-policy`,
      lastModified: new Date(),
      changeFrequency: 'monthly',
      priority: 0.4,
    },
  ]
}
