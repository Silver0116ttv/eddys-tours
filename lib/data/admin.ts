import 'server-only'

import { getViewer } from '@/lib/auth/viewer'
import { isSupabaseConfigured } from '@/lib/supabase/config'
import type {
  BookingStatus,
  Json,
  ManagedTourRow,
  OperationsBookingItemRow,
  ReviewModerationRow,
  ReviewStatus,
  TourRow,
  BookingRow,
  ReviewRow,
} from '@/lib/supabase/database.types'
import { createClient } from '@/lib/supabase/server'

const BOOKING_STATUSES: readonly BookingStatus[] = [
  'draft',
  'pending_payment',
  'confirmed',
  'cancelled',
  'completed',
  'refunded',
]

const REVIEW_STATUSES: readonly ReviewStatus[] = ['pending', 'published', 'rejected']

export class AdminDataError extends Error {
  constructor(
    message: string,
    public readonly status: 400 | 401 | 403 | 404 | 500 | 503,
  ) {
    super(message)
    this.name = 'AdminDataError'
  }
}

export interface AdminDashboardSummary {
  bookingsTotal: number
  bookingsPending: number
  bookingsConfirmed: number
  grossPaidUsdMinor: number
  grossPaidMxnMinor: number
  publishedTours: number
  activeOperators: number
  pendingReviews: number
  upcomingDepartures: number
}

export interface AdminListResult<T> {
  data: T[]
  count: number
  page: number
  pageSize: number
}

interface ListOptions<TStatus extends string> {
  page?: number
  pageSize?: number
  status?: TStatus
  search?: string
}

async function requireAdmin() {
  if (!isSupabaseConfigured()) {
    throw new AdminDataError('Supabase is not configured.', 503)
  }

  const viewer = await getViewer()
  if (!viewer) throw new AdminDataError('Authentication is required.', 401)
  if (viewer.role !== 'admin') throw new AdminDataError('Administrator access is required.', 403)

  return createClient()
}

function readNumber(value: Json | undefined) {
  return typeof value === 'number' && Number.isFinite(value) ? value : 0
}

function asObject(value: Json): Record<string, Json | undefined> {
  return typeof value === 'object' && value !== null && !Array.isArray(value) ? value : {}
}

function normalizePagination(page = 1, pageSize = 25) {
  const safePage = Math.max(1, Math.trunc(page) || 1)
  const safePageSize = Math.min(100, Math.max(1, Math.trunc(pageSize) || 25))
  const from = (safePage - 1) * safePageSize

  return { page: safePage, pageSize: safePageSize, from, to: from + safePageSize - 1 }
}

export function isBookingStatus(value: string | null): value is BookingStatus {
  return Boolean(value && (BOOKING_STATUSES as readonly string[]).includes(value))
}

export function isReviewStatus(value: string | null): value is ReviewStatus {
  return Boolean(value && (REVIEW_STATUSES as readonly string[]).includes(value))
}

export async function getAdminDashboardSummary(): Promise<AdminDashboardSummary> {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.rpc('admin_dashboard_summary')

  if (error) throw new AdminDataError(error.message, 500)

  const summary = asObject(data)
  return {
    bookingsTotal: readNumber(summary.bookings_total),
    bookingsPending: readNumber(summary.bookings_pending),
    bookingsConfirmed: readNumber(summary.bookings_confirmed),
    grossPaidUsdMinor: readNumber(summary.gross_paid_usd_minor),
    grossPaidMxnMinor: readNumber(summary.gross_paid_mxn_minor),
    publishedTours: readNumber(summary.published_tours),
    activeOperators: readNumber(summary.active_operators),
    pendingReviews: readNumber(summary.pending_reviews),
    upcomingDepartures: readNumber(summary.upcoming_departures),
  }
}

export async function getAdminBookings(
  options: ListOptions<BookingStatus> = {},
): Promise<AdminListResult<OperationsBookingItemRow>> {
  const supabase = await requireAdmin()
  const pagination = normalizePagination(options.page, options.pageSize)
  let query = supabase
    .from('operations_booking_items')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pagination.from, pagination.to)

  if (options.status) query = query.eq('status', options.status)
  if (options.search?.trim()) {
    query = query.ilike('reference', `%${options.search.trim().slice(0, 40)}%`)
  }

  const { data, count, error } = await query
  if (error) throw new AdminDataError(error.message, 500)

  return {
    data: data ?? [],
    count: count ?? 0,
    page: pagination.page,
    pageSize: pagination.pageSize,
  }
}

export async function getManagedTours(
  options: Omit<ListOptions<never>, 'status'> = {},
): Promise<AdminListResult<ManagedTourRow>> {
  const supabase = await requireAdmin()
  const pagination = normalizePagination(options.page, options.pageSize)
  let query = supabase
    .from('managed_tours')
    .select('*', { count: 'exact' })
    .order('updated_at', { ascending: false })
    .range(pagination.from, pagination.to)

  if (options.search?.trim()) {
    query = query.ilike('title', `%${options.search.trim().slice(0, 80)}%`)
  }

  const { data, count, error } = await query
  if (error) throw new AdminDataError(error.message, 500)

  return {
    data: data ?? [],
    count: count ?? 0,
    page: pagination.page,
    pageSize: pagination.pageSize,
  }
}

export async function getReviewModerationQueue(
  options: ListOptions<ReviewStatus> = {},
): Promise<AdminListResult<ReviewModerationRow>> {
  const supabase = await requireAdmin()
  const pagination = normalizePagination(options.page, options.pageSize)
  let query = supabase
    .from('review_moderation_queue')
    .select('*', { count: 'exact' })
    .order('created_at', { ascending: false })
    .range(pagination.from, pagination.to)

  if (options.status) query = query.eq('status', options.status)
  if (options.search?.trim()) {
    query = query.ilike('tour_title', `%${options.search.trim().slice(0, 80)}%`)
  }

  const { data, count, error } = await query
  if (error) throw new AdminDataError(error.message, 500)

  return {
    data: data ?? [],
    count: count ?? 0,
    page: pagination.page,
    pageSize: pagination.pageSize,
  }
}

export async function updateAdminBookingStatus(
  bookingId: string,
  status: BookingStatus,
  note?: string,
): Promise<BookingRow> {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.rpc('admin_update_booking_status', {
    target_booking_id: bookingId,
    new_status: status,
    event_note: note?.trim().slice(0, 500) || null,
  })

  if (error) throw new AdminDataError(error.message, 400)
  return data
}

export async function moderateReview(
  reviewId: string,
  status: ReviewStatus,
): Promise<ReviewRow> {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.rpc('admin_moderate_review', {
    target_review_id: reviewId,
    new_status: status,
  })

  if (error) throw new AdminDataError(error.message, 400)
  return data
}

export async function updateTourEditorial(
  tourId: string,
  input: { published: boolean; featured: boolean; popular: boolean },
): Promise<TourRow> {
  const supabase = await requireAdmin()
  const { data, error } = await supabase.rpc('admin_update_tour_editorial', {
    target_tour_id: tourId,
    publish: input.published,
    feature: input.featured,
    mark_popular: input.popular,
  })

  if (error) throw new AdminDataError(error.message, 400)
  return data
}
