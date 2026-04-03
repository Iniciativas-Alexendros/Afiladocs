import { NextResponse } from 'next/server'
import { serverEnv } from '@/lib/env'
import { prisma } from '@/lib/prisma/client'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

/**
 * Cron: runs daily at 03:00 UTC (vercel.json schedule: "0 3 * * *")
 *
 * Soft-deletes orders that have been in intake_pending for more than 90 days
 * without any intake being submitted (abandoned orders).
 * Verified via CRON_SECRET header (set by Vercel Cron).
 */
export async function GET(request: Request) {
  const authHeader = request.headers.get('authorization')
  const cronSecret = serverEnv.cronSecret

  if (cronSecret && authHeader !== `Bearer ${cronSecret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
  }

  try {
    const cutoff = new Date()
    cutoff.setDate(cutoff.getDate() - 90)

    const result = await prisma.orders.updateMany({
      where: {
        status: 'intake_pending',
        intake_completed_at: null,
        created_at: { lt: cutoff },
        deleted_at: null,
      },
      data: { deleted_at: new Date() },
    })

    console.log(JSON.stringify({
      event: 'cron.cleanup_expired_sessions.completed',
      soft_deleted: result.count,
      ts: new Date().toISOString(),
    }))

    return NextResponse.json({ ok: true, softDeleted: result.count })
  } catch (err) {
    console.error(JSON.stringify({
      event: 'cron.cleanup_expired_sessions.error',
      message: err instanceof Error ? err.message : 'Unknown',
      ts: new Date().toISOString(),
    }))
    return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
  }
}
