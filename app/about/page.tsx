import { Information } from '@/components/travel/information'
import { TravelShell } from '@/components/travel/page-shell'
export const metadata = {
  title: 'Nosotros | Eddy’s Tours',
  alternates: { canonical: '/about' },
}
export default function Page() {
  return (
    <TravelShell>
      <Information kind="about" />
    </TravelShell>
  )
}
