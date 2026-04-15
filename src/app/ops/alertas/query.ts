import { z } from 'zod'

export interface AlertFilters {
  [key: string]: string | undefined
  status?: string
  urgency?: string
  source?: string
  from?: string
  to?: string
}

export const AlertStatusSchema = z.enum([
  'pending_review',
  'reviewed',
  'archived',
  'dismissed',
  'all',
])

export const AlertFiltersSchema = z.object({
  status: z.string().optional(),
  urgency: z.string().optional(),
  source: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
})

export function buildAlertsWhere(filters: AlertFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {}
  if (filters.status && filters.status !== 'all') {
    where.status = filters.status
  }
  if (filters.urgency) where.urgency = filters.urgency
  if (filters.source) where.source = filters.source
  const published_at: { gte?: Date; lte?: Date } = {}
  if (filters.from) published_at.gte = new Date(filters.from)
  if (filters.to) published_at.lte = new Date(filters.to)
  if (published_at.gte || published_at.lte) where.published_at = published_at
  return where
}
