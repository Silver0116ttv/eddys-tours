'use client'

import Image from 'next/image'
import { useCallback, useEffect, useRef, useState } from 'react'
import { Calendar, Clock, Minus, Plus, ShieldCheck, ShoppingBag, Trash2, X } from 'lucide-react'
import { useCart, type PaymentType } from '@/components/cart/cart-context'
import { formatPrice } from '@/lib/tours'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import { useI18n } from '@/components/use-i18n'
import { localizeTourTitle } from '@/lib/i18n'

const FOCUSABLE =
  'a[href], button:not([disabled]), input, select, textarea, [tabindex]:not([tabindex="-1"])'

/*
 * The drawer stays mounted and is shown with CSS rather than by mounting and
 * unmounting through an exit animation. Whether the panel blocks the page is
 * decided by `inert` and `pointer-events`, which flip with `isOpen` alone — so
 * a full-screen overlay can never be left behind swallowing clicks because an
 * exit animation failed to finish. While closed the panel is out of the tab
 * order and the accessibility tree, exactly as an unmounted dialog would be.
 */
const TRANSITION_MS = 300

function formatDate(iso: string, locale: string, fallback: string) {
  const [year, month, day] = iso.split('-').map(Number)
  if (!year || !month || !day) return fallback

  return new Date(year, month - 1, day).toLocaleDateString(locale, {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
  })
}

