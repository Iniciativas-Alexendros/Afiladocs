/* eslint-disable max-lines */
import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockRequireRole = vi.fn()
const mockFindMany = vi.fn()
const mockCreate = vi.fn()
const mockCreateMany = vi.fn()
const mockUpdateMany = vi.fn()
const mockUpdate = vi.fn()
const mockTransaction = vi.fn()
const mockRevalidatePath = vi.fn()
const mockRevalidateTag = vi.fn()

vi.mock('@/lib/auth', () => ({
  requireRole: (...args: unknown[]) => mockRequireRole(...args),
}))

vi.mock('@/lib/prisma/client', () => ({
  prisma: {
    orders: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
      updateMany: (...args: unknown[]) => mockUpdateMany(...args),
      update: (...args: unknown[]) => mockUpdate(...args),
    },
    audit_log: {
      create: (...args: unknown[]) => mockCreate(...args),
      createMany: (...args: unknown[]) => mockCreateMany(...args),
    },
    $transaction: (...args: unknown[]) => mockTransaction(...args),
  },
}))

vi.mock('next/cache', () => ({
  revalidatePath: (...args: unknown[]) => mockRevalidatePath(...args),
  revalidateTag: (...args: unknown[]) => mockRevalidateTag(...args),
}))

// ──────────────────────────────────────────────
// exportOrdersCsv
// ──────────────────────────────────────────────

describe('exportOrdersCsv', () => {
  beforeEach(() => {
    mockRequireRole.mockReset()
    mockFindMany.mockReset()
    mockCreate.mockReset()
  })

  it('returns CSV with correct headers and registers audit event', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'user-123' }, role: 'ops' })
    mockFindMany.mockResolvedValue([
      {
        id: 'order-1',
        created_at: new Date('2026-04-15T10:00:00Z'),
        user_id: 'user-1',
        user: { full_name: 'Ana García', nif: '12345678A' },
        product: { sku: 'RGPD-001', title: 'Política RGPD' },
        product_sku: 'RGPD-001',
        product_id: null,
        amount_cents: 19900,
        currency: 'EUR',
        status: 'completed',
        eidas_level: 'SES',
        invoice_id: 'inv_123',
      },
    ])
    mockCreate.mockResolvedValue({})

    const { exportOrdersCsv } = await import('@/app/ops/pedidos/actions')
    const result = await exportOrdersCsv({})

    expect(result.rowCount).toBe(1)
    expect(result.csv).toContain(
      'id;created_at;user_id;user_full_name;user_nif;product_sku;amount_cents;currency;status;eidas_level;invoice_id',
    )
    expect(result.csv).toContain('order-1')
    expect(result.csv).toContain('Ana García')
    expect(result.filename).toMatch(/^orders-.*\.csv$/)

    expect(mockCreate).toHaveBeenCalledWith({
      data: expect.objectContaining({
        event: 'orders.exported',
        user_id: 'user-123',
        metadata: expect.objectContaining({
          format: 'csv',
          record_count: 1,
        }),
      }),
    })
  })

  it('handles null user and invoice_id without throwing', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'user-123' }, role: 'admin' })
    mockFindMany.mockResolvedValue([
      {
        id: 'order-2',
        created_at: new Date('2026-04-15T10:00:00Z'),
        user_id: 'user-2',
        user: null,
        product: null,
        product_sku: 'RGPD-001',
        product_id: null,
        amount_cents: 9900,
        currency: 'EUR',
        status: 'processing',
        eidas_level: 'AES',
        invoice_id: null,
      },
    ])
    mockCreate.mockResolvedValue({})

    const { exportOrdersCsv } = await import('@/app/ops/pedidos/actions')
    const result = await exportOrdersCsv({})

    expect(result.rowCount).toBe(1)
    expect(result.csv).toContain('order-2')
    // null values should serialize as empty strings, not the string "null"
    expect(result.csv).not.toContain(';null;')
  })

  it('propagates redirect when requireRole rejects', async () => {
    mockRequireRole.mockRejectedValue(new Error('NEXT_REDIRECT'))

    const { exportOrdersCsv } = await import('@/app/ops/pedidos/actions')
    await expect(exportOrdersCsv({})).rejects.toThrow('NEXT_REDIRECT')
    expect(mockFindMany).not.toHaveBeenCalled()
    expect(mockCreate).not.toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────
// batchMarkProcessing
// ──────────────────────────────────────────────

describe('batchMarkProcessing', () => {
  // proper v4 UUIDs (third group starts with 4)
  const validIds = [
    'a0000000-0000-4000-8000-000000000001',
    'a0000000-0000-4000-8000-000000000002',
  ]

  beforeEach(() => {
    mockRequireRole.mockReset()
    mockTransaction.mockReset()
    mockUpdateMany.mockReset()
    mockCreateMany.mockReset()
    mockRevalidatePath.mockReset()
    mockRevalidateTag.mockReset()
  })

  it('runs transaction, updates status and creates audit entries', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<number>) => {
      return fn({
        orders: { updateMany: mockUpdateMany.mockResolvedValue({ count: 2 }) },
        audit_log: { createMany: mockCreateMany.mockResolvedValue({}) },
      })
    })

    const { batchMarkProcessing } = await import('@/app/ops/pedidos/actions')
    const result = await batchMarkProcessing(validIds)

    expect(result).toEqual({ success: true, affected: 2 })
    expect(mockUpdateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: validIds },
          status: { in: ['intake_pending', 'draft_ready'] },
        }),
        data: { status: 'processing' },
      }),
    )
    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ event: 'order.batch_processing', user_id: 'ops-user' }),
        ]),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/ops/pedidos')
    // Cache tags: genérico para listados + granular por cada order afectado
    expect(mockRevalidateTag).toHaveBeenCalledWith('orders', 'default')
    for (const id of validIds) {
      expect(mockRevalidateTag).toHaveBeenCalledWith(`order-${id}`, 'default')
    }
  })

  it('returns error for empty array (min(1) fails)', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })

    const { batchMarkProcessing } = await import('@/app/ops/pedidos/actions')
    const result = await batchMarkProcessing([])

    expect(result).toEqual({ error: 'Selección inválida' })
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns error for non-UUID ids', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })

    const { batchMarkProcessing } = await import('@/app/ops/pedidos/actions')
    const result = await batchMarkProcessing(['not-a-uuid'])

    expect(result).toEqual({ error: 'Selección inválida' })
  })

  it('propagates auth error', async () => {
    mockRequireRole.mockRejectedValue(new Error('NEXT_REDIRECT'))

    const { batchMarkProcessing } = await import('@/app/ops/pedidos/actions')
    await expect(batchMarkProcessing(validIds)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockTransaction).not.toHaveBeenCalled()
  })
})

