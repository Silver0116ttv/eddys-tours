"use client"

import Image from "next/image"
import { useState } from "react"
import { AnimatePresence, motion } from "motion/react"
import { X, Minus, Plus, ShoppingBag, Trash2, Calendar, Clock, ShieldCheck } from "lucide-react"
import { useCart, type PaymentType } from "@/components/cart/cart-context"
import { formatPrice } from "@/lib/tours"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

function money(usd: number, currency: "USD" | "MXN") {
  return formatPrice(usd, currency)
}

function formatDate(iso: string) {
  const d = new Date(iso + "T00:00:00")
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
}

export function CartDrawer() {
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

  const handleClose = () => {
    closeCart()
    setTimeout(() => setConfirmed(false), 300)
  }

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-[60] bg-charcoal/50 backdrop-blur-sm"
            aria-hidden
          />
          <motion.aside
            initial={{ x: "100%" }}
            animate={{ x: 0 }}
            exit={{ x: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed inset-y-0 right-0 z-[70] flex w-full max-w-md flex-col bg-background shadow-2xl"
            role="dialog"
            aria-label="Your trip cart"
          >
            <header className="flex items-center justify-between border-b border-border px-5 py-4">
              <h2 className="flex items-center gap-2 font-sans text-lg font-semibold text-foreground">
                <ShoppingBag className="size-5 text-ocean" />
                Your Trip
                {items.length > 0 && (
                  <span className="rounded-full bg-secondary px-2 py-0.5 text-sm font-medium text-muted-foreground">
                    {items.length}
                  </span>
                )}
              </h2>
              <button
                onClick={handleClose}
                aria-label="Close cart"
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
                <h3 className="font-serif text-2xl text-foreground">Booking requested!</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Your spots are held. We&apos;ve emailed your confirmation — a local guide will
                  reach out with the final details.
                </p>
                <Button onClick={handleClose} className="mt-2 rounded-full">
                  Keep exploring
                </Button>
              </div>
            ) : items.length === 0 ? (
              <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
                <div className="grid size-16 place-items-center rounded-full bg-secondary text-muted-foreground">
                  <ShoppingBag className="size-7" />
                </div>
                <h3 className="font-serif text-xl text-foreground">Your trip is empty</h3>
                <p className="leading-relaxed text-muted-foreground">
                  Add tours and experiences to start planning your Vallarta adventure.
                </p>
                <Button onClick={handleClose} variant="secondary" className="mt-2 rounded-full">
                  Browse tours
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
                          src={item.image || "/placeholder.svg"}
                          alt={item.title}
                          fill
                          sizes="96px"
                          className="object-cover"
                        />
                      </div>
                      <div className="flex min-w-0 flex-1 flex-col">
                        <div className="flex items-start justify-between gap-2">
                          <h3 className="font-sans text-sm font-semibold leading-tight text-foreground">
                            {item.title}
                          </h3>
                          <button
                            onClick={() => removeItem(item.lineId)}
                            aria-label={`Remove ${item.title}`}
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
                            {formatDate(item.date)}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="size-3" />
                            {item.time}
                          </span>
                        </div>

                        <div className="mt-auto flex items-center justify-between pt-2">
                          <div className="inline-flex items-center rounded-full border border-border">
                            <button
                              onClick={() => setAdults(item.lineId, item.adults - 1)}
                              aria-label="Decrease travelers"
                              className="grid size-7 place-items-center rounded-full text-foreground hover:bg-muted disabled:opacity-40"
                              disabled={item.adults <= 1}
                            >
                              <Minus className="size-3.5" />
                            </button>
                            <span className="w-8 text-center text-sm font-semibold text-foreground">
                              {item.adults}
                            </span>
                            <button
                              onClick={() => setAdults(item.lineId, item.adults + 1)}
                              aria-label="Increase travelers"
                              className="grid size-7 place-items-center rounded-full text-foreground hover:bg-muted"
                            >
                              <Plus className="size-3.5" />
                            </button>
                          </div>
                          <span className="text-sm font-semibold text-foreground">
                            {money(item.total, currency)}
                          </span>
                        </div>

                        <div className="mt-2 inline-flex rounded-lg bg-secondary p-0.5 text-xs font-medium">
                          {(["deposit", "full"] as PaymentType[]).map((type) => (
                            <button
                              key={type}
                              onClick={() => setPaymentType(item.lineId, type)}
                              className={cn(
                                "rounded-md px-2.5 py-1 transition-colors",
                                item.paymentType === type
                                  ? "bg-background text-foreground shadow-sm"
                                  : "text-muted-foreground",
                              )}
                            >
                              {type === "deposit"
                                ? `Deposit ${money(item.depositAmount, currency)}`
                                : "Pay in full"}
                            </button>
                          ))}
                        </div>
                      </div>
                    </div>
                  ))}

                  <button
                    onClick={clear}
                    className="text-xs font-medium text-muted-foreground underline-offset-2 hover:text-destructive hover:underline"
                  >
                    Clear all
                  </button>
                </div>

                <footer className="border-t border-border px-5 py-4">
                  <dl className="space-y-1.5 text-sm">
                    <div className="flex items-center justify-between text-muted-foreground">
                      <dt>Trip total</dt>
                      <dd className="font-medium text-foreground">{money(tripTotal, currency)}</dd>
                    </div>
                    {remainingBalance > 0 && (
                      <div className="flex items-center justify-between text-muted-foreground">
                        <dt>Balance due at the tour</dt>
                        <dd>{money(remainingBalance, currency)}</dd>
                      </div>
                    )}
                    <div className="flex items-center justify-between border-t border-border pt-2 text-base">
                      <dt className="font-semibold text-foreground">Pay today</dt>
                      <dd className="font-bold text-ocean">{money(payToday, currency)}</dd>
                    </div>
                  </dl>

                  <Button
                    onClick={() => setConfirmed(true)}
                    size="lg"
                    className="mt-4 w-full rounded-full text-base"
                  >
                    Confirm booking
                  </Button>
                  <p className="mt-2 flex items-center justify-center gap-1.5 text-center text-xs text-muted-foreground">
                    <ShieldCheck className="size-3.5 text-tropical" />
                    Secure checkout · Free cancellation up to 48h before
                  </p>
                </footer>
              </>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  )
}
