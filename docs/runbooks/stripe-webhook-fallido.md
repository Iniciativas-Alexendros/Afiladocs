# Runbook — Reconciliación de un Stripe webhook fallido

**Última revisión:** 2026-04-14
**Síntomas:**

- Cliente paga, llega a `/pago-exitoso`, pero no recibe email de confirmación.
- No aparece `orders` nuevo en BD tras un `checkout.session.completed`.
- Stripe Dashboard → Webhook endpoint muestra reintentos con 4xx/5xx.
- Audit log sin `event: 'payment.succeeded'` asociado al cliente.

## Diagnóstico (5-10 min)

1. **Stripe Dashboard** → Developers → Webhooks → seleccionar el endpoint `https://afiladocs.com/api/webhooks/stripe`.
2. Pestaña **Events** — filtrar por cliente (email o `customer_id`) y últimas 24h.
3. Para cada evento relevante:
   - **Response code** esperado: `200`.
   - `400 signature mismatch` → secret desalineado (ir a [rotacion-secretos.md § 1](rotacion-secretos.md#webhook-secret-whsec_)).
   - `409 idempotency key conflict` → el evento ya fue procesado; no hacer nada.
   - `5xx` → error en el handler; revisar Sentry con el `request_id`.
4. **Vercel Logs** — filtrar `path: /api/webhooks/stripe` y el timestamp del evento. El handler loguea `stripe.webhook.received`, `stripe.webhook.processed` o `stripe.webhook.error`.
5. **BD — comprobación idempotencia:**

   ```sql
   select * from audit_log
   where event = 'payment.succeeded'
     and metadata->>'checkout_session_id' = '<cs_test_...>';
   ```

   Si hay fila, el evento se procesó y el problema está en el side-effect (email, order insert).

## Recuperación

### Caso A — Webhook con 400 por firma inválida

Motivo casi siempre: `STRIPE_WEBHOOK_SECRET` rotado pero redeploy no aplicado, o viceversa.

1. Stripe Dashboard → Webhook endpoint → copiar "Signing secret" actual.
2. Comparar con Vercel (`STRIPE_WEBHOOK_SECRET`, env Production).
3. Si difieren → actualizar Vercel y redesplegar (`vercel --prod` o push a `main`).
4. En el mismo panel de Stripe → seleccionar eventos fallidos → **Resend**.
5. Validar respuesta `200` y que llega el email al cliente.

### Caso B — Webhook con 5xx (error en el handler)

1. Sentry → buscar por `stripe.webhook.error` → obtener stack trace.
2. Causas típicas:
   - Resend caído o clave inválida → email falla pero el resto debería continuar (el handler usa `try/catch` para email — validar).
   - Supabase pooler saturado → `Too many connections`. Reintento automático de Stripe en 1h.
   - Error lógico nuevo tras deploy → evaluar rollback ([rollback-vercel.md](rollback-vercel.md)).
3. Tras corregir, reenviar los eventos fallidos desde Stripe Dashboard (**Resend**).

### Caso C — Evento recibido y procesado pero sin email

El handler tiene `try/catch` alrededor del envío de email — si Resend falla, se loguea `stripe.webhook.email_error` pero se devuelve 200. En ese caso el evento no se reintenta.

Recuperación manual:

```sql
-- confirmar que el pedido existe
select id, user_id, product_id, amount_cents, status, created_at
from orders where stripe_checkout_session_id = '<cs_...>';
```

Si existe, disparar email manualmente vía un script de mantenimiento o invocando la server action equivalente desde `/ops/pedido/[id]` (si se implementa el botón "Reenviar email" en F4). Alternativa inmediata: Resend Dashboard → **Send email** con la plantilla correspondiente.

### Caso D — Stripe marca evento `succeeded` pero no existe `orders` row

Situación grave — el pago se cobró y Afiladocs no tiene registro.

1. Comprobar que el handler no falló silenciosamente con payload nuevo (Stripe actualizó API version).
2. `orders` se crea desde `checkout.session.completed` — si el `line_items.data[0].price.id` no coincide con ningún `products.stripe_price_id`, el handler loguea `stripe.webhook.unknown_price` y aborta.
3. Acción:
   - Si el price existe pero no está en `products`: añadir producto en `/ops/productos/nuevo` o actualizar `stripe_price_id`.
   - Reenviar evento desde Stripe.
   - Si el cliente ya recibió servicio manualmente, crear `orders` manual con `audit_log` `event: 'order_created_manually'` y asociar el `checkout_session_id` para prevenir doble procesado.

## Casos de no acción

- Evento `invoice.paid` para una suscripción nueva: el handler crea/actualiza `subscriptions`. Si el log muestra `stripe.webhook.subscription_noop`, el estado ya estaba sincronizado — OK.
- Eventos `payment_intent.*` que no dependan de flujo de checkout (tests Stripe sandbox). Pueden devolver 200 sin efecto.

## Idempotencia

El handler usa `Idempotency-Key` almacenado en `audit_log.metadata.stripe_event_id`. Los retries de Stripe re-usan el mismo `event.id` → el handler detecta duplicado y devuelve `200 { idempotent: true }` sin reprocesar.

Ver implementación en [src/app/api/webhooks/stripe/route.ts](../../src/app/api/webhooks/stripe/route.ts).

## Post-incidente

1. Exportar CSV desde `/ops/auditoria` filtrando `event: stripe.webhook.*` en la ventana del incidente.
2. Si afectó a pagos reales (no sandbox) → contactar clientes impactados en < 24h.
3. Si hay divergencia entre Stripe y BD no reconciliada → escalación a @Alexendros (riesgo financiero).

## Referencias

- [src/app/api/webhooks/stripe/route.ts](../../src/app/api/webhooks/stripe/route.ts) — handler.
- [src/lib/stripe/client.ts](../../src/lib/stripe/client.ts) — `getProductPriceMap`, `EIDAS_LEVEL_MAP`.
- [CRON_JOBS.md § daily-report](../CRON_JOBS.md#5-daily-report) — reporte que detecta `failedPayments`.
- Stripe Docs: <https://stripe.com/docs/webhooks/best-practices#replay-attacks> (idempotencia), <https://stripe.com/docs/webhooks/signatures> (verificación).
