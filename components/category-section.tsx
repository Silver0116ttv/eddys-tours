import Image from 'next/image'
import { categories, type CategoryItem } from '@/lib/tours'
import { SectionHeading } from '@/components/section-heading'
import { cn } from '@/lib/utils'

const spanBySize: Record<CategoryItem['size'], string> = {
  large: 'col-span-2 row-span-2',
  wide: 'col-span-2',
  tall: 'row-span-2',
  normal: '',
}

function CategoryCard({ category }: { category: CategoryItem }) {
  return (
    <a
      href="#tours"
      className={cn(
        'group relative overflow-hidden rounded-2xl',
        spanBySize[category.size],
      )}
    >
      <Image
        src={category.image}
        alt={`${category.name} experiences in Puerto Vallarta`}
        fill
        sizes="(max-width: 1024px) 50vw, 25vw"
        className="object-cover transition-transform duration-500 group-hover:scale-105"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/10 to-transparent transition-colors group-hover:from-black/80" />
      <div className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-4">
        <div>
          <h3 className="font-display text-lg font-bold uppercase tracking-wide text-white sm:text-xl">
            {category.name}
          </h3>
          <p className="mt-0.5 text-sm font-medium text-white/85">
            {category.count} experiences
          </p>
        </div>
        <span
          aria-hidden="true"
          className="mb-1 translate-x-0 text-lg text-white transition-transform group-hover:translate-x-1"
        >
          →
        </span>
      </div>
    </a>
  )
}

export function CategorySection() {
  return (
    <section id="categories" className="scroll-mt-24 bg-secondary/40 py-16 md:py-24">
      <div className="mx-auto max-w-[1440px] px-4 sm:px-6 lg:px-10">
        <SectionHeading
          eyebrow="Browse by vibe"
          title="How do you want to explore?"
          subtitle="From adrenaline in the jungle to slow days on the water — pick your kind of adventure."
        />
        <div className="mt-8 grid grid-flow-dense grid-cols-2 gap-3 [grid-auto-rows:150px] sm:[grid-auto-rows:190px] md:mt-10 md:gap-4 lg:grid-cols-4 lg:[grid-auto-rows:220px]">
          {categories.map((category) => (
            <CategoryCard key={category.name} category={category} />
          ))}
        </div>
      </div>
    </section>
  )
}
