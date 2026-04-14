# Portal cliente — journey autenticado

**Última revisión:** 2026-04-14
**Prefijo:** `/portal/*`
**Gate:** `requireAuth()` en cada `page.tsx` (redirige a `/login`).
**Layout:** [src/app/portal/layout.tsx](../src/app/portal/layout.tsx) monta `PortalRealtimeSubscription` para invalidar cache ante cambios en `orders`/`documents` vía Supabase Realtime.

## Tabla de contenidos

- [Dashboard `/portal`](#dashboard-portal)
- [Listado `/portal/pedidos`](#listado-portalpedidos)
- [Detalle `/portal/pedido/[id]`](#detalle-portalpedidoid)
- [Intake `/portal/pedido/[id]/intake`](#intake-portalpedidoidintake)
- [Descarga documento firmado](#descarga-documento-firmado)
- [Suscripciones `/portal/suscripciones`](#suscripciones-portalsuscripciones)
- [Configuración `/portal/configuracion`](#configuración-portalconfiguracion)
- [Audit log y cache](#audit-log-y-cache)

## Dashboard `/portal`

**Archivo:** [src/app/portal/page.tsx](../src/app/portal/page.tsx)

**Contenido:**

- 3 KPI cards: suscripciones activas, total de pedidos, CTA a `/servicios`.
- Sección "Actividad reciente": últimos 5 pedidos con badge de estado, link a `/portal/pedido/{id}`.
- Empty state si no hay pedidos (invita a explorar servicios).

**Queries.** `orders.findMany({user_id, orderBy: created_at DESC, take: 5})` + `subscriptions.count({user_id, status: 'active'})`.

## Listado `/portal/pedidos`

**Archivo:** [src/app/portal/pedidos/page.tsx](../src/app/portal/pedidos/page.tsx)

Tabla con todos los pedidos del usuario (no paginado), ordenados por `created_at DESC`. Columnas: ID (8 primeros chars), producto, fecha, estado. Cache con `unstable_cache` tag `orders-{user_id}`, revalidate 60s.

## Detalle `/portal/pedido/[id]`

**Archivo:** [src/app/portal/pedido/[id]/page.tsx](../src/app/portal/pedido/[id]/page.tsx)

**Columna izquierda (principal):**

1. **Alerta de intake** (si `status = 'intake_pending'`): card ámbar con CTA a `/portal/pedido/{id}/intake`.
2. **Documentos entregados** — por documento muestra:
   - `draft` → botón "Descargar borrador" (URL pública).
   - `pending_signature` → botón "Firmar documento" (redirige a DocuSeal).
   - `final` → botón "Descargar firmado" (server action con URL firmada Supabase Storage, TTL 1h).

**Columna derecha (sidebar):** ID corto, nombre del servicio, importe, nivel eIDAS (SES/AES).

**Gate de propiedad.** `orders.findFirst({id, user_id})` — si el pedido no existe o no es del usuario, 404.

## Intake `/portal/pedido/[id]/intake`

**Archivo:** [src/app/portal/pedido/[id]/intake/page.tsx](../src/app/portal/pedido/[id]/intake/page.tsx) + `IntakeForm.tsx`.

**Acceso.** Sólo si `order.status === 'intake_pending'`. Si ya se completó, redirige a `/portal/pedido/{id}`.

**Campos (3, todos requeridos):**

- **Titular** — text (nombre persona o razón social).
- **Actividad** — text (sector/ocupación).
- **Detalles** — textarea (descripción del caso).

**Server action** [`submitIntake(orderId, formData)`](../src/app/portal/actions.ts):

1. Valida sesión + propiedad del pedido.
2. Persiste `orders.intake_data` como JSON:

   ```json
   {
     "titular": "...",
     "actividad": "...",
     "detalles": "...",
     "submittedAt": "2026-04-14T10:30:00.000Z"
   }
   ```

3. Cambia `status = 'processing'`, `intake_completed_at = now`.
4. Inserta `audit_log`: `event: 'intake_submitted'`, `metadata: {status_change: 'intake_pending→processing'}`.
5. `revalidatePath('/portal/pedido/{id}', 'page')`.
6. Toast: "Formulario completado correctamente. Estamos procesando tu pedido."

**Validación.** Client-side: HTML5 `required`. Server-side: todos los campos no vacíos + longitud razonable (Zod en la action).

## Descarga documento firmado

**Componente:** `DownloadSignedButton.tsx` (client) en el detalle del pedido.

**Server action** [`getSignedDocumentUrl(documentId)`](../src/app/portal/actions.ts):

1. Verifica `doc.order.user_id === auth.user.id`.
2. Comprueba `doc.status === 'final'` y existencia de `signed_pdf_path`.
3. Genera URL firmada de Supabase Storage (bucket `documents`, TTL 3600s).
4. Audit log `event: 'document.downloaded'`, `metadata: {document_id, signed_pdf_path}`.
5. Devuelve URL → el cliente abre en nueva pestaña.

## Suscripciones `/portal/suscripciones`

**Archivo:** [src/app/portal/suscripciones/page.tsx](../src/app/portal/suscripciones/page.tsx)

Lista todas las suscripciones del usuario (sin paginar). Por suscripción:

- Badge de estado (`active` / `canceled` / `past_due`).
- Si `active` → botón "Gestionar suscripción" abre Stripe Billing Portal.
- Si `canceled` → botón "Renovar suscripción" a `/servicios`.

**Server action** [`createBillingPortalSession(subscriptionId)`](../src/app/portal/suscripciones/actions.ts):

1. `requireAuth()`.
2. `stripe.billingPortal.sessions.create({customer, return_url: '/portal/suscripciones'})`.
3. Devuelve `session.url` para redirect client-side.

Stripe Billing Portal gestiona cambio de plan, cancelación, actualización de método de pago y descarga de facturas — Afiladocs no duplica esa UI.

## Configuración `/portal/configuracion`

**Archivo:** [src/app/portal/configuracion/page.tsx](../src/app/portal/configuracion/page.tsx) + `ConfiguracionForm.tsx`

Formulario editable:

- `full_name`, `company_name`, `phone` → tabla `profiles`.
- `email` sólo lectura (proviene de Supabase Auth, cambiarlo requiere flujo dedicado).

El submit actualiza `profiles` vía server action; NIF y rol (`client/ops/admin`) no son editables por el cliente.

## Audit log y cache

**Lo que genera audit log desde el portal:**

- `intake_submitted` — cliente completa intake.
- `document.downloaded` — cliente descarga PDF firmado.

**Invalidaciones después de mutaciones:**

- `submitIntake` → `revalidatePath('/portal/pedido/{id}', 'page')`.
- `revalidateTag('orders')` se dispara desde webhooks (stripe, docuseal) y refresca el listado vía `unstable_cache`.

**Realtime.** `PortalRealtimeSubscription` escucha `postgres_changes` en `orders` y `documents` filtrados por `user_id` → dispara un `router.refresh()` para reflejar upload de documento por ops o cambio de estado sin recargar manualmente.

**Observabilidad.** Errores en server actions se capturan con Sentry (via `instrumentation.ts`). Las acciones loguean JSON estructurado con `event` en formato `portal.*` que facilita filtrar en Vercel Logs.
