'use client'

import { useEffect, useRef, useState } from 'react'
import { AnimatePresence, motion } from 'motion/react'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { useCart } from '@/components/cart/cart-context'

const NAV = [
  { label: 'Tours', href: '#tours' },
  { label: 'Destinations', href: '#destinations' },
  { label: 'Categories', href: '#categories' },
  { label: 'About', href: '#about' },
  { label: 'Contact', href: '#footer' },
]

function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone,
  label,
}: {
  options: T[]
  value: T
  onChange: (v: T) => void
  tone: 'light' | 'dark'
  label: string
}) {
  return (
    <div
      role="group"
      aria-label={label}
      className={cn(
        'inline-flex items-center rounded-full border p-0.5 text-xs font-semibold',
        tone === 'light' ? 'border-white/30' : 'border-border',
      )}
    >
      {options.map((opt) => {
        const active = opt === value
        return (
          <button
            key={opt}
            type="button"
            onClick={() => onChange(opt)}
            className={cn(
              'rounded-full px-2 py-0.5 transition-colors',
              active && 'bg-ocean text-white',
              !active && (tone === 'light' ? 'text-white/80 hover:text-white' : 'text-muted-foreground hover:text-foreground'),
            )}
          >
            {opt}
          </button>
        )
      })}
    </div>
  )
}

export function SiteHeader() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const { itemCount, openCart, currency, setCurrency, language, setLanguage } = useCart()
  const prevCount = useRef(itemCount)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    if (itemCount > prevCount.current) {
      setBump(true)
      const t = setTimeout(() => setBump(false), 300)
      return () => clearTimeout(t)
    }
    prevCount.current = itemCount
  }, [itemCount])

  const solid = scrolled || mobileOpen
  const tone: 'light' | 'dark' = solid ? 'dark' : 'light'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid
          ? 'border-b border-border bg-background/90 backdrop-blur-md shadow-sm'
          : 'bg-gradient-to-b from-black/40 to-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-10 lg:h-20">
        {/* Left: logo */}
        <a href="#top" className="flex items-center" aria-label="Eddy's Tours home">
          <Logo tone={tone} />
        </a>

        {/* Center nav */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label="Primary">
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors',
                solid ? 'text-foreground/80 hover:text-ocean' : 'text-white/90 hover:text-white',
              )}
            >
              {item.label}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            aria-label="Search tours"
            className={cn(
              'hidden size-9 place-items-center rounded-full transition-colors sm:grid',
              solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/15',
            )}
          >
            <Search className="size-4.5" />
          </button>

          <div className="hidden items-center gap-2 xl:flex">
            <Segmented
              label="Language"
              options={['EN', 'ES']}
              value={language}
              onChange={setLanguage}
              tone={tone}
            />
            <Segmented
              label="Currency"
              options={['USD', 'MXN']}
              value={currency}
              onChange={setCurrency}
              tone={tone}
            />
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-label={`Open cart, ${itemCount} items`}
            className={cn(
              'relative grid size-9 place-items-center rounded-full transition-colors',
              solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/15',
            )}
          >
            <ShoppingBag className="size-5" />
            {itemCount > 0 && (
              <motion.span
                animate={bump ? { scale: [1, 1.35, 1] } : {}}
                className="absolute -right-0.5 -top-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-sunset px-1 text-[0.65rem] font-bold text-white"
              >
                {itemCount}
              </motion.span>
            )}
          </button>

          <a
            href="#tours"
            className="hidden rounded-full bg-sunset px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95 lg:inline-flex"
          >
            Explore Tours
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? 'Close menu' : 'Open menu'}
            aria-expanded={mobileOpen}
            onClick={() => setMobileOpen((o) => !o)}
            className={cn(
              'grid size-9 place-items-center rounded-full transition-colors lg:hidden',
              solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/15',
            )}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/* Mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: 'auto' }}
            exit={{ opacity: 0, height: 0 }}
            transition={{ duration: 0.25, ease: 'easeInOut' }}
            className="overflow-hidden border-t border-border bg-background lg:hidden"
          >
            <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
              {NAV.map((item) => (
                <a
                  key={item.href}
                  href={item.href}
                  onClick={() => setMobileOpen(false)}
                  className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
                >
                  {item.label}
                </a>
              ))}
              <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border px-3 pt-4">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Language</span>
                  <Segmented label="Language" options={['EN', 'ES']} value={language} onChange={setLanguage} tone="dark" />
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs font-medium text-muted-foreground">Currency</span>
                  <Segmented label="Currency" options={['USD', 'MXN']} value={currency} onChange={setCurrency} tone="dark" />
                </div>
              </div>
              <a
                href="#tours"
                onClick={() => setMobileOpen(false)}
                className="mt-3 inline-flex items-center justify-center rounded-full bg-sunset px-5 py-3 text-sm font-semibold text-white"
              >
                Explore Tours
              </a>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </header>
  )
}
