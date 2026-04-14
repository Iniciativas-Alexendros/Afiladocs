# Runbook — Recuperación de firma DocuSeal

**Última revisión:** 2026-04-14
**Síntomas que disparan este runbook:**

- Cliente reporta que firmó en DocuSeal pero no puede descargar el PDF en `/portal/pedido/[id]`.
- `documents.status` sigue en `pending_signature` o `draft` pese a firma confirmada.
- Webhook `/api/webhooks/docuseal` devuelve 4xx/5xx en Vercel Logs.
- Cron `sla-monitor` incluye el documento como pendiente > 7d pero DocuSeal lo da como completado.

## Diagnóstico rápido (5 min)

1. **Confirmar firma en DocuSeal.**
   - Admin DocuSeal → buscar por `submission_id` o por email del cliente.
   - Si el estado no es `completed`, el problema es upstream (el cliente no terminó). Contactar al cliente.

2. **Inspeccionar webhook.**
   - Vercel Logs: filtrar `path: /api/webhooks/docuseal` últimas 24h.
   - Estados esperados por cada submission:
     - `200` con log `docuseal.webhook.received` → éxito (el fallo es posterior).
     - `401` → HMAC fallido (secret desalineado — ver [rotacion-secretos.md](rotacion-secretos.md)).
     - `422` → payload inválido (posible cambio de versión de DocuSeal).
     - `500` → error interno (Sentry debería tener traza).

3. **Estado en BD.**

   ```sql
   select id, order_id, status, signing_document_id, signed_pdf_path, signed_at, updated_at
   from documents
   where signing_document_id = '<submission_id>';
   ```

   - `signed_pdf_path IS NULL` + `signed_at IS NULL` → el webhook nunca completó.
   - `signed_pdf_path` presente pero `status != 'final'` → race condition; actualizar manualmente (sección "Recuperación").

## Recuperación

### Caso A — Webhook nunca llegó (HMAC ok, sólo no disparó)

1. Admin DocuSeal → submission → **Resend webhook**. Vercel Logs debe mostrar 200.
2. Si no hay botón de reenvío, seguir al caso B.

### Caso B — Webhook fallido (4xx/5xx) pero firma completada

Procedimiento manual de reconciliación:

1. Descargar el PDF firmado desde DocuSeal → botón "Download signed PDF".
2. Como ops en `/ops/pedido/[id]` → bloque "Subir documento final (.pdf)" → subir el archivo.
3. Esto dispara `opsUploadDocument('signed', …)`:
   - Guarda en `documents/{user_id}/{order_id}/signed_{ts}.pdf`.
   - Marca `documents.status = 'final'`.
   - Cambia `orders.status = 'completed'`.
   - Audit log `event: 'document_signed_uploaded'`.
4. Añadir comentario en el ticket ops: "Recuperación manual — webhook DocuSeal `<submission_id>` falló, reconciliado `<ts>`."

### Caso C — HMAC inválido (401 repetidos)

Probable desalineación entre `DOCUSEAL_WEBHOOK_SECRET` y el configurado en el admin DocuSeal. Seguir [rotacion-secretos.md § 3](rotacion-secretos.md#3-docuseal--docuseal_webhook_secret--api-key-si-aplica). Tras rotar, pedir a DocuSeal reenvío de los webhooks fallidos (últimas 72h) desde el admin.

### Caso D — Documento firmado pero `orders.status` inconsistente

Puede ocurrir si se subió el PDF por ops pero el cron `sla-monitor` lo detectó antes de refrescar:

```sql
-- verificar
select id, status, updated_at from orders where id = '<order_id>';

-- si signed_pdf_path existe y orders.status != 'completed':
update orders
set status = 'completed', updated_at = now()
where id = '<order_id>';

-- audit trail manual
insert into audit_log (event, user_id, order_id, metadata, created_at)
values ('order_status_repaired', '<ops_user_id>', '<order_id>',
        '{"reason":"docuseal_recovery","old_status":"processing"}', now());
```

Ejecutar en una transacción si es posible. Sólo un admin puede hacerlo (RLS).

## Comunicación al cliente

- Si el cliente notificó directamente → responder en menos de 2h con ETA de resolución.
- Tras reconciliar → el `PortalRealtimeSubscription` del cliente puede refrescar automáticamente. Si el cliente sigue con la pestaña vieja abierta, pedirle que recargue.
- Email de cortesía: "Tu documento está disponible en /portal/pedido/{id}" (plantilla `document-ready` en [src/emails/](../../src/emails/)).

## Prevención

- Cron `sla-monitor` genera alertas automáticamente para pendientes > 7d — no confiar sólo en reportes del cliente.
- Monitorizar en Sentry la tasa de 4xx/5xx del endpoint `/api/webhooks/docuseal`. Spike > 5% en 1h → investigar.
- En F5 se prevé añadir `unstable_cache` con `revalidateTag('documents')` en `/portal/*` para reducir ventanas donde la UI no refleja el cambio.

## Referencias

- [BACKOFFICE_OPS.md](../BACKOFFICE_OPS.md) — server action `opsUploadDocument`.
- [src/app/api/webhooks/docuseal/route.ts](../../src/app/api/webhooks/docuseal/route.ts) — handler y verificación HMAC.
- [src/lib/signing/](../../src/lib/signing/) — adapter pattern DocuSeal/Documenso.