export function CartDrawer() {
  const { language, locale, t } = useI18n()
  const {
    items,
    isOpen,
    closeCart,
    removeItem,
    setAdults,
    setPaymentType,
    tripTotal,
    payToday,
    remainingBalance,
    currency,
    clear,
  } = useCart()
  const [confirmed, setConfirmed] = useState(false)
  const panelRef = useRef<HTMLElement>(null)
  const returnFocusRef = useRef<HTMLElement | null>(null)
  const itemTitle = (tourId: string, title: string) => localizeTourTitle(tourId, title, language)

  const handleClose = useCallback(() => {
    closeCart()
    setTimeout(() => setConfirmed(false), TRANSITION_MS)
  }, [closeCart])

  // Modal behaviour: lock the page behind the drawer, close on Escape, and keep
  // Tab inside the panel so keyboard users cannot wander off into hidden content.
  useEffect(() => {
    if (!isOpen) return

    returnFocusRef.current = document.activeElement as HTMLElement | null
    panelRef.current?.focus()

    const { body } = document
    const previousOverflow = body.style.overflow
    body.style.overflow = 'hidden'

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === 'Escape') {
        event.preventDefault()
        handleClose()
        return
      }

      if (event.key !== 'Tab' || !panelRef.current) return

      const focusable = Array.from(
        panelRef.current.querySelectorAll<HTMLElement>(FOCUSABLE),
      ).filter((element) => element.offsetParent !== null)
      const first = focusable[0]
      const last = focusable[focusable.length - 1]
      if (!first || !last) return

      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault()
        last.focus()
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault()
        first.focus()
      }
    }

    document.addEventListener('keydown', onKeyDown)
    return () => {
      document.removeEventListener('keydown', onKeyDown)
      body.style.overflow = previousOverflow
      returnFocusRef.current?.focus()
    }
  }, [isOpen, handleClose])

  return (
    <div
      className={cn(
        'fixed inset-0 z-60 transition-opacity duration-300 motion-reduce:transition-none',
        isOpen ? 'opacity-100' : 'pointer-events-none opacity-0',
      )}
      inert={!isOpen}
    >
      <div
        onClick={handleClose}
        className="absolute inset-0 bg-charcoal/50 backdrop-blur-sm"
        aria-hidden="true"
      />
      <aside
        ref={panelRef}
        className={cn(
          'absolute inset-y-0 right-0 flex w-full max-w-md flex-col bg-background shadow-2xl outline-none',
          'transition-transform duration-300 ease-out motion-reduce:transition-none',
          isOpen ? 'translate-x-0' : 'translate-x-full',
        )}
        role="dialog"
        aria-modal="true"
        aria-label={t('cart.label')}
        tabIndex={-1}
      >
        <header className="flex items-center justify-between border-b border-border px-5 py-4">
          <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-foreground">
            <ShoppingBag className="size-5 text-ocean" />
            {t('cart.title')}
            {items.length > 0 && (
              <span className="rounded-full bg-secondary px-2 py-0.5 text-sm font-medium text-muted-foreground">
                {items.length}
              </span>
            )}
          </h2>
          <button
            type="button"
            onClick={handleClose}
            aria-label={t('cart.close')}
            className="grid size-9 place-items-center rounded-full text-muted-foreground hover:bg-muted hover:text-foreground"
          >
            <X className="size-5" />
          </button>
        </header>

        {confirmed ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-tropical/15 text-tropical">
              <ShieldCheck className="size-8" />
            </div>
            <h3 className="font-display text-2xl text-foreground">{t('cart.requested')}</h3>
            <p className="leading-relaxed text-muted-foreground">
              {t('cart.requestedBody')}
            </p>
            <Button onClick={handleClose} className="mt-2 rounded-full">
              {t('cart.keepExploring')}
            </Button>
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
            <div className="grid size-16 place-items-center rounded-full bg-secondary text-muted-foreground">
              <ShoppingBag className="size-7" />
            </div>
            <h3 className="font-display text-xl text-foreground">{t('cart.empty')}</h3>
            <p className="leading-relaxed text-muted-foreground">
              {t('cart.emptyBody')}
            </p>
            <Button onClick={handleClose} variant="secondary" className="mt-2 rounded-full">
              {t('cart.browse')}
            </Button>
          </div>
        ) : (
          <>
            <div className="flex-1 space-y-4 overflow-y-auto px-5 py-5">
              {items.map((item) => (
                <div
                  key={item.lineId}
                  className="flex gap-3 rounded-2xl border border-border bg-card p-3"
                >
                  <div className="relative size-24 shrink-0 overflow-hidden rounded-xl">
                    <Image
                      src={item.image}
                      alt={itemTitle(item.tourId, item.title)}
                      fill
                      sizes="96px"
                      className="object-cover"
                    />
                  </div>
                  <div className="flex min-w-0 flex-1 flex-col">
                    <div className="flex items-start justify-between gap-2">
                      <h3 className="font-sans text-sm leading-tight font-semibold text-foreground">
                        {itemTitle(item.tourId, item.title)}
                      </h3>
                      <button
                        type="button"
                        onClick={() => removeItem(item.lineId)}
                        aria-label={t('cart.remove', { title: itemTitle(item.tourId, item.title) })}
                        className="shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="size-4" />
                      </button>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-muted-foreground">
                      {item.providerName}
                    </p>
                    <div className="mt-1.5 flex flex-wrap gap-x-3 gap-y-0.5 text-xs text-muted-foreground">
                      <span className="flex items-center gap-1">
                        <Calendar className="size-3" />
                        {formatDate(item.date, locale, t('date.confirm'))}
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="size-3" />
                        {item.time
                          ? language === 'ES'
                            ? item.time.replace('AM', 'a. m.').replace('PM', 'p. m.')
                            : item.time
                          : t('time.confirm')}
                      </span>
                    </div>

                    <div className="mt-auto flex items-center justify-between pt-2">
                      <div className="inline-flex items-center rounded-full border border-border">
                        <button
                          type="button"
                          onClick={() => setAdults(item.lineId, item.adults - 1)}
                          aria-label={t('cart.fewer', { title: itemTitle(item.tourId, item.title) })}
                          className="grid size-7 place-items-center rounded-full text-foreground hover:bg-muted disabled:opacity-40"
                          disabled={item.adults <= 1}
                        >
                          <Minus className="size-3.5" />
                        </button>
                        <span className="w-8 text-center text-sm font-semibold text-foreground">
                          {item.adults}
                        </span>
                        <button
                          type="button"
                          onClick={() => setAdults(item.lineId, item.adults + 1)}
                          aria-label={t('cart.more', { title: itemTitle(item.tourId, item.title) })}
                          className="grid size-7 place-items-center rounded-full text-foreground hover:bg-muted"
                        >
                          <Plus className="size-3.5" />
                        </button>
                      </div>
                      <span className="text-sm font-semibold text-foreground">
                        {formatPrice(item.total, currency)}
                      </span>
                    </div>

                    <div className="mt-2 inline-flex rounded-lg bg-secondary p-0.5 text-xs font-medium">
                      {(['deposit', 'full'] as PaymentType[]).map((type) => (
                        <button
                          key={type}
                          type="button"
                          onClick={() => setPaymentType(item.lineId, type)}
                          aria-pressed={item.paymentType === type}
                          className={cn(
                            'rounded-md px-2.5 py-1 transition-colors',
                            item.paymentType === type
                              ? 'bg-background text-foreground shadow-sm'
                              : 'text-muted-foreground',
                          )}
                        >
                          {type === 'deposit'
                            ? t('cart.deposit', { price: formatPrice(item.depositTotal, currency) })
                            : t('cart.full')}
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              ))}

              <button
                type="button"
                onClick={clear}
                className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
              >
                {t('cart.clear')}
              </button>
            </div>

            <footer className="border-t border-border px-5 py-4">
              <dl className="space-y-1.5 text-sm">
                <div className="flex items-center justify-between text-muted-foreground">
                  <dt>{t('cart.total')}</dt>
                  <dd className="font-medium text-foreground">
                    {formatPrice(tripTotal, currency)}
                  </dd>
                </div>
                {remainingBalance.usd > 0 && (
                  <div className="flex items-center justify-between text-muted-foreground">
                    <dt>{t('cart.balance')}</dt>
                    <dd>{formatPrice(remainingBalance, currency)}</dd>
                  </div>
                )}
                <div className="flex items-center justify-between border-t border-border pt-2 text-base">
                  <dt className="font-semibold text-foreground">{t('cart.today')}</dt>
                  <dd className="font-bold text-ocean">{formatPrice(payToday, currency)}</dd>
                </div>
              </dl>

              <Button
                onClick={() => setConfirmed(true)}
                size="lg"
                className="mt-4 w-full rounded-full text-base"
              >
                {t('cart.confirm')}
              </Button>
              <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                <ShieldCheck className="size-3.5 text-tropical" />
                {t('cart.secure')}
              </p>
            </footer>
          </>
        )}
      </aside>
    </div>
  )
}
