import type { Currency, Price, Tour } from '@/lib/tours'

export type PaymentType = 'deposit' | 'full'
export type BookingState = 'pending' | 'confirmed'
export type Language = 'EN' | 'ES'

export const MIN_ADULTS = 1
export const MAX_ADULTS = 20

const CART_STORAGE_KEY = 'eddys-tours.cart.v1'
const PREFERENCES_STORAGE_KEY = 'eddys-tours.preferences.v1'
const PLACEHOLDER_IMAGE = '/placeholder.svg'

export interface CartItem {
  lineId: string
  tourId: string
  title: string
  image: string
  providerName: string
  date: string
  time: string
  adults: number
  /** Per person. */
  unitPrice: Price
  /** Per person, held at booking time. */
  unitDeposit: Price
  paymentType: PaymentType
  bookingState: BookingState
}

export interface AddItemInput {
  date?: string
  time?: string
  adults?: number
  paymentType?: PaymentType
}

export interface CartState {
  items: CartItem[]
  currency: Currency
  language: Language
}

const EMPTY_STATE: CartState = { items: [], currency: 'USD', language: 'EN' }

/*
 * The trip lives in `localStorage`, which is an external store rather than
 * React state: it outlives the page, and a second tab can change it underneath
 * us. Exposing it through `useSyncExternalStore` keeps the server-rendered
 * markup empty (no hydration mismatch) and gives cross-tab sync for free.
 */
let state: CartState = EMPTY_STATE
let initialized = false
const listeners = new Set<() => void>()

function isPrice(value: unknown): value is Price {
  return (
    typeof value === 'object' &&
    value !== null &&
    typeof (value as Price).usd === 'number' &&
    typeof (value as Price).mxn === 'number'
  )
}

/** `localStorage` is user-writable, so every restored line is re-validated. */
function isCartItem(value: unknown): value is CartItem {
  if (typeof value !== 'object' || value === null) return false
  const item = value as CartItem

  return (
    typeof item.lineId === 'string' &&
    typeof item.tourId === 'string' &&
    typeof item.title === 'string' &&
    typeof item.image === 'string' &&
    typeof item.providerName === 'string' &&
    typeof item.date === 'string' &&
    typeof item.time === 'string' &&
    Number.isFinite(item.adults) &&
    item.adults >= MIN_ADULTS &&
    item.adults <= MAX_ADULTS &&
    isPrice(item.unitPrice) &&
    isPrice(item.unitDeposit) &&
    (item.paymentType === 'deposit' || item.paymentType === 'full') &&
    (item.bookingState === 'pending' || item.bookingState === 'confirmed')
  )
}

function readStored(): CartState {
  if (typeof window === 'undefined') return EMPTY_STATE

  let items: CartItem[] = []
  try {
    const raw = window.localStorage.getItem(CART_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (Array.isArray(parsed)) items = parsed.filter(isCartItem)
  } catch {
    items = []
  }

  let currency: Currency = 'USD'
  let language: Language = 'EN'
  try {
    const raw = window.localStorage.getItem(PREFERENCES_STORAGE_KEY)
    const parsed: unknown = raw ? JSON.parse(raw) : null
    if (typeof parsed === 'object' && parsed !== null) {
      const preferences = parsed as Partial<Pick<CartState, 'currency' | 'language'>>
      if (preferences.currency === 'MXN') currency = 'MXN'
      if (preferences.language === 'ES') language = 'ES'
    }
  } catch {
    // Fall through to the defaults.
  }

  return { items, currency, language }
}

function persist(next: CartState) {
  try {
    window.localStorage.setItem(CART_STORAGE_KEY, JSON.stringify(next.items))
    window.localStorage.setItem(
      PREFERENCES_STORAGE_KEY,
      JSON.stringify({ currency: next.currency, language: next.language }),
    )
  } catch {
    // Private browsing or a full quota: the trip simply stays in memory.
  }
}

function emit() {
  for (const listener of listeners) listener()
}

/** Another tab changed the trip — adopt its state without writing back. */
function handleStorageEvent(event: StorageEvent) {
  if (event.key !== null && event.key !== CART_STORAGE_KEY && event.key !== PREFERENCES_STORAGE_KEY)
    return

  state = readStored()
  emit()
}

export function subscribe(listener: () => void): () => void {
  if (!initialized) {
    initialized = true
    state = readStored()
  }

  if (listeners.size === 0) window.addEventListener('storage', handleStorageEvent)
  listeners.add(listener)

  return () => {
    listeners.delete(listener)
    if (listeners.size === 0) window.removeEventListener('storage', handleStorageEvent)
  }
}

export function getSnapshot(): CartState {
  return state
}

export function getServerSnapshot(): CartState {
  return EMPTY_STATE
}

function update(next: CartState) {
  state = next
  persist(next)
  emit()
}

function clampAdults(adults: number) {
  return Math.max(MIN_ADULTS, Math.min(MAX_ADULTS, Math.round(adults)))
}

function createLineId(tourId: string) {
  const unique =
    typeof crypto !== 'undefined' && 'randomUUID' in crypto
      ? crypto.randomUUID()
      : `${Date.now()}-${Math.random().toString(36).slice(2, 9)}`

  return `${tourId}-${unique}`
}

export function addItem(tour: Tour, input: AddItemInput = {}) {
  if (tour.availableSpots < 1) return
  const item: CartItem = {
    lineId: createLineId(tour.id),
    tourId: tour.id,
    title: tour.title,
    image: tour.images[0] ?? PLACEHOLDER_IMAGE,
    providerName: tour.providerName,
    date: input.date ?? tour.availableDates[0] ?? '',
    time: input.time ?? tour.availableTimes[0] ?? '',
    adults: clampAdults(Math.min(tour.availableSpots, input.adults ?? 2)),
    unitPrice: tour.retailPrice,
    unitDeposit: tour.deposit,
    paymentType: input.paymentType ?? 'deposit',
    bookingState: 'pending',
  }

  update({ ...state, items: [...state.items, item] })
}

export function removeItem(lineId: string) {
  update({ ...state, items: state.items.filter((item) => item.lineId !== lineId) })
}

export function updateItem(lineId: string, patch: Partial<CartItem>) {
  update({
    ...state,
    items: state.items.map((item) => (item.lineId === lineId ? { ...item, ...patch } : item)),
  })
}

export function setPaymentType(lineId: string, paymentType: PaymentType) {
  updateItem(lineId, { paymentType })
}

export function setAdults(lineId: string, adults: number) {
  updateItem(lineId, { adults: clampAdults(adults) })
}

export function clear() {
  update({ ...state, items: [] })
}

export function setCurrency(currency: Currency) {
  update({ ...state, currency })
}

export function setLanguage(language: Language) {
  update({ ...state, language })
}
