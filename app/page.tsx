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
import { getCatalogTours } from '@/lib/data/catalog'

/**
 * Prerendered at build time and refreshed in the background, so a catalog edit
 * in Supabase reaches visitors without a redeploy. Next requires a literal
 * here; keep it in step with `CATALOG_REVALIDATE_SECONDS` in lib/data/catalog.
 */
export const revalidate = 300

export default async function HomePage() {
  const tours = await getCatalogTours()

  return (
    <>
      <SiteHeader />
      <CartDrawer />
      <main id="main">
        <Hero />
        <ToursStrip tours={tours} />
        <PopularExperiences tours={tours} />
        <CategorySection />
        <Storytelling />
        <DestinationsSection />
        <FeaturedTour tours={tours} />
        <ReviewsSection tours={tours} />
        <WhyUs />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  )
}
