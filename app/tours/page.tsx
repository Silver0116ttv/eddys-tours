import type { Metadata } from 'next'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { CatalogHero, TourCatalog } from '@/components/tour-catalog'
import { getCatalogTours } from '@/lib/data/catalog'

export const revalidate = 300

export const metadata: Metadata = {
  title: "Tours in Puerto Vallarta | Eddy's Tours",
  description: 'Browse local tours, boat trips and outdoor experiences across Puerto Vallarta and Banderas Bay.',
  alternates: { canonical: '/tours' },
}

function first(value: string | string[] | undefined) {
  return Array.isArray(value) ? value[0] ?? '' : value ?? ''
}

export default async function ToursPage({
  searchParams,
}: {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}) {
  const [tours, filters] = await Promise.all([getCatalogTours(), searchParams])

  return (
    <>
      <SiteHeader />
      <CartDrawer />
      <main id="main">
        <CatalogHero />
        <TourCatalog
          tours={tours}
          initialQuery={first(filters.q)}
          initialCategory={first(filters.category)}
          initialDestination={first(filters.destination)}
          initialDate={first(filters.date)}
        />
      </main>
      <SiteFooter />
    </>
  )
}
