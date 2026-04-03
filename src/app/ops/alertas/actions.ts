'use server'

import { requireRole, requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'

export async function markAlertReviewed(alertId: string) {
  const user = await requireAuth()
  await requireRole(['admin', 'ops'])

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

  revalidatePath('/ops/alertas')
  revalidatePath(`/ops/alertas/${alertId}`)

  return { success: true }
}
