# Fase 4 — Panel Ops avanzado

## Estado: ✅ CERRADA — 2026-04-15

**Duración estimada:** 2 semanas
**Prioridad:** Media-alta (habilita escalado operativo del negocio)
**Dependencias:** F1 (audit log UI para auditar exportaciones)

## Objetivo

Transformar el panel `/ops` (hoy funcional pero básico) en un centro de operaciones enterprise: búsqueda/filtrado robusto, exportación de facturación, métricas SLA accionables y timeline de auditoría por pedido. Todo alineado con el patrón cursor-based ya usado en F1.

## Entregables

### 4.1 Listado `/ops/pedidos` con filtros y paginación cursor

- Filtros combinables vía URL params: `status`, `product_id`, rango `created_at`, texto libre (email/nombre/NIF) y `eidas_level`.
- Sort por `created_at DESC` (default) + por `amount_cents` o `status`.
- Paginación **cursor-based** (no offset) para consistencia con grandes volúmenes; cursor en `created_at + id`.
- Preservar filtros en URL para compartir estado; Server Component con `searchParams`.

### 4.2 Export CSV con auditoría

- Server Action `exportOrdersCsv` con mismos filtros del listado.
- Salida: un archivo CSV streameable (sin construir array en memoria si > 10k filas).
- Registro en `audit_log` con evento `orders.exported`, incluyendo `user_id` y filtros aplicados.
- Columnas: `id, created_at, user_email, product_sku, amount_cents, currency, status, invoice_id, eidas_level`.
- Formato compatible con Excel español (BOM UTF-8, separador `;`).

### 4.3 Detalle `/ops/pedido/[id]` con timeline de audit_log

- Añadir a la página del pedido un componente `OrderTimeline` con los eventos relacionados (audit_log WHERE `resource_type='order' AND resource_id=?`).
- Orden cronológico con iconografía por tipo de evento (Lucide: CreditCard, FileSignature, Mail, Upload).
- Expandir cada evento muestra payload completo (JSON formateado) — útil para soporte de incidencias.

### 4.4 Dashboard KPIs extendido

El `/ops` actual tiene KPIs básicos. Añadir:

- **Revenue mensual** (SUM `amount_cents` WHERE `status='completed'` en rango seleccionable).
- **SLA intake → firmado**: p50, p90, p99 en días (sobre pedidos cerrados en últimos 30 días).
- **Alertas normativas pendientes** (desde `monitor_alerts` no revisadas).
- **Conversión funnel** (pedidos creados → pagados → intake completo → firmado) — gauge visual.
- Filtros temporales globales (últimos 7d, 30d, 90d, mes actual).

### 4.5 Gestión masiva

- Selección múltiple en el listado de pedidos.
- Acciones batch: marcar como `processing`, enviar email recordatorio de intake, añadir nota interna.
- Confirmación con resumen (N pedidos afectados) + registro en audit_log por cada uno.

### 4.6 Panel `/ops/alertas` (monitor normativo)

- Consumidor de la tabla `monitor_alerts` (alimentada por workflows n8n — ver [guias/guia-workflows.md §6](guias/guia-workflows.md)).
- Filtros por `source` (BOE/DOGV/AEPD/CGPJ/…), `urgency`, `status` (`pending_review` / `archived` / `dismissed`) y rango `published_at`.
- Acciones por alerta: marcar como revisada, archivar, duplicar a borrador de artículo de blog (cuando F6 active MDX).
- Entry en `audit_log` por cada transición de estado (`alert.reviewed`, `alert.archived`).
- Al marcar como revisada: `revalidateTag('alerts')` para refrescar badges del header ops.

## Criterios de aceptación

- [ ] `/ops/pedidos?status=processing&cat=...&from=...&to=...` persiste el estado en URL y es compartible.
- [ ] Exportar CSV con 5000 pedidos completa en < 10s y queda entry en audit_log.
- [ ] Timeline del pedido muestra al menos: pago, intake, upload PDF, envío DocuSeal, firma completada.
- [ ] KPI de revenue coincide con Stripe Dashboard al euro.
- [ ] Tests: `src/__tests__/api/ops-orders-export.test.ts`, `src/__tests__/components/OrderTimeline.test.tsx`.
- [ ] E2E: `e2e/ops-filtering.spec.ts` valida filtros + export + timeline.

## Archivos a modificar

- `src/app/ops/pedidos/page.tsx` — filtros + cursor pagination
- `src/app/ops/pedidos/actions.ts` (NEW o extender) — `exportOrdersCsv`, `batchUpdateOrders`
- `src/app/ops/pedido/[id]/OrderTimeline.tsx` (NEW)
- `src/app/ops/pedido/[id]/page.tsx` — integrar timeline
- `src/app/ops/page.tsx` — nuevos KPIs
- `src/lib/prisma/orders.ts` — query cursor + agregaciones SLA
- `src/lib/reports/csv-stream.ts` (NEW) — helper de streaming CSV
- `e2e/ops-filtering.spec.ts` (NEW)

## Validación

1. Cargar 10k pedidos sintéticos en entorno de staging (script en `scripts/seed-orders-stress.ts`) y medir tiempos de listado/export.
2. Exportar CSV + abrir en Excel/LibreOffice: caracteres UTF-8 correctos, fechas ISO parseables.
3. Verificar que cada export deja entry en audit_log con filtros serializados.

## Riesgos

- **Coste de egress Vercel al exportar**: usar streaming + `Content-Disposition: attachment` + evitar materializar en memoria.
- **N+1 queries en KPIs SLA**: usar `$queryRaw` con CTE si el dataset crece > 50k pedidos.
- **Permisos**: verificar que `requireRole(['admin','ops'])` cubre todas las server actions — nunca exponer export a usuarios cliente.

## Cierre

- [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md) — eje Panel Ops pasa a ✅ completo.
- Entry `project_f4_ops_closed.md` con métricas (tiempo export, filas procesadas).
