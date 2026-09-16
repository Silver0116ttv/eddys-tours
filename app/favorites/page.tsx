import { Favorites } from '@/components/travel/favorites'
import { TravelShell } from '@/components/travel/page-shell'
import { getCatalogTours } from '@/lib/data/catalog'
export const metadata = {
  title: 'Favoritos | Eddy’s Tours',
  robots: { index: false },
}
export const revalidate = 300
export default async function Page() {
  return (
    <TravelShell>
      <Favorites tours={await getCatalogTours()} />
    </TravelShell>
  )
}
