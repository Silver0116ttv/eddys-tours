import 'server-only'

import { createClient } from '@supabase/supabase-js'
import { getSupabaseConfig } from '@/lib/supabase/config'
import type { Database } from '@/lib/supabase/database.types'

export function createPublicClient() {
  const { supabaseUrl, supabasePublishableKey } = getSupabaseConfig()

  return createClient<Database>(supabaseUrl, supabasePublishableKey, {
    auth: {
      autoRefreshToken: false,
      detectSessionInUrl: false,
      persistSession: false,
    },
  })
}
