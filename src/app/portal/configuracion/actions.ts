'use server'

import { requireAuth } from '@/lib/auth'
import { createClient } from '@/lib/supabase/server'
import { prisma } from '@/lib/prisma/client'
import { sendEmail } from '@/lib/email/send'
import { revalidatePath } from 'next/cache'
import React from 'react'

export async function updateProfile(formData: FormData): Promise<{ success?: true; error?: string }> {
  const user = await requireAuth()

  const fullName = formData.get('full_name')
  const companyName = formData.get('company_name')
  const phone = formData.get('phone')

  const supabase = await createClient()
  const { error } = await supabase
    .from('profiles')
    .update({
      full_name: fullName?.toString().trim() || null,
      company_name: companyName?.toString().trim() || null,
      phone: phone?.toString().trim() || null,
    })
    .eq('id', user.id)

  if (error) {
    console.error(JSON.stringify({ event: 'profile.update.error', message: error.message, ts: new Date().toISOString() }))
    return { error: 'Error al actualizar el perfil' }
  }

  await prisma.audit_log.create({
    data: {
      event: 'profile_updated',
      user_id: user.id,
      metadata: { fields: ['full_name', 'company_name', 'phone'] },
    },
  })

  revalidatePath('/portal/configuracion')
  revalidatePath('/portal')
  return { success: true }
}

export async function requestAccountDeletion(): Promise<{ success?: true; error?: string }> {
  const user = await requireAuth()

  try {
    await prisma.audit_log.create({
      data: {
        event: 'gdpr_deletion_requested',
        user_id: user.id,
        metadata: { requested_at: new Date().toISOString() },
      },
    })

    // Notificar al equipo legal
    await sendEmail({
      to: 'legal@afiladocs.es',
      subject: `Solicitud de eliminación de cuenta — ${user.email}`,
      react: React.createElement('div', null,
        React.createElement('p', null, `El usuario ${user.email} (ID: ${user.id}) ha solicitado la eliminación de su cuenta.`),
        React.createElement('p', null, `Fecha: ${new Date().toLocaleString('es-ES')}`),
        React.createElement('p', null, 'Por favor, procesa esta solicitud en un plazo máximo de 30 días según el Art. 17 RGPD.')
      ),
    })

    return { success: true }
  } catch (error) {
    console.error(JSON.stringify({ event: 'gdpr.deletion_request.error', message: error instanceof Error ? error.message : 'Unknown', ts: new Date().toISOString() }))
    return { error: 'Error al procesar la solicitud. Inténtalo de nuevo o contacta con soporte.' }
  }
}
