import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { TourDetail } from '@/components/tour-detail'
import { getCatalogTours } from '@/lib/data/catalog'
import { getSiteUrl } from '@/lib/site'

export const revalidate = 300

async function findTour(slug: string) {
  const tours = await getCatalogTours()
  return { tours, tour: tours.find((item) => item.slug === slug) }
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const { tour } = await findTour(slug)

  if (!tour) return { title: 'Tour not found' }

  return {
    title: `${tour.title} | Eddy's Tours`,
    description: tour.shortDescription,
    alternates: { canonical: `/tours/${tour.slug}` },
    openGraph: {
      title: tour.title,
      description: tour.shortDescription,
      url: `/tours/${tour.slug}`,
      images: tour.images.map((url) => ({ url })),
      type: 'website',
    },
  }
}

export default async function TourPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const { tours, tour } = await findTour(slug)
  if (!tour) notFound()

  const related = tours
    .filter((item) => item.id !== tour.id)
    .sort((a, b) => Number(b.category === tour.category) - Number(a.category === tour.category))
    .slice(0, 3)

  const structuredData = {
    '@context': 'https://schema.org',
    '@type': 'TouristTrip',
    name: tour.title,
    description: tour.shortDescription,
    image: tour.images.map((image) => new URL(image, getSiteUrl()).toString()),
    touristType: tour.category,
    offers: {
      '@type': 'Offer',
      price: tour.retailPrice.usd,
      priceCurrency: 'USD',
      availability: tour.availableSpots > 0 ? 'https://schema.org/InStock' : 'https://schema.org/SoldOut',
      url: `${getSiteUrl()}/tours/${tour.slug}`,
    },
    aggregateRating: {
      '@type': 'AggregateRating',
      ratingValue: tour.rating,
      reviewCount: tour.reviewsCount,
    },
  }

  return (
    <>
      <SiteHeader />
      <CartDrawer />
      <main id="main">
        <TourDetail tour={tour} related={related} />
      </main>
      <SiteFooter />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData).replace(/</g, '\\u003c') }}
      />
    </>
  )
}
