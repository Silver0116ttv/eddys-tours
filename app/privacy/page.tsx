import { Information } from '@/components/travel/information'
import { TravelShell } from '@/components/travel/page-shell'
export const metadata = {
  title: 'Privacidad | Eddy’s Tours',
  alternates: { canonical: '/privacy' },
}
export default function Page() {
  return (
    <TravelShell>
      <Information kind="privacy" />
    </TravelShell>
  )
}