// ──────────────────────────────────────────────
// batchSendIntakeReminder
// ──────────────────────────────────────────────

describe('batchSendIntakeReminder', () => {
  const validIds = [
    'b0000000-0000-4000-8000-000000000001',
    'b0000000-0000-4000-8000-000000000002',
  ]

  beforeEach(() => {
    mockRequireRole.mockReset()
    mockFindMany.mockReset()
    mockCreateMany.mockReset()
    mockRevalidatePath.mockReset()
  })

  it('sends reminders only to intake_pending orders and audits', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })
    mockFindMany.mockResolvedValue([
      { id: validIds[0], user_id: 'user-1' },
      { id: validIds[1], user_id: 'user-2' },
    ])
    mockCreateMany.mockResolvedValue({})

    const { batchSendIntakeReminder } = await import('@/app/ops/pedidos/actions')
    const result = await batchSendIntakeReminder(validIds)

    expect(result).toEqual({ success: true, affected: 2 })
    expect(mockFindMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          id: { in: validIds },
          status: 'intake_pending',
        }),
      }),
    )
    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ event: 'order.batch_reminded', user_id: 'ops-user' }),
        ]),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/ops/pedidos')
  })

  it('returns error when no orders are in intake_pending', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })
    mockFindMany.mockResolvedValue([]) // none match filter

    const { batchSendIntakeReminder } = await import('@/app/ops/pedidos/actions')
    const result = await batchSendIntakeReminder(validIds)

    expect(result).toEqual({ error: expect.stringContaining('intake_pending') })
    expect(mockCreateMany).not.toHaveBeenCalled()
  })

  it('returns error for empty ids array', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })

    const { batchSendIntakeReminder } = await import('@/app/ops/pedidos/actions')
    const result = await batchSendIntakeReminder([])

    expect(result).toEqual({ error: 'Selección inválida' })
  })

  it('propagates auth error', async () => {
    mockRequireRole.mockRejectedValue(new Error('NEXT_REDIRECT'))

    const { batchSendIntakeReminder } = await import('@/app/ops/pedidos/actions')
    await expect(batchSendIntakeReminder(validIds)).rejects.toThrow('NEXT_REDIRECT')
  })
})

