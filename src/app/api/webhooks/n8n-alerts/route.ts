import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma/client'
import { serverEnv } from '@/lib/env'
import { sendEmail } from '@/lib/email/send'
import { revalidateTag } from 'next/cache'
import { z } from 'zod'
import React from 'react'

export const runtime = 'nodejs'
export const dynamic = 'force-dynamic'

const AlertPayloadSchema = z.object({
  source: z.string().min(1).max(200),
  title: z.string().min(1).max(500),
  summary: z.string().max(2000).optional(),
  urgency: z.enum(['alta', 'media', 'baja']).optional().default('media'),
  raw_url: z.string().url().optional(),
  published_at: z.string().optional(),
  areas: z.array(z.string().max(100)).max(10).optional().default([]),
})

// Support batched alerts in a single request
const RequestSchema = z.union([
  AlertPayloadSchema,
  z.array(AlertPayloadSchema).min(1).max(50),
])

function verifyWebhookToken(request: Request): boolean {
  const authHeader = request.headers.get('authorization')
  if (!authHeader) return false
  const token = authHeader.replace('Bearer ', '')
  return token === serverEnv.n8nAlertsWebhookSecret
}

export async function POST(req: Request) {
  // Auth: Bearer token shared with n8n
  if (!serverEnv.n8nAlertsWebhookSecret) {
    console.error(JSON.stringify({
      event: 'n8n_alerts.webhook.misconfigured',
      message: 'Missing N8N_ALERTS_WEBHOOK_SECRET',
      ts: new Date().toISOString(),
    }))
    return new NextResponse('Webhook not configured', { status: 503 })
  }

  if (!verifyWebhookToken(req)) {
    return new NextResponse('Unauthorized', { status: 401 })
  }

  let body: unknown
  try {
    body = await req.json()
  } catch {
    return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
  }

  const parsed = RequestSchema.safeParse(body)
  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Validation failed', details: parsed.error.flatten() },
      { status: 422 },
    )
  }

  const alerts = Array.isArray(parsed.data) ? parsed.data : [parsed.data]

  const created = await prisma.monitor_alerts.createMany({
    data: alerts.map((alert) => ({
      source: alert.source,
      title: alert.title,
      summary: alert.summary ?? null,
      urgency: alert.urgency,
      raw_url: alert.raw_url ?? null,
      published_at: alert.published_at ? new Date(alert.published_at) : null,
      areas: alert.areas,
      status: 'pending_review',
    })),
  })

  revalidateTag('alerts')

  console.log(JSON.stringify({
    event: 'n8n_alerts.ingested',
    count: created.count,
    sources: [...new Set(alerts.map((a) => a.source))],
    ts: new Date().toISOString(),
  }))

  // Notify ops team for high-urgency alerts
  const highUrgency = alerts.filter((a) => a.urgency === 'alta')
  if (highUrgency.length > 0) {
    try {
      await sendEmail({
        to: serverEnv.resendFromEmail.replace('noreply@', 'ops@'),
        subject: `[URGENTE] ${highUrgency.length} alerta(s) normativa(s) de urgencia alta`,
        react: React.createElement('div', null,
          React.createElement('h2', null, 'Nuevas alertas de urgencia alta'),
          ...highUrgency.map((a, i) =>
            React.createElement('div', { key: i, style: { marginBottom: '16px', padding: '12px', background: '#fef2f2', borderRadius: '8px' } },
              React.createElement('p', { style: { fontWeight: 'bold', margin: '0 0 4px' } }, a.title),
              a.summary ? React.createElement('p', { style: { margin: '0 0 4px', fontSize: '14px' } }, a.summary) : null,
              React.createElement('p', { style: { fontSize: '12px', color: '#6b7280', margin: 0 } },
                a.source + (a.raw_url ? ' — ' + a.raw_url : '')
              ),
            )
          ),
          React.createElement('p', { style: { marginTop: '16px' } },
            React.createElement('a', { href: `${process.env.NEXT_PUBLIC_SITE_URL ?? 'https://afiladocs.com'}/ops/alertas?status=pending_review&urgency=alta` },
              'Ver en panel de operaciones →'
            )
          ),
        ),
      })
    } catch (emailErr) {
      console.error(JSON.stringify({
        event: 'n8n_alerts.email.failed',
        message: emailErr instanceof Error ? emailErr.message : 'Unknown error',
        ts: new Date().toISOString(),
      }))
    }
  }

  return NextResponse.json({ received: true, count: created.count })
}
