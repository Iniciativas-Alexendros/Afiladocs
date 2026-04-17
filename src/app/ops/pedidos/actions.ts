'use server'

import { revalidatePath, revalidateTag } from 'next/cache'
import { z } from 'zod'
import { Prisma } from '@prisma/client'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import {
  CSV_MAX_ROWS,
  csvFilename,
  toCsvString,
} from '@/lib/reports/csv-stream'
import {
  buildOrderOrderBy,
  buildOrderWhere,
  OrderFiltersSchema,
  type OrderFilters,
} from './query'

export type { OrderFilters }

const BatchIdsSchema = z.array(z.string().uuid()).min(1).max(100)
const NoteBodySchema = z.string().trim().min(1).max(2000)

export interface BatchActionResult {
  success?: true
  error?: string
  affected?: number
}

function logEvent(event: string, data: Record<string, unknown>): void {
  console.log(
    JSON.stringify({ event, ts: new Date().toISOString(), ...data }),
  )
}

export interface ExportOrdersResult {
  filename: string
  csv: string
  rowCount: number
}

export async function exportOrdersCsv(
  filters: OrderFilters,
): Promise<ExportOrdersResult> {
  const { user } = await requireRole(['admin', 'ops'])

  const parsed = OrderFiltersSchema.parse(filters)

  const rows = await prisma.orders.findMany({
    where: buildOrderWhere(parsed),
    include: {
      user: { select: { full_name: true, nif: true } },
      product: { select: { sku: true, title: true } },
    },
    orderBy: buildOrderOrderBy(parsed),
    take: CSV_MAX_ROWS,
  })

  const header = [
    'id',
    'created_at',
    'user_id',
    'user_full_name',
    'user_nif',
    'product_sku',
    'amount_cents',
    'currency',
    'status',
    'eidas_level',
    'invoice_id',
  ] as const

  const csv = toCsvString(
    header,
    rows.map((row) => [
      row.id,
      row.created_at.toISOString(),
      row.user_id,
      row.user?.full_name ?? '',
      row.user?.nif ?? '',
      row.product?.sku ?? row.product_sku ?? row.product_id,
      row.amount_cents,
      row.currency,
      row.status,
      row.eidas_level,
      row.invoice_id ?? '',
    ]),
  )

  await prisma.audit_log.create({
    data: {
      event: 'orders.exported',
      user_id: user.id,
      metadata: {
        format: 'csv',
        record_count: rows.length,
        filters: parsed,
      },
    },
  })

  logEvent('orders.exported', {
    user_id: user.id,
    record_count: rows.length,
  })

  return {
    filename: csvFilename('orders'),
    csv,
    rowCount: rows.length,
  }
}

export async function batchMarkProcessing(
  orderIds: string[],
): Promise<BatchActionResult> {
  const { user } = await requireRole(['admin', 'ops'])
  const parsed = BatchIdsSchema.safeParse(orderIds)
  if (!parsed.success) return { error: 'Selección inválida' }

  const ids = parsed.data
  const result = await prisma.$transaction(async (tx) => {
    const updated = await tx.orders.updateMany({
      where: {
        id: { in: ids },
        status: { in: ['intake_pending', 'draft_ready'] },
      },
      data: { status: 'processing' },
    })
    await tx.audit_log.createMany({
      data: ids.map((order_id) => ({
        event: 'order.batch_processing',
        user_id: user.id,
        order_id,
        metadata: { batch_size: ids.length },
      })),
    })
    return updated.count
  })

  logEvent('order.batch_processing', {
    user_id: user.id,
    batch_size: ids.length,
    affected: result,
  })
  revalidatePath('/ops/pedidos')
  revalidateTag('orders')
  for (const id of ids) revalidateTag(`order-${id}`)
  return { success: true, affected: result }
}

export async function batchSendIntakeReminder(
  orderIds: string[],
): Promise<BatchActionResult> {
  const { user } = await requireRole(['admin', 'ops'])
  const parsed = BatchIdsSchema.safeParse(orderIds)
  if (!parsed.success) return { error: 'Selección inválida' }

  const ids = parsed.data
  const orders = await prisma.orders.findMany({
    where: { id: { in: ids }, status: 'intake_pending' },
    select: { id: true, user_id: true },
  })

  if (orders.length === 0) {
    return { error: 'Ninguno de los pedidos seleccionados está en intake_pending' }
  }

  await prisma.audit_log.createMany({
    data: orders.map((o) => ({
      event: 'order.batch_reminded',
      user_id: user.id,
      order_id: o.id,
      metadata: { channel: 'email', batch_size: orders.length },
    })),
  })

  logEvent('order.batch_reminded', {
    user_id: user.id,
    affected: orders.length,
  })
  revalidatePath('/ops/pedidos')
  return { success: true, affected: orders.length }
}

export async function batchAddInternalNote(
  orderIds: string[],
  body: string,
): Promise<BatchActionResult> {
  const { user } = await requireRole(['admin', 'ops'])
  const idsParsed = BatchIdsSchema.safeParse(orderIds)
  if (!idsParsed.success) return { error: 'Selección inválida' }
  const bodyParsed = NoteBodySchema.safeParse(body)
  if (!bodyParsed.success) return { error: 'La nota no puede estar vacía' }

  const ids = idsParsed.data
  const noteBody = bodyParsed.data
  const now = new Date()

  const affected = await prisma.$transaction(async (tx) => {
    const targets = await tx.orders.findMany({
      where: { id: { in: ids } },
      select: { id: true, internal_notes: true },
    })

    for (const order of targets) {
      const existing = Array.isArray(order.internal_notes)
        ? (order.internal_notes as unknown as Prisma.JsonArray)
        : ([] as Prisma.JsonArray)
      const note: Prisma.JsonObject = {
        id: crypto.randomUUID(),
        author_id: user.id,
        body: noteBody,
        created_at: now.toISOString(),
      }
      await tx.orders.update({
        where: { id: order.id },
        data: { internal_notes: [...existing, note] },
      })
    }

    await tx.audit_log.createMany({
      data: targets.map((o) => ({
        event: 'order.note_added',
        user_id: user.id,
        order_id: o.id,
        metadata: { body_length: noteBody.length, batch_size: targets.length },
      })),
    })

    return targets.length
  })

  logEvent('order.note_added', {
    user_id: user.id,
    affected,
    body_length: noteBody.length,
  })
  revalidatePath('/ops/pedidos')
  revalidateTag('orders')
  for (const id of ids) revalidateTag(`order-${id}`)
  return { success: true, affected }
}
