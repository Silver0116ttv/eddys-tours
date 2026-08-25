import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { adminErrorResponse, isUuid } from '@/lib/api/admin-response'
import { AdminDataError, isReviewStatus, moderateReview } from '@/lib/data/admin'

interface RouteContext {
  params: Promise<{ reviewId: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { reviewId } = await context.params
    if (!isUuid(reviewId)) throw new AdminDataError('Invalid review id.', 400)

    const body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) {
      throw new AdminDataError('A JSON body is required.', 400)
    }

    const { status } = body as { status?: unknown }
    if (typeof status !== 'string' || !isReviewStatus(status)) {
      throw new AdminDataError('Invalid review status.', 400)
    }

    return NextResponse.json({ data: await moderateReview(reviewId, status) })
  } catch (error) {
    return adminErrorResponse(error)
  }
}
