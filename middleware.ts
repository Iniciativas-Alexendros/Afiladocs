import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

// Countries blocked from accessing the platform (geo-blocking via Vercel Edge)
const BLOCKED_COUNTRIES: string[] = []

// Patterns indicative of path traversal or injection attacks
const SUSPICIOUS_PATH_RE = /(\.\.|\/etc\/|\/proc\/|<script|%3Cscript)/i

// Known bad user-agents (bots/scrapers) — block on API routes only
const BOT_UA_RE = /bot|crawl|spider|scan|masscan|zgrab|nuclei|sqlmap|nikto/i

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
    if (BOT_UA_RE.test(userAgent)) {
      console.warn(JSON.stringify({
        event: 'security.bot_blocked',
        user_agent: userAgent.slice(0, 100),
        path: pathname,
        ts: new Date().toISOString(),
      }))
      return new NextResponse('Forbidden', { status: 403 })
    }
  }

  // 3. Geo-blocking via Vercel Edge headers (x-vercel-ip-country injected by Vercel CDN)
  if (BLOCKED_COUNTRIES.length > 0) {
    const country = request.headers.get('x-vercel-ip-country')
    if (country && BLOCKED_COUNTRIES.includes(country)) {
      return NextResponse.redirect(new URL('/blocked', request.url))
    }
  }

  // 4. Supabase auth session refresh (existing behavior)
  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - Static assets with common extensions
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
