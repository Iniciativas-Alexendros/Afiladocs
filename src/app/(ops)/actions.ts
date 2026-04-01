'use server'

import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { createServerClient } from '@/lib/supabase/server'
import { revalidatePath } from 'next/cache'

export async function opsUpdateOrderStatus(orderId: string, formData: FormData) {
  const { user } = await requireRole(['admin', 'ops'])
  const newStatus = formData.get('status') as string

  if (!newStatus) return { error: 'Estado no válido' }

  try {
    const order = await prisma.orders.update({
      where: { id: orderId },
      data: { status: newStatus },
    })

    await prisma.audit_log.create({
      data: {
        event: 'order_status_updated_manually',
        order_id: orderId,
        user_id: user.id,
        metadata: { new_status: newStatus }
      }
    })

    revalidatePath(`/(ops)/pedido/${orderId}`, 'page')
    revalidatePath(`/(ops)/pedidos`, 'page')
    return { success: true }
  } catch (error) {
    console.error(error)
    return { error: 'Error al actualizar el pedido' }
  }
}

export async function opsUploadDocument(orderId: string, type: 'draft' | 'signed', formData: FormData) {
  const { user } = await requireRole(['admin', 'ops'])
  const file = formData.get('file') as File

  if (!file || file.size === 0) {
    return { error: 'No se subió ningún archivo' }
  }

  const order = await prisma.orders.findUnique({ where: { id: orderId } })
  if (!order) return { error: 'Pedido no encontrado' }

  const supabase = createServerClient()
  
  // Storage Path: owner_user_id/order_id/filename
  const fileName = `${type}_${Date.now()}.pdf`
  const filePath = `${order.user_id}/${order.id}/${fileName}`

  // Upload to Supabase Storage 'documents' bucket
  const { data, error } = await supabase.storage
    .from('documents')
    .upload(filePath, file, {
      contentType: 'application/pdf',
      upsert: true
    })

  if (error) {
    console.error('Storage Upload Error:', error)
    return { error: 'Error al subir el archivo a Storage' }
  }

  // Record it in our 'documents' table
  try {
    const documentRecord = await prisma.documents.create({
      data: {
        order_id: orderId,
        type: 'pdf',
        status: type === 'draft' ? 'draft' : 'final',
        draft_pdf_path: type === 'draft' ? data.path : null,
        signed_pdf_path: type === 'signed' ? data.path : null,
      }
    })

    // Update order status based on upload type
    const newStatus = type === 'draft' ? 'draft_ready' : 'completed'
    await prisma.orders.update({
      where: { id: orderId },
      data: { status: newStatus }
    })

    // Audit log
    await prisma.audit_log.create({
      data: {
        event: `document_${type}_uploaded`,
        order_id: orderId,
        user_id: user.id,
        metadata: { document_id: documentRecord.id, path: data.path }
      }
    })

    revalidatePath(`/(ops)/pedido/${orderId}`, 'page')
    return { success: true }
  } catch (err) {
    console.error('Database update error after upload:', err)
    return { error: 'Archivo subido pero error al actualizar base de datos' }
  }
}
