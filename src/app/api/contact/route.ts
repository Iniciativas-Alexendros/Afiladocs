import { NextResponse } from 'next/server'
import { z } from 'zod'
import { serverEnv } from '@/lib/env'
import { contactRateLimit, getClientIp, applyRateLimit } from '@/lib/rate-limit'

// Vercel Function: Node.js runtime
export const runtime = 'nodejs'
export const maxDuration = 10

const ContactBodySchema = z.object({
  name: z.string().min(1).max(200),
  email: z.string().email(),
  case_type: z.string().max(100).optional(),
  message: z.string().min(10).max(4000),
  rgpd_accepted: z.literal(true),
})

export async function POST(request: Request) {
  const ip = getClientIp(request)
  const { limited, retryAfter } = await applyRateLimit(contactRateLimit, ip)
  if (limited) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes. Inténtalo más tarde.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter ?? 60) },
      }
    )
  }

  try {
    const body = await request.json()
    const parsed = ContactBodySchema.safeParse(body)

    if (!parsed.success) {
      return NextResponse.json(
        { error: 'Faltan campos obligatorios o el formato es incorrecto' },
        { status: 400 }
      )
    }

    const { name, email, case_type, message, rgpd_accepted } = parsed.data

    // Relay a n8n — opcional. Si no está configurado o falla, no bloqueamos la respuesta.
    if (serverEnv.n8nContactWebhook) {
      try {
        await fetch(serverEnv.n8nContactWebhook, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name,
            email,
            case_type,
            message,
            rgpd_accepted,
            submitted_at: new Date().toISOString(),
          }),
        })
      } catch (webhookErr) {
        // El webhook de n8n es opcional — log interno, no propagar al cliente
        console.error(JSON.stringify({
          event: 'n8n.webhook.failed',
          message: webhookErr instanceof Error ? webhookErr.message : 'Unknown error',
          ts: new Date().toISOString(),
        }))
      }
    }

    return NextResponse.json({ success: true })
  } catch {
    return NextResponse.json(
      { error: 'Error interno del servidor' },
      { status: 500 }
    )
  }
}
