// nodejs runtime: elimina el warning de Next.js 15 sobre edge + static generation.
// force-dynamic: garantiza que el timestamp sea siempre fresco (nunca cacheado).
export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({
    status: 'ok',
    ts: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
  })
}
