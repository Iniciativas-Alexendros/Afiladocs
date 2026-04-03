import { createClient } from '@supabase/supabase-js'
import { publicEnv, serverEnv } from '@/lib/env'
import type { Database } from '@/types/database.types'

/**
 * Service role client for backend-only operations.
 * Bypasses RLS — NEVER use in Client Components or expose to the browser.
 */
export function createServiceRoleClient() {
  return createClient<Database>(
    publicEnv.supabaseUrl,
    serverEnv.supabaseServiceRoleKey,
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    },
  )
}
