'use server'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import {
  CSV_MAX_ROWS,
  csvFilename,
  toCsvString,
} from '@/lib/reports/csv-stream'
import { buildAuditLogWhere, type AuditLogFilters } from './query'

export type { AuditLogFilters }

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

  const header = ['id', 'created_at', 'event', 'user_id', 'order_id', 'ip_hash', 'metadata'] as const
  const csv = toCsvString(
    header,
    rows.map((row) => [
      row.id,
      row.created_at.toISOString(),
      row.event,
      row.user_id ?? '',
      row.order_id ?? '',
      row.ip_hash ?? '',
      row.metadata,
    ]),
  )

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

  return {
    filename: csvFilename('audit-log'),
    csv,
    rowCount: rows.length,
  }
}
