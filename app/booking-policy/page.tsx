import type { Metadata } from 'next'
import { BookingPolicy } from '@/components/booking-policy'
import { CartDrawer } from '@/components/cart/cart-drawer'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'

export const metadata: Metadata = {
  title: "Booking & Safety | Eddy's Tours",
  description: "Booking, cancellation and safety information for Eddy's Tours experiences.",
  alternates: { canonical: '/booking-policy' },
}

export default function BookingPolicyPage() {
  return (
    <>
      <SiteHeader />
      <CartDrawer />
      <main id="main">
        <BookingPolicy />
      </main>
      <SiteFooter />
    </>
  )
}
