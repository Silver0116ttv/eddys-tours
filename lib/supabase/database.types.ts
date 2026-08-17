export type Json =
  | string
  | number
  | boolean
  | null
  | { [key: string]: Json | undefined }
  | Json[]

export type AppRole = 'customer' | 'operator' | 'admin'
export type OperatorStatus = 'pending' | 'active' | 'suspended'
export type DepartureStatus = 'scheduled' | 'sold_out' | 'cancelled' | 'completed'
export type BookingStatus =
  | 'draft'
  | 'pending_payment'
  | 'confirmed'
  | 'cancelled'
  | 'completed'
  | 'refunded'
export type PaymentStatus =
  | 'pending'
  | 'requires_action'
  | 'succeeded'
  | 'failed'
  | 'partially_refunded'
  | 'refunded'
export type ReviewStatus = 'pending' | 'published' | 'rejected'

type Table<Row> = {
  Row: Row
  Insert: Partial<Row>
  Update: Partial<Row>
  Relationships: []
}

export type ProfileRow = {
  id: string
  role: AppRole
  full_name: string | null
  avatar_url: string | null
  created_at: string
  updated_at: string
}

export type OperatorRow = {
  id: string
  name: string
  slug: string
  contact_email: string | null
  status: OperatorStatus
  created_at: string
  updated_at: string
}

export type OperatorMemberRow = {
  operator_id: string
  user_id: string
  role: 'owner' | 'manager' | 'staff'
  created_at: string
}

export type TourRow = {
  id: string
  legacy_id: string | null
  operator_id: string
  slug: string
  title: string
  category: string
  location: string
  short_description: string
  full_description: string
  duration_minutes: number
  meeting_point: string
  included_items: string[]
  excluded_items: string[]
  requirements: string[]
  rating_average: number
  reviews_count: number
  featured: boolean
  popular: boolean
  published: boolean
  created_at: string
  updated_at: string
}

export type TourMediaRow = {
  id: string
  tour_id: string
  url: string
  alt_text: string
  position: number
  created_at: string
}

export type TourOptionRow = {
  id: string
  tour_id: string
  name: string
  retail_price_usd_minor: number
  retail_price_mxn_minor: number
  deposit_usd_minor: number
  min_participants: number
  max_participants: number
  active: boolean
  created_at: string
  updated_at: string
}

export type DepartureRow = {
  id: string
  tour_id: string
  starts_at: string
  capacity: number
  status: DepartureStatus
  created_at: string
  updated_at: string
}

export type BookingRow = {
  id: string
  reference: string
  customer_id: string | null
  guest_email: string
  status: BookingStatus
  currency: 'USD' | 'MXN'
  subtotal_minor: number
  amount_due_minor: number
  amount_paid_minor: number
  expires_at: string | null
  created_at: string
  updated_at: string
}

export type BookingItemRow = {
  id: string
  booking_id: string
  departure_id: string
  tour_option_id: string
  quantity: number
  unit_price_minor: number
  unit_deposit_minor: number
  title_snapshot: string
  created_at: string
}

export type InventoryHoldRow = {
  id: string
  booking_id: string
  departure_id: string
  quantity: number
  expires_at: string
  created_at: string
}

export type PaymentRow = {
  id: string
  booking_id: string
  stripe_payment_intent_id: string | null
  status: PaymentStatus
  currency: 'USD' | 'MXN'
  amount_minor: number
  refunded_minor: number
  created_at: string
  updated_at: string
}

export type ReviewRow = {
  id: string
  tour_id: string
  booking_id: string
  customer_id: string
  rating: number
  content: string
  status: ReviewStatus
  verified: boolean
  published_at: string | null
  created_at: string
  updated_at: string
}

export type FavoriteRow = {
  user_id: string
  tour_id: string
  created_at: string
}

export type NewsletterSubscriberRow = {
  id: string
  email: string
  status: 'pending' | 'subscribed' | 'unsubscribed'
  created_at: string
  updated_at: string
}

export type Database = {
  public: {
    Tables: {
      profiles: Table<ProfileRow>
      operators: Table<OperatorRow>
      operator_members: Table<OperatorMemberRow>
      tours: Table<TourRow>
      tour_media: Table<TourMediaRow>
      tour_options: Table<TourOptionRow>
      departures: Table<DepartureRow>
      bookings: Table<BookingRow>
      booking_items: Table<BookingItemRow>
      inventory_holds: Table<InventoryHoldRow>
      payments: Table<PaymentRow>
      reviews: Table<ReviewRow>
      favorites: Table<FavoriteRow>
      newsletter_subscribers: Table<NewsletterSubscriberRow>
    }
    Views: Record<string, never>
    Functions: Record<string, never>
    Enums: {
      app_role: AppRole
      operator_status: OperatorStatus
      departure_status: DepartureStatus
      booking_status: BookingStatus
      payment_status: PaymentStatus
      review_status: ReviewStatus
    }
    CompositeTypes: Record<string, never>
  }
}
