import { Information } from '@/components/travel/information'
import { TravelShell } from '@/components/travel/page-shell'
export const metadata = {
  title: 'Contacto | Eddy’s Tours',
  alternates: { canonical: '/contact' },
}
export default function Page() {
  return (
    <TravelShell>
      <Information kind="contact" />
    </TravelShell>
  )
}
