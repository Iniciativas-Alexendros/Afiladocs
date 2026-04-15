import { describe, expect, it } from 'vitest'
import {
  buildCursorArgs,
  buildPagedHref,
  DEFAULT_PAGE_SIZE,
  paginateCursor,
} from '@/app/ops/_lib/cursor'

describe('paginateCursor', () => {
  it('returns all rows with hasNext=false when under pageSize', () => {
    const rows = [{ id: '1' }, { id: '2' }]
    const res = paginateCursor(rows, 5)
    expect(res.rows).toEqual(rows)
    expect(res.hasNext).toBe(false)
    expect(res.nextCursor).toBeNull()
  })

  it('trims + sets nextCursor when over pageSize', () => {
    const rows = [{ id: 'a' }, { id: 'b' }, { id: 'c' }]
    const res = paginateCursor(rows, 2)
    expect(res.rows.length).toBe(2)
    expect(res.hasNext).toBe(true)
    expect(res.nextCursor).toBe('b')
  })

  it('defaults to DEFAULT_PAGE_SIZE', () => {
    const rows = Array.from({ length: DEFAULT_PAGE_SIZE + 1 }, (_, i) => ({ id: String(i) }))
    const res = paginateCursor(rows)
    expect(res.hasNext).toBe(true)
    expect(res.rows.length).toBe(DEFAULT_PAGE_SIZE)
  })
})

describe('buildCursorArgs', () => {
  it('returns empty object when cursor is undefined', () => {
    expect(buildCursorArgs(undefined)).toEqual({})
  })

  it('returns cursor + skip when cursor is present', () => {
    expect(buildCursorArgs('abc')).toEqual({ cursor: { id: 'abc' }, skip: 1 })
  })
})

describe('buildPagedHref', () => {
  it('drops empty params', () => {
    const href = buildPagedHref('/ops/x', { a: '', b: undefined, c: null, d: 'y' })
    expect(href).toBe('/ops/x?d=y')
  })

  it('overrides take precedence', () => {
    const href = buildPagedHref('/ops/x', { cursor: 'a', q: 'hi' }, { cursor: 'b' })
    expect(href).toContain('cursor=b')
    expect(href).toContain('q=hi')
  })

  it('returns basePath without "?" when no params', () => {
    expect(buildPagedHref('/ops/x', {})).toBe('/ops/x')
  })
})
