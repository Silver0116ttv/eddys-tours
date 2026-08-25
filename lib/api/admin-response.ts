import { NextResponse } from 'next/server'
import { AdminDataError } from '@/lib/data/admin'

export function adminErrorResponse(error: unknown) {
  if (error instanceof AdminDataError) {
    return NextResponse.json({ error: error.message }, { status: error.status })
  }

  console.error('Unexpected administrator API error.', error)
  return NextResponse.json({ error: 'Unexpected server error.' }, { status: 500 })
}

export function readPositiveInteger(value: string | null, fallback: number) {
  if (!value) return fallback
  const parsed = Number.parseInt(value, 10)
  return Number.isFinite(parsed) && parsed > 0 ? parsed : fallback
}

export function isUuid(value: string) {
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value,
  )
}
