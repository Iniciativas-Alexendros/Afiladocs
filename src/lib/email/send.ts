import { Resend } from 'resend'

const resend = new Resend(process.env.RESEND_API_KEY)

interface SendEmailOptions {
  to: string | string[]
  subject: string
  react: React.ReactElement
}

export async function sendEmail({ to, subject, react }: SendEmailOptions) {
  const fromEmail = process.env.RESEND_FROM_EMAIL ?? 'noreply@afiladocs.es'

  const { data, error } = await resend.emails.send({
    from: fromEmail,
    to: Array.isArray(to) ? to : [to],
    subject,
    react,
  })

  if (error) {
    throw new Error(`Resend error: ${error.message}`)
  }

  return data
}
