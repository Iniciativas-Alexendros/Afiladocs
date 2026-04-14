import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { publicEnv } from '@/lib/env'

export async function updateSession(
  request: NextRequest,
  requestHeaders?: Headers,
) {
  const headers = requestHeaders ?? new Headers(request.headers)

  let supabaseResponse = NextResponse.next({
    request: { headers },
  })

  const supabase = createServerClient(
    publicEnv.supabaseUrl,
    publicEnv.supabaseAnonKey,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll()
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value }) =>
            request.cookies.set(name, value),
          )
          supabaseResponse = NextResponse.next({
            request: { headers },
          })
          cookiesToSet.forEach(({ name, value, options }) =>
            supabaseResponse.cookies.set(name, value, options),
          )
        },
      },
    },
  )

  // Refresh session — this call is critical for keeping the auth
  // session alive on every navigation. Return value intentionally unused.
  await supabase.auth.getUser()

  return supabaseResponse
}
