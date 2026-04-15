import { z } from 'zod'

export interface OrderFilters {
  [key: string]: string | undefined
  status?: string
  product_sku?: string
  eidas_level?: string
  from?: string
  to?: string
  q?: string
  sort?: 'created_at' | 'amount_cents' | 'status'
  dir?: 'asc' | 'desc'
}

const SORT_ALLOWLIST = ['created_at', 'amount_cents', 'status'] as const
type SortKey = (typeof SORT_ALLOWLIST)[number]

export const OrderFiltersSchema = z.object({
  status: z.string().optional(),
  product_sku: z.string().optional(),
  eidas_level: z.string().optional(),
  from: z.string().optional(),
  to: z.string().optional(),
  q: z.string().optional(),
  sort: z.enum(SORT_ALLOWLIST).optional(),
  dir: z.enum(['asc', 'desc']).optional(),
})

export function buildOrderWhere(filters: OrderFilters): Record<string, unknown> {
  const where: Record<string, unknown> = {}
  if (filters.status) where.status = filters.status
  if (filters.product_sku) where.product_sku = filters.product_sku
  if (filters.eidas_level) where.eidas_level = filters.eidas_level

  const created_at: { gte?: Date; lte?: Date } = {}
  if (filters.from) created_at.gte = new Date(filters.from)
  if (filters.to) created_at.lte = new Date(filters.to)
  if (created_at.gte || created_at.lte) where.created_at = created_at

  const q = filters.q?.trim()
  if (q) {
    where.OR = [
      { user: { full_name: { contains: q, mode: 'insensitive' } } },
      { user: { nif: { contains: q, mode: 'insensitive' } } },
      { id: { startsWith: q } },
    ]
  }

  return where
}

export function buildOrderOrderBy(
  filters: OrderFilters,
): Record<string, 'asc' | 'desc'> {
  const dir: 'asc' | 'desc' = filters.dir === 'asc' ? 'asc' : 'desc'
  const sort: SortKey =
    filters.sort && (SORT_ALLOWLIST as readonly string[]).includes(filters.sort)
      ? (filters.sort as SortKey)
      : 'created_at'
  return { [sort]: dir }
}
