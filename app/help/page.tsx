import { Information } from '@/components/travel/information'
import { TravelShell } from '@/components/travel/page-shell'
export const metadata = {
  title: 'Centro de ayuda | Eddy’s Tours',
  alternates: { canonical: '/help' },
}
export default function Page() {
  return (
    <TravelShell>
      <Information kind="help" />
    </TravelShell>
  )
}
