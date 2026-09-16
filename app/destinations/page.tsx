import { Information } from '@/components/travel/information'
import { TravelShell } from '@/components/travel/page-shell'
export const metadata = {
  title: 'Destinos | Eddy’s Tours',
  alternates: { canonical: '/destinations' },
}
export default function Page() {
  return (
    <TravelShell>
      <Information kind="destinations" />
    </TravelShell>
  )
}
