'use client'

import { useCallback, useEffect, useRef, useState } from 'react'
import { Menu, Search, ShoppingBag, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Logo } from '@/components/logo'
import { useCart } from '@/components/cart/cart-context'
import { useI18n } from '@/components/use-i18n'

const NAV = [
  { label: 'nav.tours' as const, href: '#tours' },
  { label: 'nav.destinations' as const, href: '#destinations' },
  { label: 'nav.categories' as const, href: '#categories' },
  { label: 'nav.about' as const, href: '#about' },
  { label: 'nav.contact' as const, href: '#footer' },
]

const MOBILE_MENU_ID = 'site-mobile-menu'

function Segmented<T extends string>({
  options,
  value,
  onChange,
  tone,
  label,
}: {
  options: readonly T[]
  value: T
  onChange: (value: T) => void
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
      {options.map((option) => {
        const active = option === value
        return (
          <button
            key={option}
            type="button"
            onClick={() => onChange(option)}
            aria-pressed={active}
            className={cn(
              'rounded-full px-2 py-0.5 transition-colors',
              active && 'bg-ocean text-white',
              !active &&
                (tone === 'light'
                  ? 'text-white/80 hover:text-white'
                  : 'text-muted-foreground hover:text-foreground'),
            )}
          >
            {option}
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
  const { t } = useI18n()
  const previousCount = useRef(itemCount)
  const [bump, setBump] = useState(false)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 40)
    onScroll()
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  useEffect(() => {
    const grew = itemCount > previousCount.current
    previousCount.current = itemCount
    if (!grew) return

    setBump(true)
    const timer = setTimeout(() => setBump(false), 300)
    return () => clearTimeout(timer)
  }, [itemCount])

  // The magnifier is a shortcut to the one search field the page has.
  const focusSearch = useCallback(() => {
    setMobileOpen(false)
    const input = document.getElementById('hero-search')
    if (!input) return
    input.scrollIntoView({ behavior: 'smooth', block: 'center' })
    input.focus({ preventScroll: true })
  }, [])

  const solid = scrolled || mobileOpen
  const tone: 'light' | 'dark' = solid ? 'dark' : 'light'

  return (
    <header
      className={cn(
        'fixed inset-x-0 top-0 z-50 transition-all duration-300',
        solid
          ? 'border-b border-border bg-background/90 shadow-sm backdrop-blur-md'
          : 'bg-gradient-to-b from-black/40 to-transparent',
      )}
    >
      <div className="mx-auto flex h-16 max-w-[1440px] items-center justify-between gap-4 px-4 sm:px-6 lg:h-20 lg:px-10">
        {/* Left: logo */}
        <a href="#top" className="flex items-center" aria-label={t('header.home')}>
          <Logo tone={tone} />
        </a>

        {/* Center nav */}
        <nav className="hidden items-center gap-7 lg:flex" aria-label={t('nav.primary')}>
          {NAV.map((item) => (
            <a
              key={item.href}
              href={item.href}
              className={cn(
                'text-sm font-medium transition-colors',
                solid ? 'text-foreground/80 hover:text-ocean' : 'text-white/90 hover:text-white',
              )}
            >
              {t(item.label)}
            </a>
          ))}
        </nav>

        {/* Right cluster */}
        <div className="flex items-center gap-2 sm:gap-3">
          <button
            type="button"
            onClick={focusSearch}
            aria-label={t('header.search')}
            className={cn(
              'hidden size-9 place-items-center rounded-full transition-colors sm:grid',
              solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/15',
            )}
          >
            <Search className="size-4.5" />
          </button>

          <div className="hidden items-center gap-2 xl:flex">
            <Segmented
              label={t('header.language')}
              options={['EN', 'ES'] as const}
              value={language}
              onChange={setLanguage}
              tone={tone}
            />
            <Segmented
              label={t('header.currency')}
              options={['USD', 'MXN'] as const}
              value={currency}
              onChange={setCurrency}
              tone={tone}
            />
          </div>

          <button
            type="button"
            onClick={openCart}
            aria-label={t('header.openTrip', {
              count: itemCount,
              items:
                language === 'ES'
                  ? itemCount === 1 ? 'elemento' : 'elementos'
                  : itemCount === 1 ? 'item' : 'items',
            })}
            className={cn(
              'relative grid size-9 place-items-center rounded-full transition-colors',
              solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/15',
            )}
          >
            <ShoppingBag className="size-5" />
            {itemCount > 0 && (
              <span
                aria-hidden="true"
                className={cn(
                  'absolute -top-0.5 -right-0.5 grid h-4.5 min-w-4.5 place-items-center rounded-full bg-sunset-deep px-1 text-[0.65rem] font-bold text-white',
                  'transition-transform duration-150 motion-reduce:transition-none',
                  bump && 'scale-125',
                )}
              >
                {itemCount}
              </span>
            )}
          </button>

          <a
            href="#tours"
            className="hidden rounded-full bg-sunset-deep px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition-transform hover:scale-[1.03] active:scale-95 lg:inline-flex"
          >
            {t('nav.explore')}
          </a>

          {/* Mobile toggle */}
          <button
            type="button"
            aria-label={mobileOpen ? t('header.closeMenu') : t('header.openMenu')}
            aria-expanded={mobileOpen}
            aria-controls={MOBILE_MENU_ID}
            onClick={() => setMobileOpen((open) => !open)}
            className={cn(
              'grid size-9 place-items-center rounded-full transition-colors lg:hidden',
              solid ? 'text-foreground hover:bg-muted' : 'text-white hover:bg-white/15',
            )}
          >
            {mobileOpen ? <X className="size-5" /> : <Menu className="size-5" />}
          </button>
        </div>
      </div>

      {/*
        * Collapsed with a grid-row transition instead of being unmounted, so
        * the panel's state is driven by class names alone. `inert` keeps the
        * collapsed links out of the tab order and the accessibility tree.
        */}
      <div
        id={MOBILE_MENU_ID}
        inert={!mobileOpen}
        className={cn(
          'grid overflow-hidden bg-background transition-[grid-template-rows,opacity] duration-250 ease-in-out motion-reduce:transition-none lg:hidden',
          mobileOpen
            ? 'grid-rows-[1fr] border-t border-border opacity-100'
            : 'grid-rows-[0fr] opacity-0',
        )}
      >
        <div className="min-h-0">
          <div className="flex flex-col gap-1 px-4 py-4 sm:px-6">
            {NAV.map((item) => (
              <a
                key={item.href}
                href={item.href}
                onClick={() => setMobileOpen(false)}
                className="rounded-lg px-3 py-3 text-base font-medium text-foreground hover:bg-muted"
              >
                {t(item.label)}
              </a>
            ))}
            <div className="mt-2 flex flex-wrap items-center gap-3 border-t border-border px-3 pt-4">
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{t('header.language')}</span>
                <Segmented
                  label={t('header.language')}
                  options={['EN', 'ES'] as const}
                  value={language}
                  onChange={setLanguage}
                  tone="dark"
                />
              </div>
              <div className="flex items-center gap-2">
                <span className="text-xs font-medium text-muted-foreground">{t('header.currency')}</span>
                <Segmented
                  label={t('header.currency')}
                  options={['USD', 'MXN'] as const}
                  value={currency}
                  onChange={setCurrency}
                  tone="dark"
                />
              </div>
            </div>
            <a
              href="#tours"
              onClick={() => setMobileOpen(false)}
              className="mt-3 inline-flex items-center justify-center rounded-full bg-sunset-deep px-5 py-3 text-sm font-semibold text-white"
            >
              {t('nav.explore')}
            </a>
          </div>
        </div>
      </div>
    </header>
  )
}
