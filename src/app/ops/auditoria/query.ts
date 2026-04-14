export interface AuditLogFilters {
  [key: string]: string | undefined
  event?: string
  user_id?: string
  from?: string
  to?: string
}

export function buildAuditLogWhere(filters: AuditLogFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {}
  if (filters.event) where.event = filters.event
  if (filters.user_id) where.user_id = filters.user_id
  const created_at: { gte?: Date; lte?: Date } = {}
  if (filters.from) created_at.gte = new Date(filters.from)
  if (filters.to) created_at.lte = new Date(filters.to)
  if (created_at.gte || created_at.lte) where.created_at = created_at
  return where
}
