import { CartDrawer } from '@/components/cart/cart-drawer'
import { CategorySection } from '@/components/category-section'
import { DestinationsSection } from '@/components/destinations-section'
import { FeaturedTour } from '@/components/featured-tour'
import { FinalCta } from '@/components/final-cta'
import { Hero } from '@/components/hero'
import { PopularExperiences } from '@/components/popular-experiences'
import { ReviewsSection } from '@/components/reviews-section'
import { SiteFooter } from '@/components/site-footer'
import { SiteHeader } from '@/components/site-header'
import { Storytelling } from '@/components/storytelling'
import { ToursStrip } from '@/components/tours-strip'
import { WhyUs } from '@/components/why-us'

export default function HomePage() {
  return (
    <>
      <SiteHeader />
      <CartDrawer />
      <main>
        <Hero />
        <ToursStrip />
        <PopularExperiences />
        <CategorySection />
        <Storytelling />
        <DestinationsSection />
        <FeaturedTour />
        <ReviewsSection />
        <WhyUs />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
