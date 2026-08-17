import 'server-only'

import { isSupabaseConfigured } from '@/lib/supabase/config'
import { createClient } from '@/lib/supabase/server'
import type { AppRole } from '@/lib/supabase/database.types'

export interface Viewer {
  userId: string
  role: AppRole
  fullName: string | null
}

export async function getViewer(): Promise<Viewer | null> {
  if (!isSupabaseConfigured()) return null

  const supabase = await createClient()
  const { data: claimsData, error: claimsError } = await supabase.auth.getClaims()
  const userId = claimsData?.claims?.sub

  if (claimsError || typeof userId !== 'string') return null

  const { data: profile, error: profileError } = await supabase
    .from('profiles')
    .select('role, full_name')
    .eq('id', userId)
    .single()

  if (profileError || !profile) return null

  return {
    userId,
    role: profile.role,
    fullName: profile.full_name,
  }
}

export function viewerHasRole(viewer: Viewer | null, allowedRoles: AppRole[]) {
  return Boolean(viewer && allowedRoles.includes(viewer.role))
}
