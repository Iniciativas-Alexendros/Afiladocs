import { Resend } from 'resend'
import React from 'react'
import { serverEnv } from '@/lib/env'

// Lazy instantiation — Resend throws if key is empty at module load time.
// Build time no tiene RESEND_API_KEY; el cliente solo se crea en request time.
function getResendClient() {
  return new Resend(serverEnv.resendApiKey)
}

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const resend = getResendClient()

  const { data, error } = await resend.emails.send({
    from: serverEnv.resendFromEmail,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }

  return data
}
