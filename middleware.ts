import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'
import { serverEnv } from '@/lib/env'

const SUSPICIOUS_PATH_RE = /(\.\.|\/etc\/|\/proc\/|<script|%3Cscript)/i
const BOT_UA_RE = /bot|crawl|spider|scan|masscan|zgrab|nuclei|sqlmap|nikto|curl|wget/i
// Legitimate crawlers — allow through bot filter. Reverse-DNS isn't available
// on Edge, so UA allowlist is the practical ceiling here.
const LEGIT_BOT_UA_RE = /googlebot|bingbot|duckduckbot|applebot|yandexbot|baiduspider|slurp|facebookexternalhit|twitterbot|linkedinbot/i

function buildCsp(nonce: string): string {
  return [
    "default-src 'self'",
    `script-src 'self' 'nonce-${nonce}' 'strict-dynamic' https://js.stripe.com https://browser.sentry-cdn.com`,
    // Tailwind v4 requires unsafe-inline styles — tracked in guia-seguridad.md
    "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
    "font-src 'self' https://fonts.gstatic.com",
    "img-src 'self' data: blob: https: https://*.supabase.co",
    "connect-src 'self' https://api.stripe.com https://*.supabase.co https://vitals.vercel-insights.com https://*.sentry.io https://o*.ingest.de.sentry.io",
    "frame-src https://js.stripe.com https://hooks.stripe.com",
    "object-src 'none'",
    "base-uri 'self'",
    "form-action 'self'",
  ].join('; ')
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl

  // 1. Suspicious path detection — block globally (decode to catch encoded traversals)
  let decodedPathname: string
  try {
    decodedPathname = decodeURIComponent(pathname)
  } catch {
    return new NextResponse('Bad Request', { status: 400 })
  }
  if (SUSPICIOUS_PATH_RE.test(decodedPathname)) {
    console.warn(JSON.stringify({
      event: 'security.suspicious_path',
      path: pathname,
      ip: request.headers.get('x-forwarded-for') ?? 'unknown',
      ts: new Date().toISOString(),
    }))
    return new NextResponse('Forbidden', { status: 403 })
  }

  // 2. Bot detection — block on API routes (webhooks excluded: they use HMAC auth)
  if (pathname.startsWith('/api/') && !pathname.startsWith('/api/webhooks/')) {
    const userAgent = request.headers.get('user-agent') ?? ''
    if (BOT_UA_RE.test(userAgent) && !LEGIT_BOT_UA_RE.test(userAgent)) {
      console.warn(JSON.stringify({
        event: 'security.bot_blocked',
        user_agent: userAgent.slice(0, 100),
        path: pathname,
        ts: new Date().toISOString(),
      }))
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // 3. Geo-blocking via Vercel Edge header (GEO_BLOCKED_COUNTRIES env, empty by default — RGPD)
  const blockedCountries = serverEnv.geoBlockedCountries
  if (blockedCountries.length > 0) {
    const country = request.headers.get('x-vercel-ip-country')
    if (country && blockedCountries.includes(country)) {
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // 4. CSP nonce per request — propagated to RSC via x-nonce and enforced via response CSP.
  const nonce = btoa(crypto.randomUUID())
  const csp = buildCsp(nonce)

  const requestHeaders = new Headers(request.headers)
  requestHeaders.set('x-nonce', nonce)
  // Next.js reads CSP from the request header to auto-add nonce to its own <script> tags.
  requestHeaders.set('content-security-policy', csp)

  // 5. Supabase auth session refresh (existing behavior) — pass modified headers through.
  const response = await updateSession(request, requestHeaders)
  response.headers.set('x-nonce', nonce)
  response.headers.set('Content-Security-Policy', csp)
  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets with common extensions
     *
     * Note: we DO run on /api/* so bot detection and CSP apply there too.
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
