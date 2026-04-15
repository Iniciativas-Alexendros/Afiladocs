import type { Route } from 'next'

/**
 * Shared cursor pagination helpers for ops server components.
 *
 * Pattern (already battle-tested in /ops/auditoria):
 *   - fetch `take: PAGE_SIZE + 1`
 *   - if results.length > PAGE_SIZE → hasNext = true
 *   - nextCursor = id of last visible row
 *   - subsequent call: `cursor: { id }, skip: 1` + same orderBy
 */

export const DEFAULT_PAGE_SIZE = 50

export interface PagedResult<T> {
  rows: T[]
  hasNext: boolean
  nextCursor: string | null
}

export function paginateCursor<T extends { id: string }>(
  rows: T[],
  pageSize: number = DEFAULT_PAGE_SIZE,
): PagedResult<T> {
  const hasNext = rows.length > pageSize
  const visible = hasNext ? rows.slice(0, pageSize) : rows
  return {
    rows: visible,
    hasNext,
    nextCursor: hasNext && visible.length > 0 ? visible[visible.length - 1].id : null,
  }
}

export function buildCursorArgs(
  cursor: string | undefined,
): { cursor?: { id: string }; skip?: number } {
  return cursor ? { cursor: { id: cursor }, skip: 1 } : {}
}

/**
 * Build a typed `/path?k=v&cursor=...` href preserving existing params.
 * Empty / undefined values are dropped; `cursor` override wins.
 */
export function buildPagedHref(
  basePath: string,
  params: Record<string, string | number | undefined | null>,
  overrides: Record<string, string | number | null> = {},
): Route<string> {
  const search = new URLSearchParams()
  const merged = { ...params, ...overrides }
  for (const [key, value] of Object.entries(merged)) {
    if (value === undefined || value === null || value === '') continue
    search.set(key, String(value))
  }
  const qs = search.toString()
  return (qs ? `${basePath}?${qs}` : basePath) as Route<string>
}
