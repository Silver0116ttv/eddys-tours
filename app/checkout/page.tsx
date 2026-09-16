import { Trip } from '@/components/travel/trip'
import { TravelShell } from '@/components/travel/page-shell'
import { getCatalogTours } from '@/lib/data/catalog'
export const metadata = {
  title: 'Tu reservación | Eddy’s Tours',
  robots: { index: false },
}
export const revalidate = 300
export default async function Page() {
  return (
    <TravelShell>
      <Trip tours={await getCatalogTours()} checkout />
    </TravelShell>
  )
}
