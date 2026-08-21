'use client'

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  useSyncExternalStore,
  type ReactNode,
} from 'react'
import * as cartStore from '@/lib/cart-store'
import type {
  AddItemInput,
  CartItem,
  Language,
  PaymentType,
} from '@/lib/cart-store'
import { scalePrice, subtractPrice, sumPrices, type Currency, type Price, type Tour } from '@/lib/tours'

export type { CartItem, Language, PaymentType } from '@/lib/cart-store'

export interface CartItemComputed extends CartItem {
  total: Price
  depositTotal: Price
  amountDueToday: Price
  remainingBalance: Price
}

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
  tripTotal: Price
  payToday: Price
  remainingBalance: Price
  currency: Currency
  setCurrency: (currency: Currency) => void
  language: Language
  setLanguage: (language: Language) => void
}

const CartContext = createContext<CartContextValue | null>(null)

function computeItem(item: CartItem): CartItemComputed {
  const total = scalePrice(item.unitPrice, item.adults)
  const depositTotal = scalePrice(item.unitDeposit, item.adults)
  const amountDueToday = item.paymentType === 'deposit' ? depositTotal : total

  return {
    ...item,
    total,
    depositTotal,
    amountDueToday,
    remainingBalance: subtractPrice(total, amountDueToday),
  }
}

export function CartProvider({ children }: { children: ReactNode }) {
  const state = useSyncExternalStore(
    cartStore.subscribe,
    cartStore.getSnapshot,
    cartStore.getServerSnapshot,
  )
  // Drawer visibility is view state, not trip state, so it stays in React.
  const [isOpen, setIsOpen] = useState(false)

  const openCart = useCallback(() => setIsOpen(true), [])
  const closeCart = useCallback(() => setIsOpen(false), [])

  const addItem = useCallback((tour: Tour, input?: AddItemInput) => {
    cartStore.addItem(tour, input)
    setIsOpen(true)
  }, [])

  const items = useMemo(() => state.items.map(computeItem), [state.items])

  const { tripTotal, payToday, remainingBalance } = useMemo(() => {
    const total = sumPrices(items.map((item) => item.total))
    const dueToday = sumPrices(items.map((item) => item.amountDueToday))

    return {
      tripTotal: total,
      payToday: dueToday,
      remainingBalance: subtractPrice(total, dueToday),
    }
  }, [items])

  const value = useMemo<CartContextValue>(
    () => ({
      items,
      itemCount: items.length,
      isOpen,
      openCart,
      closeCart,
      addItem,
      removeItem: cartStore.removeItem,
      updateItem: cartStore.updateItem,
      setPaymentType: cartStore.setPaymentType,
      setAdults: cartStore.setAdults,
      clear: cartStore.clear,
      tripTotal,
      payToday,
      remainingBalance,
      currency: state.currency,
      setCurrency: cartStore.setCurrency,
      language: state.language,
      setLanguage: cartStore.setLanguage,
    }),
    [
      items,
      isOpen,
      openCart,
      closeCart,
      addItem,
      tripTotal,
      payToday,
      remainingBalance,
      state.currency,
      state.language,
    ],
  )

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>
}

export function useCart() {
  const context = useContext(CartContext)
  if (!context) throw new Error('useCart must be used within CartProvider')
  return context
}
