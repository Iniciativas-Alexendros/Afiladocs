import { Prisma } from '@prisma/client'
import { prisma } from '@/lib/prisma/client'

export type KpiRange = '7d' | '30d' | '90d' | 'mtd'

export function rangeToDate(range: KpiRange): Date {
  const now = new Date()
  if (range === 'mtd') {
    return new Date(Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1, 0, 0, 0, 0))
  }
  const dayMap: Record<Exclude<KpiRange, 'mtd'>, number> = { '7d': 7, '30d': 30, '90d': 90 }
  const days = dayMap[range]
  return new Date(now.getTime() - days * 24 * 60 * 60 * 1000)
}

export async function getRevenueMonthly(
  range: KpiRange = '90d',
): Promise<Array<{ month: string; revenue_cents: number }>> {
  const since = rangeToDate(range)
  const rows = await prisma.$queryRaw<Array<{ month: Date; revenue_cents: bigint }>>(
    Prisma.sql`
      SELECT date_trunc('month', created_at) AS month,
             SUM(amount_cents)::bigint AS revenue_cents
      FROM orders
      WHERE status = 'completed'
        AND created_at >= ${since}
      GROUP BY 1
      ORDER BY 1 ASC
    `,
  )
  return rows.map((r) => ({
    month: r.month.toISOString(),
    revenue_cents: Number(r.revenue_cents ?? BigInt(0)),
  }))
}

export async function getSlaPercentiles(
  days = 30,
): Promise<{ p50: number | null; p90: number | null; p99: number | null; sample_size: number }> {
  if (!Number.isInteger(days) || days <= 0) {
    throw new Error('getSlaPercentiles: days must be a positive integer')
  }

  const rows = await prisma.$queryRaw<
    Array<{
      p50: number | null
      p90: number | null
      p99: number | null
      sample_size: bigint
    }>
  >(Prisma.sql`
    SELECT
      percentile_cont(0.5)  WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM d.signed_at - o.intake_completed_at)/86400) AS p50,
      percentile_cont(0.9)  WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM d.signed_at - o.intake_completed_at)/86400) AS p90,
      percentile_cont(0.99) WITHIN GROUP (ORDER BY EXTRACT(EPOCH FROM d.signed_at - o.intake_completed_at)/86400) AS p99,
      COUNT(*)::bigint AS sample_size
    FROM orders o
    JOIN documents d ON d.order_id = o.id
    WHERE d.signed_at IS NOT NULL
      AND o.intake_completed_at IS NOT NULL
      AND d.signed_at >= NOW() - (${Prisma.raw(String(days))} || ' days')::interval
  `)

  return buildSlaResult(rows[0])
}

function buildSlaResult(
  row:
    | { p50: number | null; p90: number | null; p99: number | null; sample_size: bigint }
    | undefined,
): { p50: number | null; p90: number | null; p99: number | null; sample_size: number } {
  if (!row) return { p50: null, p90: null, p99: null, sample_size: 0 }
  const sampleSize = Number(row.sample_size ?? BigInt(0))
  if (sampleSize === 0) {
    return { p50: null, p90: null, p99: null, sample_size: 0 }
  }
  const toNum = (v: number | null): number | null => (v === null ? null : Number(v))
  return {
    p50: toNum(row.p50),
    p90: toNum(row.p90),
    p99: toNum(row.p99),
    sample_size: sampleSize,
  }
}

export async function getFunnelCounts(
  range: KpiRange = '30d',
): Promise<{ created: number; paid: number; intake_complete: number; signed: number }> {
  const since = rangeToDate(range)
  const rows = await prisma.$queryRaw<
    Array<{
      created: bigint
      paid: bigint
      intake_complete: bigint
      signed: bigint
    }>
  >(Prisma.sql`
    SELECT
      COUNT(*)::bigint AS created,
      COUNT(*) FILTER (WHERE o.status IN ('processing','draft_ready','completed'))::bigint AS paid,
      COUNT(*) FILTER (WHERE o.intake_completed_at IS NOT NULL)::bigint AS intake_complete,
      COUNT(*) FILTER (
        WHERE EXISTS (
          SELECT 1 FROM documents d
          WHERE d.order_id = o.id AND d.signed_at IS NOT NULL
        )
      )::bigint AS signed
    FROM orders o
    WHERE o.created_at >= ${since}
  `)

  const row = rows[0]
  if (!row) {
    return { created: 0, paid: 0, intake_complete: 0, signed: 0 }
  }
  return {
    created: Number(row.created ?? BigInt(0)),
    paid: Number(row.paid ?? BigInt(0)),
    intake_complete: Number(row.intake_complete ?? BigInt(0)),
    signed: Number(row.signed ?? BigInt(0)),
  }
}
