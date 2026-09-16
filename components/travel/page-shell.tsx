import Link from 'next/link'
import { SiteHeader } from '@/components/site-header'
import { SiteFooter } from '@/components/site-footer'
import { CartDrawer } from '@/components/cart/cart-drawer'

export function TravelShell({ children }: { children: React.ReactNode }) {
  return (
    <>
      <SiteHeader />
      <CartDrawer />
      <main id="main" className="min-h-[75vh] pt-16 lg:pt-20">
        {children}
      </main>
      <SiteFooter />
    </>
  )
}

export function PageIntro({
  title,
  description,
  children,
}: {
  title: string
  description: string
  children?: React.ReactNode
}) {
  return (
    <section className="border-b border-border bg-[#edf4f5] py-12 md:py-16">
      <div className="travel-container">
        <Link href="/" className="text-sm text-ocean">
          Eddy’s Tours /
        </Link>
        <h1 className="mt-5 max-w-4xl text-4xl font-bold tracking-tight md:text-6xl">
          {title}
        </h1>
        <p className="mt-5 max-w-2xl leading-7 text-muted-foreground">
          {description}
        </p>
        {children}
      </div>
    </section>
  )
}
