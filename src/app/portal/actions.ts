'use server'

import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

export async function submitIntake(orderId: string, formData: FormData) {
  const user = await requireAuth()

  // Verify ownership
  const order = await prisma.orders.findFirst({
    where: { id: orderId, user_id: user.id },
  })

  if (!order) {
    return { error: 'Pedido no encontrado o no autorizado' }
  }

  if (order.status !== 'intake_pending') {
    return { error: 'Este pedido ya tiene sus datos completados u orientados' }
  }

  // Parse generic intake data fields into JSON
  const intakeData = {
    titular: formData.get('titular') as string,
    actividad: formData.get('actividad') as string,
    detalles: formData.get('detalles') as string,
    submittedAt: new Date().toISOString(),
  }

  try {
    await prisma.orders.update({
      where: { id: orderId },
      data: {
        intake_data: intakeData,
        status: 'processing',
        intake_completed_at: new Date(),
      },
    })
    
    // Also log this in audit_log
    await prisma.audit_log.create({
      data: {
        event: 'intake_submitted',
        order_id: orderId,
        user_id: user.id,
        metadata: { status_change: 'intake_pending -> processing' }
      }
    })

  } catch (err) {
    console.error(err)
    return { error: 'Ocurrió un error al guardar los datos' }
  }

  revalidatePath(`/portal/pedido/${orderId}`, 'page')
  redirect(`/pedido/${orderId}`)
}
