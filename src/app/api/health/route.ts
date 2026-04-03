export const runtime = 'edge'
export const dynamic = 'force-dynamic'

export function GET() {
  return Response.json({
    status: 'ok',
    ts: new Date().toISOString(),
    version: process.env.NEXT_PUBLIC_APP_VERSION ?? 'unknown',
  })
}
