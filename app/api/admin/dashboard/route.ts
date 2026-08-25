import { NextResponse } from 'next/server'
import { adminErrorResponse } from '@/lib/api/admin-response'
import { getAdminDashboardSummary } from '@/lib/data/admin'

export const dynamic = 'force-dynamic'

export async function GET() {
  try {
    return NextResponse.json({ data: await getAdminDashboardSummary() })
  } catch (error) {
    return adminErrorResponse(error)
  }
}
