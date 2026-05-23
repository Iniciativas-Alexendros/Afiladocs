'use server'

import { requireRole, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath, revalidateTag } from 'next/cache'

type ActionResult = { success: true } | { error: string }

function logAction(action: string, alert_id: string, user_id: string) {
  console.log(
    JSON.stringify({
      event: 'alert.action',
      action,
      alert_id,
      user_id,
      ts: new Date().toISOString(),
    }),
  )
}

export async function markAlertReviewed(alertId: string): Promise<ActionResult> {
  const user = await requireAuth()
  await requireRole(['admin', 'ops'])

  try {
    const alert = await prisma.monitor_alerts.findFirst({ where: { id: alertId } })
    if (!alert) return { error: 'Alerta no encontrada' }
    if (alert.status === 'reviewed') return { error: 'La alerta ya está revisada' }

    await prisma.monitor_alerts.update({
      where: { id: alertId },
      data: {
        status: 'reviewed',
        reviewed_by: user.id,
        reviewed_at: new Date(),
      },
    })

    await prisma.audit_log.create({
      data: {
        event: 'alert.reviewed',
        user_id: user.id,
        metadata: { alert_id: alertId, source: alert.source },
      },
    })

    logAction('reviewed', alertId, user.id)

    revalidatePath('/ops/alertas')
    revalidatePath(`/ops/alertas/${alertId}`)
    revalidateTag('alerts', 'default')

    return { success: true }
  } catch {
    return { error: 'No se pudo actualizar la alerta' }
  }
}

export async function archiveAlert(alertId: string): Promise<ActionResult> {
  const user = await requireAuth()
  await requireRole(['admin', 'ops'])

  try {
    const alert = await prisma.monitor_alerts.findFirst({ where: { id: alertId } })
    if (!alert) return { error: 'Alerta no encontrada' }
    if (alert.status === 'archived') return { error: 'Ya archivada' }

    await prisma.monitor_alerts.update({
      where: { id: alertId },
      data: {
        status: 'archived',
        archived_at: new Date(),
      },
    })

    await prisma.audit_log.create({
      data: {
        event: 'alert.archived',
        user_id: user.id,
        metadata: { alert_id: alertId, source: alert.source },
      },
    })

    logAction('archived', alertId, user.id)

    revalidatePath('/ops/alertas')
    revalidatePath(`/ops/alertas/${alertId}`)
    revalidateTag('alerts', 'default')

    return { success: true }
  } catch {
    return { error: 'No se pudo archivar la alerta' }
  }
}

export async function dismissAlert(alertId: string): Promise<ActionResult> {
  const user = await requireAuth()
  await requireRole(['admin', 'ops'])

  try {
    const alert = await prisma.monitor_alerts.findFirst({ where: { id: alertId } })
    if (!alert) return { error: 'Alerta no encontrada' }
    if (alert.status === 'dismissed') return { error: 'Ya descartada' }

    await prisma.monitor_alerts.update({
      where: { id: alertId },
      data: {
        status: 'dismissed',
        dismissed_at: new Date(),
      },
    })

    await prisma.audit_log.create({
      data: {
        event: 'alert.dismissed',
        user_id: user.id,
        metadata: { alert_id: alertId, source: alert.source },
      },
    })

    logAction('dismissed', alertId, user.id)

    revalidatePath('/ops/alertas')
    revalidatePath(`/ops/alertas/${alertId}`)
    revalidateTag('alerts', 'default')

    return { success: true }
  } catch {
    return { error: 'No se pudo descartar la alerta' }
  }
}
