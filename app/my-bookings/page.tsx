import { MyBookings } from '@/components/travel/my-bookings'
import { TravelShell } from '@/components/travel/page-shell'
export const metadata = {
  title: 'Mis solicitudes | Eddy’s Tours',
  robots: { index: false },
}
export default function Page() {
  return (
    <TravelShell>
      <MyBookings />
    </TravelShell>
  )
}
