import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { adminErrorResponse, isUuid } from '@/lib/api/admin-response'
import { AdminDataError, isBookingStatus, updateAdminBookingStatus } from '@/lib/data/admin'

interface RouteContext {
  params: Promise<{ bookingId: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { bookingId } = await context.params
    if (!isUuid(bookingId)) throw new AdminDataError('Invalid booking id.', 400)

    const body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) {
      throw new AdminDataError('A JSON body is required.', 400)
    }

    const { status, note } = body as { status?: unknown; note?: unknown }
    if (typeof status !== 'string' || !isBookingStatus(status)) {
      throw new AdminDataError('Invalid booking status.', 400)
    }

    const data = await updateAdminBookingStatus(
      bookingId,
      status,
      typeof note === 'string' ? note : undefined,
    )
    return NextResponse.json({ data })
  } catch (error) {
    return adminErrorResponse(error)
  }
}
