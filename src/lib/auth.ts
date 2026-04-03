import { createClient } from '@/lib/supabase/server'
import { redirect } from 'next/navigation'

/**
 * Require authenticated user. Redirects to /login if no session.
 * Use in Server Components and Server Actions.
 */
export async function requireAuth() {
  const supabase = await createClient()
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser()

  if (error || !user) {
    redirect('/login')
  }

  return user
}

/**
 * Require authenticated user with specific role(s).
 * Redirects to /dashboard if role doesn't match.
 */
export async function requireRole(allowedRoles: string[]) {
  const user = await requireAuth()
  const supabase = await createClient()

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single()

  if (!profile || !allowedRoles.includes(profile.role)) {
    redirect('/portal')
  }

  return { user, role: profile.role }
}

/**
 * Get current user without redirecting.
 * Returns null if not authenticated.
 */
export async function getUser() {
  const supabase = await createClient()
  const {
    data: { user },
  } = await supabase.auth.getUser()
  return user
}
