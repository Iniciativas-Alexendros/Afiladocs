# Cron Jobs — Afiladocs

**Última revisión:** 2026-04-14
**Gestor:** Vercel Cron (configurado en [vercel.json](../vercel.json))
**Runtime:** `nodejs`, `force-dynamic`, `maxDuration: 60s`
**Método HTTP:** `GET` (Vercel Cron dispara GET por defecto)
**Autenticación:** `Authorization: Bearer ${CRON_SECRET}` en cada request
**Rate limiting:** `cronRateLimit` (5 req/min por IP) vía [src/lib/rate-limit.ts](../src/lib/rate-limit.ts)

## Tabla de contenidos

- [Overview](#overview)
- [1. cleanup-expired-sessions](#1-cleanup-expired-sessions)
- [2. subscription-reminders](#2-subscription-reminders)
- [3. intake-reminders](#3-intake-reminders)
- [4. sla-monitor](#4-sla-monitor)
- [5. daily-report](#5-daily-report)
- [Patrón de error handling](#patrón-de-error-handling)
- [Variables de entorno](#variables-de-entorno)
- [Monitoreo](#monitoreo)

## Overview

Los 5 crons están declarados en [vercel.json](../vercel.json) y ejecutan server actions serverless en Vercel (región `mad1`). Todos comparten el mismo contrato:

- Verifican el header `Authorization: Bearer ${CRON_SECRET}` (401 si falla, 503 si no hay secreto).
- Pasan por `cronRateLimit` (429 si se excede).
- Emiten logs JSON estructurados: `console.log(JSON.stringify({event, ...metrics, ts}))`.
- En error, llaman `notifyOpsError()` (Sentry + email ops, no bloqueante) y devuelven 500.

## 1. cleanup-expired-sessions

| Campo | Valor |
|-------|-------|
| Schedule | `0 3 * * *` (03:00 UTC diario) |
| Path | `/api/cron/cleanup-expired-sessions` |
| Archivo | [src/app/api/cron/cleanup-expired-sessions/route.ts](../src/app/api/cron/cleanup-expired-sessions/route.ts) |
| SLA | P95 < 10s |

**Lógica.** Soft-delete (`deleted_at = now`) de `orders` con:

- `status = 'intake_pending'`
- `intake_completed_at IS NULL`
- `created_at < now - 90d`
- `deleted_at IS NULL`

**Side effects.** Sólo BD. Sin emails, sin webhooks.

**Logs.** Éxito: `cron.cleanup_expired_sessions.completed` con `soft_deleted: count`. Error: `cron.cleanup_expired_sessions.error`.

**Dependencias.** Prisma (`orders.updateMany`).

## 2. subscription-reminders

| Campo | Valor |
|-------|-------|
| Schedule | `0 9 * * 1` (09:00 UTC lunes) |
| Path | `/api/cron/subscription-reminders` |
| Archivo | [src/app/api/cron/subscription-reminders/route.ts](../src/app/api/cron/subscription-reminders/route.ts) |
| SLA | P95 < 30s (depende de Resend) |

**Lógica.** Selecciona `subscriptions` con `status = 'active'` y `updated_at < now - 25d`; envía email de recordatorio de renovación (top 100).

**Side effects.**

- Resend — plantilla `SubscriptionActive`.
- Asunto: `"Recordatorio de renovación — afiladocs"`.
- Contenido: próxima fecha de facturación (`updated_at + 30d`).
- Email del cliente se obtiene vía Supabase Auth Admin API (`getUserById`).

**Logs.** Éxito: `cron.subscription_reminders.completed` con `subscriptions_processed`, `emails_sent`. Error: `cron.subscription_reminders.error` + `notifyOpsError({severity: 'warning'})`.

**Dependencias.** Resend, Supabase Auth (service role), Prisma.

## 3. intake-reminders

| Campo | Valor |
|-------|-------|
| Schedule | `0 10 * * *` (10:00 UTC diario) |
| Path | `/api/cron/intake-reminders` |
| Archivo | [src/app/api/cron/intake-reminders/route.ts](../src/app/api/cron/intake-reminders/route.ts) |
| SLA | P95 < 30s |

**Lógica.** Selecciona `orders` con `status = 'intake_pending'`, `intake_data IS NULL`, `created_at` entre `now - 90d` y `now - 3d` (ventana de recordatorio razonable, top 50).

**Side effects.**

- Resend — plantilla `IntakeRequiredEmail`.
- Asunto: `"Recordatorio: completa los datos de tu pedido — Afiladocs"`.
- CTA: link a `/portal/pedido/{id}/intake`.

**Logs.** `cron.intake_reminders.completed` / `cron.intake_reminders.error`.

**Dependencias.** Resend, Supabase Auth, Prisma.

## 4. sla-monitor

| Campo | Valor |
|-------|-------|
| Schedule | `0 8 * * 1-5` (08:00 UTC L-V) |
| Path | `/api/cron/sla-monitor` |
| Archivo | [src/app/api/cron/sla-monitor/route.ts](../src/app/api/cron/sla-monitor/route.ts) |
| SLA | P95 < 15s |

**Lógica.** Detecta documentos con firma pendiente > 7 días:

- `signing_document_id IS NOT NULL`
- `signed_at IS NULL`
- `status = 'draft'`
- `created_at < now - 7d`
- Order asociado `deleted_at IS NULL`
- Top 100, con relación `order { user }`.

**Side effects.** Si hay violaciones, envía email único de resumen a `serverEnv.opsEmail`:

- Asunto: `"Alerta SLA: {N} documento(s) pendiente(s) de firma"`.
- Plantilla: `SlaAlertEmail` con `overdueCount` y lista de documentos (orderId, productId, customer, daysPending).

**Logs.** `cron.sla_monitor.completed` (con `overdue_count`, 0 si ninguno). Email fallido: `cron.sla_monitor.email_error` (no bloqueante).

**Dependencias.** Resend, Prisma, DocuSeal (vía `signing_document_id`).

## 5. daily-report

| Campo | Valor |
|-------|-------|
| Schedule | `0 7 * * 1-5` (07:00 UTC = 09:00 CET L-V) |
| Path | `/api/cron/daily-report` |
| Archivo | [src/app/api/cron/daily-report/route.ts](../src/app/api/cron/daily-report/route.ts) |
| SLA | P95 < 20s |

**Lógica.** `Promise.all` de 6 métricas de las últimas 24h:

1. `newOrders` — `orders.count({created_at >= since, deleted_at IS NULL})`
2. `signedDocuments` — `documents.count({signed_at >= since})`
3. `pendingIntakes` — `orders.count({status: 'intake_pending', deleted_at IS NULL})`
4. `alertsReceived` — `monitor_alerts.count({created_at >= since})`
5. `failedPayments` — `audit_log.count({event: 'payment.failed', created_at >= since})`
6. `activeSubscriptions` — `subscriptions.count({status: 'active'})`

**Side effects.** 1 email a `serverEnv.opsEmail`:

- Asunto: `"Informe diario ops — {dateStr}"` (formato `"15 de abril de 2026"`).
- Plantilla: `DailyOpsReport` con las 6 métricas.

**Logs.** `cron.daily_report.completed` con todas las métricas. Error: `notifyOpsError({severity: 'warning'})`.

**Dependencias.** Resend, Prisma.

## Patrón de error handling

```ts
try {
  // operación
  console.log(JSON.stringify({ event: 'cron.{name}.completed', ...metrics, ts: new Date().toISOString() }))
  return NextResponse.json({ ok: true, ...metrics })
} catch (err) {
  const message = err instanceof Error ? err.message : 'Unknown'
  console.error(JSON.stringify({ event: 'cron.{name}.error', message, ts: new Date().toISOString() }))
  void notifyOpsError({ event: 'cron.{name}.error', message, severity: 'warning' })
  return NextResponse.json({ error: 'Cron failed' }, { status: 500 })
}
```

`notifyOpsError()` (en [src/lib/ops-alerts.ts](../src/lib/ops-alerts.ts)) es void (no bloqueante) y despacha a Sentry + email ops.

## Variables de entorno

| Variable | Scope | Requerida | Descripción |
|----------|-------|-----------|-------------|
| `CRON_SECRET` | Server | sí | Bearer token Vercel Cron → handler |
| `OPS_EMAIL` | Server | sí | Destinatario alertas (sla-monitor, daily-report, errores) |
| `RESEND_API_KEY` | Server | sí | Emails transaccionales |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | sí | Auth Admin API (user email) |
| `DATABASE_URL` | Server | sí | Prisma (Supavisor pooler 6543) |

Documentadas también en [CLAUDE.md](../CLAUDE.md) § "Variables de entorno clave".

## Monitoreo

**Logs a observar en Vercel Logs / Sentry:**

- `cron.*.completed` — métricas de éxito, correlacionar con volumen esperado.
- `cron.*.error` — siempre dispara `notifyOpsError`; debe aparecer también en ops@.
- `cron.sla_monitor.email_error` — fallo aislado de Resend; no bloquea el cron pero merece investigación si se repite.

**Cadencia esperada de emails por semana:** ~10-15 (1-2 SLA, 5 daily-report, ~3 intake, 1 subscription lunes).

**Runbook asociado:** [runbooks/stripe-webhook-fallido.md](runbooks/stripe-webhook-fallido.md) para reconciliación manual si un cron de reportes detecta inconsistencias vs Stripe.
