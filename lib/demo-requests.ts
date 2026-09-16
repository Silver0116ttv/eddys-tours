import type { CartItem } from '@/lib/cart-store'
import type { AdminRecord } from '@/lib/admin-workspace'
import type { Currency, Price } from '@/lib/tours'
import { toVallartaDate } from '@/lib/time'

// This browser-only adapter is the replacement point for the future booking API.
// These records are explicitly demonstrations, never inventory holds or payments.
const requestsKey = 'eddys.demo-requests.v1'
const contactsKey = 'eddys.demo-contacts.v1'
export type DemoRequest = {
  reference: string
  name: string
  email: string
  phone: string
  notes: string
  currency: Currency
  items: CartItem[]
  total: Price
  due: Price
  createdAt: string
}
export function readDemoRequests(): DemoRequest[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem(requestsKey) ?? '[]')
    return Array.isArray(rows)
      ? rows.filter(
          (r): r is DemoRequest =>
            r &&
            typeof r.reference === 'string' &&
            typeof r.email === 'string' &&
            Array.isArray(r.items) &&
            r.items.every(
              (i: CartItem) =>
                typeof i.title === 'string' && typeof i.lineId === 'string',
            ) &&
            r.total &&
            r.due,
        )
      : []
  } catch {
    return []
  }
}
export function saveDemoRequest(
  input: Omit<DemoRequest, 'reference' | 'createdAt'>,
): DemoRequest {
  const request = {
    ...input,
    reference: `DEMO-${crypto.randomUUID().slice(0, 8).toUpperCase()}`,
    createdAt: new Date().toISOString(),
  }
  localStorage.setItem(
    requestsKey,
    JSON.stringify([request, ...readDemoRequests()].slice(0, 50)),
  )
  window.dispatchEvent(new Event('demo-requests-change'))
  return request
}
export function readDemoContacts(): AdminRecord[] {
  try {
    const rows: unknown = JSON.parse(localStorage.getItem(contactsKey) ?? '[]')
    return Array.isArray(rows)
      ? rows.filter(
          (r): r is AdminRecord =>
            r && typeof r.id === 'string' && typeof r.name === 'string',
        )
      : []
  } catch {
    return []
  }
}
export function saveDemoContact(input: {
  name: string
  email: string
  subject: string
  message: string
}) {
  const contact: AdminRecord = {
    id: `inquiry-${crypto.randomUUID()}`,
    name: input.name,
    email: input.email,
    subtitle: input.subject,
    description: input.message,
    status: 'new',
    date: toVallartaDate(new Date()),
  }
  localStorage.setItem(
    contactsKey,
    JSON.stringify([contact, ...readDemoContacts()].slice(0, 100)),
  )
  window.dispatchEvent(new Event('demo-requests-change'))
}
export function demoRequestBookings(): AdminRecord[] {
  return readDemoRequests().flatMap((request) =>
    request.items.map((item, index) => ({
      id: `${request.reference}-${index}`,
      reference: request.reference,
      name: request.name,
      subtitle: item.title,
      email: request.email,
      phone: request.phone,
      date: item.date,
      time: item.time,
      quantity: item.adults,
      amount:
        item.unitPrice[request.currency === 'MXN' ? 'mxn' : 'usd'] *
        item.adults,
      paid: 0,
      currency: request.currency,
      status: 'pending_payment',
      note: request.notes,
    })),
  )
}
