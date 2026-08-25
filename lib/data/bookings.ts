import 'server-only'

import { isSupabaseConfigured } from '@/lib/supabase/config'
import type {
  BookingChannel,
  CreatedBookingRow,
  Json,
  PaymentChoice,
} from '@/lib/supabase/database.types'
import { createClient } from '@/lib/supabase/server'

export interface BookingRequestItem {
  departureId: string
  tourOptionId: string
  quantity: number
  paymentChoice: PaymentChoice
}

export interface CreateBookingRequest {
  guestEmail: string
  guestName: string
  guestPhone: string
  currency: 'USD' | 'MXN'
  items: BookingRequestItem[]
  channel?: BookingChannel
  customerNotes?: string
  holdMinutes?: number
}

export async function createBooking(
  request: CreateBookingRequest,
): Promise<CreatedBookingRow> {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured.')

  const supabase = await createClient()
  const items: Json = request.items.map((item) => ({
    departure_id: item.departureId,
    tour_option_id: item.tourOptionId,
    quantity: item.quantity,
    payment_choice: item.paymentChoice,
  }))
  const { data, error } = await supabase.rpc('create_booking', {
    guest_email: request.guestEmail,
    guest_name: request.guestName,
    guest_phone: request.guestPhone,
    currency: request.currency,
    items,
    channel: request.channel ?? 'web',
    customer_notes: request.customerNotes ?? null,
    hold_minutes: request.holdMinutes ?? 15,
  })

  if (error) throw new Error(error.message)
  const booking = data.at(0)
  if (!booking) throw new Error('The booking transaction returned no result.')

  return booking
}

export async function cancelPendingBooking(bookingId: string) {
  if (!isSupabaseConfigured()) throw new Error('Supabase is not configured.')

  const supabase = await createClient()
  const { data, error } = await supabase.rpc('cancel_pending_booking', {
    target_booking_id: bookingId,
  })

  if (error) throw new Error(error.message)
  return data
}
