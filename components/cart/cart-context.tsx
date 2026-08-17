'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from 'react'
import type { Tour } from '@/lib/tours'

export type PaymentType = 'deposit' | 'full'
export type BookingState = 'pending' | 'confirmed'

export interface CartItem {
  lineId: string
  tourId: string
  title: string
  image: string
  providerName: string
  date: string
  time: string
  adults: number
  /** per person, USD */
  unitPriceUSD: number
  /** per person, USD */
  unitDepositUSD: number
  paymentType: PaymentType
  bookingState: BookingState
}

export interface CartItemComputed extends CartItem {
  total: number
  depositAmount: number
  amountDueToday: number
  remainingBalance: number
}

interface AddItemInput {
  date?: string
  time?: string
  adults?: number
  paymentType?: PaymentType
}

type Currency = 'USD' | 'MXN'
type Language = 'EN' | 'ES'

interface CartContextValue {
  items: CartItemComputed[]
  itemCount: number
  isOpen: boolean
  openCart: () => void
  closeCart: () => void
  addItem: (tour: Tour, input?: AddItemInput) => void
  removeItem: (lineId: string) => void
  updateItem: (lineId: string, patch: Partial<CartItem>) => void
  setPaymentType: (lineId: string, type: PaymentType) => void
  setAdults: (lineId: string, adults: number) => void
  clear: () => void
  tripTotal: number
  payToday: number
  remainingBalance: number
  // preferences
  currency: Currency
  setCurrency: (c: Currency) => void
  language: Language
  setLanguage: (l: Language) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function computeItem(item: CartItem): CartItemComputed {
  const total = item.unitPriceUSD * item.adults
  const depositAmount = item.unitDepositUSD * item.adults
  const amountDueToday = item.paymentType === 'deposit' ? depositAmount : total
  return {
    ...item,
    total,
    depositAmount,
    amountDueToday,
    remainingBalance: total - amountDueToday,
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const [rawItems, setRawItems] = useState<CartItem[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [currency, setCurrency] = useState<Currency>('USD')
  const [language, setLanguage] = useState<Language>('EN')

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((tour: Tour, input: AddItemInput = {}) => {
    const lineId = `${tour.id}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setRawItems((prev) => [
      ...prev,
      {
        lineId,
        tourId: tour.id,
        title: tour.title,
        image: tour.images[0],
        providerName: tour.providerName,
        date: input.date ?? tour.availableDates[0],
        time: input.time ?? tour.availableTimes[0],
        adults: input.adults ?? 2,
        unitPriceUSD: tour.retailPriceUSD,
        unitDepositUSD: tour.depositAmount,
        paymentType: input.paymentType ?? 'deposit',
        bookingState: 'pending',
      },
    ])
    setIsOpen(true)
  }, [])

  const removeItem = useCallback((lineId: string) => {
    setRawItems((prev) => prev.filter((i) => i.lineId !== lineId))
  }, [])

  const updateItem = useCallback((lineId: string, patch: Partial<CartItem>) => {
    setRawItems((prev) =>
      prev.map((i) => (i.lineId === lineId ? { ...i, ...patch } : i)),
    )
  }, [])

  const setPaymentType = useCallback(
    (lineId: string, type: PaymentType) => updateItem(lineId, { paymentType: type }),
    [updateItem],
  )

  const setAdults = useCallback(
    (lineId: string, adults: number) =>
      updateItem(lineId, { adults: Math.max(1, Math.min(20, adults)) }),
    [updateItem],
  )

  const clear = useCallback(() => setRawItems([]), [])

  const items = useMemo(() => rawItems.map(computeItem), [rawItems])

  const { tripTotal, payToday, remainingBalance } = useMemo(() => {
    const tripTotal = items.reduce((s, i) => s + i.total, 0)
    const payToday = items.reduce((s, i) => s + i.amountDueToday, 0)
    return { tripTotal, payToday, remainingBalance: tripTotal - payToday }
  }, [items])

  const value: CartContextValue = {
    items,
    itemCount: items.length,
    isOpen,
    openCart,
    closeCart,
    addItem,
    removeItem,
    updateItem,
    setPaymentType,
    setAdults,
    clear,
    tripTotal,
    payToday,
    remainingBalance,
    currency,
    setCurrency,
    language,
    setLanguage,
  }

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const ctx = useContext(CartContext)
  if (!ctx) throw new Error('useCart must be used within CartProvider')
  return ctx
}
