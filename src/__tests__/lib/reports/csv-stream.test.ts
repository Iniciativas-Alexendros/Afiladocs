import { describe, expect, it } from 'vitest'
import {
  CSV_BOM,
  CSV_LINE_BREAK,
  CSV_SEPARATOR,
  csvFilename,
  escapeCsv,
  toCsvString,
  writeCsvRow,
} from '@/lib/reports/csv-stream'

describe('escapeCsv', () => {
  it('returns empty string for null/undefined', () => {
    expect(escapeCsv(null)).toBe('')
    expect(escapeCsv(undefined)).toBe('')
  })

  it('serializes Date as ISO string without quoting if safe', () => {
    const d = new Date('2026-04-15T10:00:00Z')
    expect(escapeCsv(d)).toBe('2026-04-15T10:00:00.000Z')
  })

  it('quotes values containing separator, quote, or newline', () => {
    expect(escapeCsv('hola; mundo')).toBe('"hola; mundo"')
    expect(escapeCsv('he said "yes"')).toBe('"he said ""yes"""')
    expect(escapeCsv('line1\nline2')).toBe('"line1\nline2"')
  })

  it('stringifies non-string values', () => {
    expect(escapeCsv(42)).toBe('42')
    expect(escapeCsv({ a: 1 })).toBe('"{""a"":1}"')
  })
})

describe('writeCsvRow', () => {
  it('joins cells with semicolon', () => {
    expect(writeCsvRow(['a', 'b', 'c'])).toBe(`a${CSV_SEPARATOR}b${CSV_SEPARATOR}c`)
  })
})

describe('toCsvString', () => {
  it('includes BOM + semicolon separator + CRLF by default', () => {
    const csv = toCsvString(['id', 'name'], [['1', 'Ana'], ['2', 'Bob']])
    expect(csv.startsWith(CSV_BOM)).toBe(true)
    expect(csv.includes(CSV_SEPARATOR)).toBe(true)
    expect(csv.includes(CSV_LINE_BREAK)).toBe(true)
    const withoutBom = csv.slice(1)
    expect(withoutBom).toBe(`id;name${CSV_LINE_BREAK}1;Ana${CSV_LINE_BREAK}2;Bob`)
  })

  it('omits BOM when includeBom: false', () => {
    const csv = toCsvString(['a'], [['1']], { includeBom: false })
    expect(csv.startsWith(CSV_BOM)).toBe(false)
  })

  it('handles empty rows', () => {
    const csv = toCsvString(['a', 'b'], [])
    expect(csv).toBe(`${CSV_BOM}a;b`)
  })
})

describe('csvFilename', () => {
  it('builds ISO-stamped filename', () => {
    const stamp = csvFilename('orders', new Date('2026-04-15T10:00:00Z'))
    expect(stamp).toMatch(/^orders-2026-04-15T10-00-00-000Z\.csv$/)
  })
})
