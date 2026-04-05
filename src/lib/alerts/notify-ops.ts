import { serverEnv } from '@/lib/env'

interface NotifyOpsPayload {
  event: string
  message: string
  severity?: 'critical' | 'warning' | 'info'
  metadata?: Record<string, unknown>
}

/**
 * Non-blocking POST to n8n Error Router webhook.
 * Fail-safe: never throws, never blocks the caller.
 * If N8N_ERROR_WEBHOOK_URL is not configured, silently returns.
 */
export async function notifyOpsError(payload: NotifyOpsPayload): Promise<void> {
  const url = serverEnv.n8nErrorWebhookUrl
  if (!url) return

  try {
    await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        ...payload,
        severity: payload.severity ?? 'warning',
        ts: new Date().toISOString(),
      }),
      signal: AbortSignal.timeout(5000),
    })
  } catch {
    // Swallow — this utility must never propagate errors
    console.error(JSON.stringify({
      event: 'notify_ops.send_failed',
      original_event: payload.event,
      ts: new Date().toISOString(),
    }))
  }
}
