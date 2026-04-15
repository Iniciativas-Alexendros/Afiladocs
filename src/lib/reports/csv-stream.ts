/**
 * Shared CSV serialization helpers for ops exports.
 *
 * Output is Excel-ES friendly: UTF-8 BOM + semicolon separator + CRLF lines.
 * Use `toCsvString` for small batches (≤ CSV_MAX_ROWS). For larger streams,
 * wire `writeCsvRow` into a ReadableStream.
 */

export const CSV_MAX_ROWS = 10_000
export const CSV_BOM = '\ufeff'
export const CSV_SEPARATOR = ';'
export const CSV_LINE_BREAK = '\r\n'

function stringifyCell(value: unknown): string {
  if (typeof value === 'string') return value
  if (value instanceof Date) return value.toISOString()
  return JSON.stringify(value)
}

export function escapeCsv(value: unknown): string {
  if (value === null || value === undefined) return ''
  const str = stringifyCell(value)
  if (/["\n\r;]/.test(str)) {
    return `"${str.replace(/"/g, '""')}"`
  }
  return str
}

export function writeCsvRow(cells: readonly unknown[]): string {
  return cells.map(escapeCsv).join(CSV_SEPARATOR)
}

export interface CsvBuildOptions {
  /** Prepend UTF-8 BOM for Excel (default: true). */
  includeBom?: boolean
}

export function toCsvString(
  header: readonly string[],
  rows: ReadonlyArray<readonly unknown[]>,
  opts: CsvBuildOptions = {},
): string {
  const includeBom = opts.includeBom ?? true
  const lines: string[] = []
  lines.push(writeCsvRow(header))
  for (const row of rows) lines.push(writeCsvRow(row))
  return (includeBom ? CSV_BOM : '') + lines.join(CSV_LINE_BREAK)
}

export function csvFilename(prefix: string, now: Date = new Date()): string {
  const stamp = now.toISOString().replace(/[:.]/g, '-')
  return `${prefix}-${stamp}.csv`
}
