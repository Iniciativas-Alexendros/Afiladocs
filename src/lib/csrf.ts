import { publicEnv } from '@/lib/env'

/**
 * Validates the Origin header of a request against allowed origins.
 * Rejects cross-origin requests from unexpected origins.
 * Returns true if the request should be allowed, false if it should be rejected.
 *
 * Note: Requests without an Origin header (server-to-server, curl) are allowed
 * to support legitimate integrations. The check only blocks mismatched browser origins.
 */
export function isAllowedOrigin(request: Request): boolean {
  const origin = request.headers.get('origin')
  if (!origin) return true // No Origin header — allow (server-to-server, Postman, etc.)

  const siteUrl = publicEnv.siteUrl
  const allowedOrigins = new Set([
    siteUrl,
    // Always allow the .vercel.app preview domain as fallback
    'https://afiladocs.vercel.app',
  ])

  return allowedOrigins.has(origin)
}