// ──────────────────────────────────────────────
// batchAddInternalNote
// ──────────────────────────────────────────────

describe('batchAddInternalNote', () => {
  const validIds = [
    'c0000000-0000-4000-8000-000000000001',
    'c0000000-0000-4000-8000-000000000002',
  ]
  const validBody = 'Nota interna de prueba para el pedido'

  beforeEach(() => {
    mockRequireRole.mockReset()
    mockTransaction.mockReset()
    mockFindMany.mockReset()
    mockUpdate.mockReset()
    mockCreateMany.mockReset()
    mockRevalidatePath.mockReset()
  })

  it('appends note to existing internal_notes and creates audit entries', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })
    mockTransaction.mockImplementation(async (fn: (tx: unknown) => Promise<number>) => {
      return fn({
        orders: {
          findMany: mockFindMany.mockResolvedValue([
            { id: validIds[0], internal_notes: [{ id: 'existing', body: 'old note' }] },
            { id: validIds[1], internal_notes: [] },
          ]),
          update: mockUpdate.mockResolvedValue({}),
        },
        audit_log: { createMany: mockCreateMany.mockResolvedValue({}) },
      })
    })

    const { batchAddInternalNote } = await import('@/app/ops/pedidos/actions')
    const result = await batchAddInternalNote(validIds, validBody)

    expect(result).toEqual({ success: true, affected: 2 })
    expect(mockUpdate).toHaveBeenCalledTimes(2)
    // first order appends to its existing notes
    expect(mockUpdate).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { id: validIds[0] },
        data: {
          internal_notes: expect.arrayContaining([
            expect.objectContaining({ body: validBody, author_id: 'ops-user' }),
          ]),
        },
      }),
    )
    expect(mockCreateMany).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.arrayContaining([
          expect.objectContaining({ event: 'order.note_added', user_id: 'ops-user' }),
        ]),
      }),
    )
    expect(mockRevalidatePath).toHaveBeenCalledWith('/ops/pedidos')
  })

  it('returns error for empty body', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })

    const { batchAddInternalNote } = await import('@/app/ops/pedidos/actions')
    const result = await batchAddInternalNote(validIds, '')

    expect(result).toEqual({ error: 'La nota no puede estar vacía' })
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns error for body exceeding 2000 chars', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })

    const { batchAddInternalNote } = await import('@/app/ops/pedidos/actions')
    const result = await batchAddInternalNote(validIds, 'a'.repeat(2001))

    expect(result).toEqual({ error: 'La nota no puede estar vacía' })
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('returns error for invalid ids', async () => {
    mockRequireRole.mockResolvedValue({ user: { id: 'ops-user' }, role: 'ops' })

    const { batchAddInternalNote } = await import('@/app/ops/pedidos/actions')
    const result = await batchAddInternalNote(['not-a-uuid'], validBody)

    expect(result).toEqual({ error: 'Selección inválida' })
    expect(mockTransaction).not.toHaveBeenCalled()
  })

  it('propagates auth error', async () => {
    mockRequireRole.mockRejectedValue(new Error('NEXT_REDIRECT'))

    const { batchAddInternalNote } = await import('@/app/ops/pedidos/actions')
    await expect(batchAddInternalNote(validIds, validBody)).rejects.toThrow('NEXT_REDIRECT')
    expect(mockTransaction).not.toHaveBeenCalled()
  })
})
