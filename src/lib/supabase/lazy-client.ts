import { publicEnv } from '@/lib/env'
import type { Database } from '@/types/database.types'

export type SupabaseBrowserClient = Awaited<
  ReturnType<typeof loadSupabaseBrowserClient>
>

export async function loadSupabaseBrowserClient() {
  const { createBrowserClient } = await import('@supabase/ssr')
  return createBrowserClient<Database>(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
  )
}
