import type { Tour } from '@/lib/tours'
import { SectionHeading } from '@/components/section-heading'
import { TourCard } from '@/components/tour-card'

export function PopularExperiences({ tours }: { tours: Tour[] }) {
  const popular = tours.filter((t) => t.popular)

  return (
    <section id="tours" className="scroll-mt-24 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="Book with confidence"
          title="Popular Experiences"
          subtitle="The adventures travelers are loving right now."
          action={{ label: 'View all', href: '#categories' }}
        />

        <div
          className="mt-8 flex snap-x snap-mandatory gap-4 overflow-x-auto pb-4 no-scrollbar md:mt-10 lg:grid lg:grid-cols-4 lg:gap-6 lg:overflow-visible lg:pb-0"
        >
          {popular.map((tour) => (
            <div
              key={tour.id}
              className="w-[78%] shrink-0 snap-start sm:w-[46%] md:w-[31%] lg:w-auto"
            >
              <TourCard tour={tour} />
            </div>
          ))}
        </div>
      </div>
    </section>
  )
}
