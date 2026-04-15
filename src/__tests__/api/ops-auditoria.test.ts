import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRequireRole = vi.fn()
const mockFindMany = vi.fn()
const mockCreate = vi.fn()

vi.mock('@/lib/auth', () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args),
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    audit_log: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      create: (...args: unknown[]) => mockCreate(...args),
    },
  },
}))

describe('exportAuditLogCsv', () => {
  beforeEach(() => {
    mockRequireRole.mockReset()
    mockFindMany.mockReset()
    mockCreate.mockReset()
  })

  it('serializes rows to CSV and logs report.exported audit event', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'user-123' }, role: 'ops' })
    mockFindMany.mockResolvedValue([
      {
        id: 'id-1',
        created_at: new Date('2026-04-14T10:00:00Z'),
        event: 'order.created',
        user_id: 'user-1',
        order_id: 'order-1',
        ip_hash: 'hash-1',
        metadata: { foo: 'bar' },
      },
    ])
    mockCreate.mockResolvedValue({})

    const { exportAuditLogCsv } = await import('@/app/ops/auditoria/actions')
    const result = await exportAuditLogCsv({ event: 'order.created' })

    expect(result.rowCount).toBe(1)
    expect(result.csv).toContain('id;created_at;event;user_id;order_id;ip_hash;metadata')
    expect(result.csv).toContain('order.created')
    expect(result.filename).toMatch(/^audit-log-.*\.csv$/)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        event: 'report.exported',
        user_id: 'user-123',
        metadata: expect.objectContaining({
          format: 'csv',
          record_count: 1,
          filters: { event: 'order.created' },
        }),
      }),
    })
  })

  it('escapes commas and quotes in CSV values', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'user-123' }, role: 'admin' })
    mockFindMany.mockResolvedValue([
      {
        id: 'id-1',
        created_at: new Date('2026-04-14T10:00:00Z'),
        event: 'msg, with "quotes"',
        user_id: null,
        order_id: null,
        ip_hash: null,
        metadata: null,
      },
    ])
    mockCreate.mockResolvedValue({})

    const { exportAuditLogCsv } = await import('@/app/ops/auditoria/actions')
    const result = await exportAuditLogCsv({})
    expect(result.csv).toContain('"msg, with ""quotes"""')
  })

  it('propagates redirect when requireRole rejects', async () => {
    mockRequireRole.mockRejectedValue(new Error('NEXT_REDIRECT'))
    const { exportAuditLogCsv } = await import('@/app/ops/auditoria/actions')
    await expect(exportAuditLogCsv({})).rejects.toThrow('NEXT_REDIRECT')
    expect(mockFindMany).not.toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})
