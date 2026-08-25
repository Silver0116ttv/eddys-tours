import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { revalidateTag } from 'next/cache'
import { adminErrorResponse, isUuid } from '@/lib/api/admin-response'
import { AdminDataError, updateTourEditorial } from '@/lib/data/admin'

interface RouteContext {
  params: Promise<{ tourId: string }>
}

export async function PATCH(request: NextRequest, context: RouteContext) {
  try {
    const { tourId } = await context.params
    if (!isUuid(tourId)) throw new AdminDataError('Invalid tour id.', 400)

    const body: unknown = await request.json()
    if (typeof body !== 'object' || body === null) {
      throw new AdminDataError('A JSON body is required.', 400)
    }

    const { published, featured, popular } = body as Record<string, unknown>
    if (
      typeof published !== 'boolean' ||
      typeof featured !== 'boolean' ||
      typeof popular !== 'boolean'
    ) {
      throw new AdminDataError('published, featured, and popular must be boolean.', 400)
    }

    const data = await updateTourEditorial(tourId, { published, featured, popular })
    revalidateTag('tour-catalog', 'max')
    return NextResponse.json({ data })
  } catch (error) {
    return adminErrorResponse(error)
  }
}
