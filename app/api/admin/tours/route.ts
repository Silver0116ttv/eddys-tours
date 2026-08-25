import type { NextRequest } from 'next/server'
import { NextResponse } from 'next/server'
import { adminErrorResponse, readPositiveInteger } from '@/lib/api/admin-response'
import { getManagedTours } from '@/lib/data/admin'

export const dynamic = 'force-dynamic'

export async function GET(request: NextRequest) {
  try {
    const params = request.nextUrl.searchParams
    const data = await getManagedTours({
      page: readPositiveInteger(params.get('page'), 1),
      pageSize: readPositiveInteger(params.get('pageSize'), 25),
      search: params.get('search') ?? undefined,
    })

    return NextResponse.json(data)
  } catch (error) {
    return adminErrorResponse(error)
  }
}
