'use server'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { buildAuditLogWhere, type AuditLogFilters } from './query'

export type { AuditLogFilters }

const CSV_MAX_ROWS = 10_000

function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'string' ? value : JSON.stringify(value)
  if (/[",\n\r]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export interface ExportAuditLogResult {
  filename: string
  csv: string
  rowCount: number
}

export async function exportAuditLogCsv(
  filters: AuditLogFilters,
): Promise<ExportAuditLogResult> {
  const { user } = await requireRole(['admin', 'ops'])

  const rows = await prisma.audit_log.findMany({
    where: buildAuditLogWhere(filters),
    orderBy: { created_at: 'desc' },
    take: CSV_MAX_ROWS,
  })

  const header = ['id', 'created_at', 'event', 'user_id', 'order_id', 'ip_hash', 'metadata']
  const lines = [header.join(',')]
  for (const row of rows) {
    lines.push([
      escapeCsv(row.id),
      escapeCsv(row.created_at.toISOString()),
      escapeCsv(row.event),
      escapeCsv(row.user_id ?? ''),
      escapeCsv(row.order_id ?? ''),
      escapeCsv(row.ip_hash ?? ''),
      escapeCsv(row.metadata),
    ].join(','))
  }
  const csv = lines.join('\n')

  await prisma.audit_log.create({
    data: {
      event: 'report.exported',
      user_id: user.id,
      metadata: {
        format: 'csv',
        record_count: rows.length,
        filters,
      },
    },
  })

  const stamp = new Date().toISOString().replace(/[:.]/g, '-')
  return {
    filename: `audit-log-${stamp}.csv`,
    csv,
    rowCount: rows.length,
  }
}
