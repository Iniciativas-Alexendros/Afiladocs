# Backoffice Ops — journey operativo

**Última revisión:** 2026-04-14
**Prefijo:** `/ops/*`
**Gate:** `requireRole(['admin','ops'])` en [src/app/ops/layout.tsx](../src/app/ops/layout.tsx). Los usuarios sin rol son redirigidos a `/portal`.

## Tabla de contenidos

- [Dashboard `/ops`](#dashboard-ops)
- [Listado `/ops/pedidos`](#listado-opspedidos)
- [Gestión de pedido `/ops/pedido/[id]`](#gestión-de-pedido-opspedidoid)
- [Catálogo `/ops/productos`](#catálogo-opsproductos)
- [Alertas normativas `/ops/alertas`](#alertas-normativas-opsalertas)
- [Auditoría `/ops/auditoria`](#auditoría-opsauditoria)

## Dashboard `/ops`

**Archivo:** [src/app/ops/page.tsx](../src/app/ops/page.tsx)

**KPI cards (3):**

| Card | Fuente | Descripción |
|------|--------|-------------|
| **Para redactar** | `orders.count({status: 'processing'})` | Pedidos con intake completado listos para el abogado |
| **Esperando cliente** | `orders.count({status: 'intake_pending'})` | Pendientes de que el cliente rellene datos |
| **Suscripciones activas** | `subscriptions.count({status: 'active'})` | Recurring revenue en vigor |

**Lista "Pedidos que requieren atención":** top 10 `orders` con `status IN ('intake_pending','processing')`, `orderBy: created_at DESC`, incluye `user.full_name` para mostrar cliente. Cada fila linka a `/ops/pedido/{id}`.

## Listado `/ops/pedidos`

**Archivo:** [src/app/ops/pedidos/page.tsx](../src/app/ops/pedidos/page.tsx)

Tabla paginada simple (top 50 por defecto, ordenados por `created_at DESC`). Columnas: ID corto, cliente (`user.full_name`), servicio, estado, importe, botón "Gestionar".

Mejoras previstas en F4 (filtros avanzados, export CSV extendido — ver [fase-4-ops-avanzado.md](fase-4-ops-avanzado.md)).

## Gestión de pedido `/ops/pedido/[id]`

**Archivo:** [src/app/ops/pedido/[id]/page.tsx](../src/app/ops/pedido/[id]/page.tsx)

**Columna izquierda (sidebar):**

- **Cliente** — ID corto, nombre, fecha de alta.
- **Pedido** — producto, importe, estado actual.
- **Cambio manual de estado** — botones `intake_pending` | `processing` | `draft_ready` | `completed`. El actual se renderiza como disabled.

  **Server action** `opsUpdateOrderStatus(orderId, formData)`:

  1. `requireRole(['admin','ops'])`.
  2. Zod valida status contra la whitelist.
  3. `orders.update({status})`.
  4. Audit log `event: 'order_status_updated_manually'`, `metadata: {new_status}`.
  5. Si `draft_ready` → `notifyDraftReady()` (email al cliente, no bloqueante).
  6. `revalidatePath('/ops/pedido/{id}')` + `/ops/pedidos`.

**Columna principal:**

- **Datos de intake** — `IntakeDataViewer` pinta `order.intake_data`. Si está vacío y `status = intake_pending`, muestra alerta ámbar.
- **Gestión documental** — dos bloques:
  - **Subir borrador (.pdf)** — input file + submit → `opsUploadDocument(orderId, 'draft', formData)`.
  - **Subir documento final (.pdf)** — equivalente con `type: 'signed'`.
  - **Lista de documentos** adjuntos con badge de estado y filename.

  **Server action** `opsUploadDocument(orderId, type, formData)`:

  1. Valida que el archivo existe y es PDF.
  2. Sube a Supabase Storage (`documents/{user_id}/{order_id}/{type}_{ts}.pdf`).
  3. Crea `documents` con:
     - `draft` → `status: 'draft'`, `draft_pdf_path: path`.
     - `signed` → `status: 'final'`, `signed_pdf_path: path`.
  4. Actualiza `orders.status`: `draft` → `draft_ready`, `signed` → `completed`.
  5. Audit log `document_draft_uploaded` / `document_signed_uploaded`.
  6. `revalidatePath('/ops/pedido/{id}')`.

## Catálogo `/ops/productos`

**Archivo:** [src/app/ops/productos/page.tsx](../src/app/ops/productos/page.tsx)

Tabla ordenada por `category → display_order → title`. Muestra SKU, título, categoría, kind (`template/review/pack`), `delivery_mode`, precio (céntimos → EUR), Stripe Price ID truncado, DocuSeal Template ID, badge `active/draft`, botón "Editar".

**Alertas de consistencia** (banner superior):

- Productos con `kind !== 'review'` y sin `stripe_price_id`.
- Productos con `delivery_mode IN ('docuseal_fill_and_sign','docuseal_fill_only')` y sin `docuseal_template_id`.

### `/ops/productos/nuevo`

**Archivo:** [src/app/ops/productos/nuevo/page.tsx](../src/app/ops/productos/nuevo/page.tsx). Reutiliza `ProductForm`. La server action `createProduct` valida Zod, comprueba SKU único y redirige al editor.

### `/ops/productos/[sku]`

**Archivo:** [src/app/ops/productos/[sku]/page.tsx](../src/app/ops/productos/[sku]/page.tsx). Mismo form con datos precargados. `sku` es inmutable.

**Campos del formulario (Zod):**

| Campo | Tipo | Reglas |
|-------|------|--------|
| `sku` | string | Mayúsculas, dígitos, guiones |
| `slug` | string | kebab-case |
| `title` | string | requerido |
| `description_md` | Markdown | máx. 10 000 |
| `category` | enum | `rgpd`, `arrendamiento`, `civil`, `mercantil`, `pack`, `reclamacion`, `review` |
| `kind` | enum | `template`, `review`, `pack` |
| `price_cents` | integer | 0 – 1 000 000 |
| `vat_mode` | enum | `included`, `excluded` |
| `stripe_price_id` | string opcional | `price_...`, máx. 120 |
| `docuseal_template_id` | string opcional | UUID, máx. 120 |
| `storage_path` | string opcional | ruta en bucket |
| `delivery_mode` | enum | `docuseal_fill_and_sign`, `docuseal_fill_only`, `download_after_payment`, `human_review` |
| `eidas_level` | enum | `SES`, `AES` |
| `is_active` | boolean | checkbox |
| `display_order` | integer | 0 – 9999 |

**Flujo de alta de producto con Stripe:**

1. Crear producto en ops (`is_active = false`).
2. Crear Price en Stripe Dashboard → copiar `price_...`.
3. Pegar `stripe_price_id` en el formulario.
4. (Si aplica) crear template en DocuSeal → copiar UUID → `docuseal_template_id`.
5. Marcar `is_active = true` y guardar.

## Alertas normativas `/ops/alertas`

**Archivo:** [src/app/ops/alertas/page.tsx](../src/app/ops/alertas/page.tsx)

Las alertas llegan vía `POST /api/webhooks/n8n-alerts` (Bearer `N8N_ALERTS_WEBHOOK_SECRET`). n8n ingesta desde BOE, DOGV, boletines de colegios profesionales, etc.

**Filtros (query params):**

- `?status=pending_review|reviewed|all` (default `pending_review`).
- `?urgency=alta|media|baja` (opcional).

**Schema del payload** (Zod en el webhook):

```json
{
  "source": "BOE",
  "title": "Real Decreto 1007/2023 — Verifactu",
  "summary": "Resumen...",
  "urgency": "alta",
  "raw_url": "https://www.boe.es/...",
  "published_at": "2026-04-14T00:00:00Z",
  "areas": ["fiscal", "mercantil"]
}
```

Acepta alerta única o array (máx. 50 por request). Todas se crean con `status = 'pending_review'`. Si alguna trae `urgency = 'alta'`, el handler envía email `[URGENTE]` a `serverEnv.opsEmail`.

### `/ops/alertas/[id]`

**Archivo:** [src/app/ops/alertas/[id]/page.tsx](../src/app/ops/alertas/[id]/page.tsx)

Muestra título, urgencia, áreas, fuente, fecha, resumen, link externo. Si está pendiente, botón "Marcar como revisada" llama `markAlertReviewed(alertId)`:

1. `requireRole(['admin','ops'])`.
2. `monitor_alerts.update({status: 'reviewed', reviewed_by: user.id, reviewed_at: now})`.
3. `revalidatePath('/ops/alertas')` + detalle.

## Auditoría `/ops/auditoria`

UI disponible en `main` desde F1. Archivos: [ops/auditoria/](../src/app/ops/auditoria/).

- Tabla con `audit_log` paginado cursor-based (`take PAGE_SIZE+1`, cursor `after` en query param).
- Filtros `event`, `user_id`, `from`, `to` persistidos en URL.
- Server action `exportAuditLogCsv` que genera CSV y registra `event: 'report.exported'` como meta-audit.

**Eventos que alimentan la tabla:**

- Desde portal: `intake_submitted`, `document.downloaded`.
- Desde ops: `document_draft_uploaded`, `document_signed_uploaded`, `order_status_updated_manually`, `report.exported`.
- Desde webhooks: `payment.succeeded`, `payment.failed`, `docuseal.signed`, `n8n_alerts.ingested`.

**Invalidaciones y rate limiting en ops.** Sin rate limiting explícito en server actions (confiamos en la protección de sesión + rol). Todas las mutaciones revalidan el path afectado; las server actions no dependen de cache global.

## Integración con webhooks y crons

- `POST /api/webhooks/stripe` dispara `revalidateTag('orders')` tras `checkout.session.completed` — el catálogo y listado de ops se refrescan.
- `POST /api/webhooks/docuseal` guarda el PDF firmado en Storage, actualiza `documents.status = 'final'` y dispara email al cliente.
- `POST /api/webhooks/n8n-alerts` crea `monitor_alerts` (ver sección arriba).
- Crons (ver [CRON_JOBS.md](CRON_JOBS.md)) envían reportes diarios y recordatorios; ops ve su efecto en los KPIs del dashboard y en la bandeja de `ops@afiladocs.com`.
