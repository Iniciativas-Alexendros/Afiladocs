# n8n workflows — Afiladocs

**Última revisión:** 2026-04-19
**Instancia:** `https://n8n.alexendros.me` (auto-hospedada).

5 workflows conectan Afiladocs con n8n: 3 monitores programados empujan alertas normativas, 1 relay del formulario de contacto, 1 router de errores. Todos comparten `N8N_ALERTS_WEBHOOK_SECRET` como Bearer token.

## Catálogo de workflows

| Workflow | Tipo | Endpoint / schedule | Estado |
|----------|------|---------------------|--------|
| BOE/DOGV Monitor | Schedule (diario) | Empuja a `POST /api/webhooks/n8n-alerts` | Activo |
| AEPD Monitor | Schedule (diario) | Empuja a `POST /api/webhooks/n8n-alerts` | Activo |
| CGPJ Monitor | Schedule (diario) | Empuja a `POST /api/webhooks/n8n-alerts` | Activo |
| Contact Form Relay | Webhook | `https://n8n.alexendros.me/webhook/afiladocs-contact` | Pendiente SMTP |
| Error Router | Webhook | `https://n8n.alexendros.me/webhook/afiladocs-errors` | Pendiente SMTP |

**IDs internos de los workflows** (sólo los ve el admin de la instancia n8n): viven en la memoria privada `reference_n8n_workflows.md` del harness de Claude Code — no se copian al repo para no exponer superficie interna.

## Variables de entorno

| Variable | Scope | Uso |
|----------|-------|-----|
| `N8N_CONTACT_WEBHOOK_URL` | Server | `POST /api/contact` la usa para reenviar el formulario |
| `N8N_ERROR_WEBHOOK_URL` | Server | Router de errores usa esta URL desde n8n hacia el error handler |
| `N8N_ALERTS_WEBHOOK_SECRET` | Server | Bearer compartido — verifica `POST /api/webhooks/n8n-alerts` en el handler de Afiladocs |

## Flujo "alerts ingest" (n8n → Afiladocs)

1. Cron de n8n dispara el monitor (BOE/DOGV, AEPD o CGPJ).
2. Scraping + parsing en n8n.
3. Si hay match con keywords relevantes: `POST https://afiladocs.com/api/webhooks/n8n-alerts` con `Authorization: Bearer ${N8N_ALERTS_WEBHOOK_SECRET}`.
4. Handler en [src/app/api/webhooks/n8n-alerts/route.ts](../src/app/api/webhooks/n8n-alerts/route.ts):
   - Verifica Bearer.
   - Inserta fila en `monitor_alerts`.
   - Si `urgency='alta'`: envía email a ops.
   - `revalidateTag('alerts')` → `/ops/alertas` se refresca en siguiente request.

### Payload mínimo

```json
{
  "source": "boe|dogv|aepd|cgpj",
  "urgency": "baja|media|alta",
  "title": "Título del boletín/alerta",
  "summary_md": "Resumen markdown breve",
  "url": "https://url-origen",
  "published_at": "2026-04-19T00:00:00Z"
}
```

### curl de prueba

```bash
curl -X POST https://afiladocs.com/api/webhooks/n8n-alerts \
  -H "Authorization: Bearer $N8N_ALERTS_WEBHOOK_SECRET" \
  -H "Content-Type: application/json" \
  -d '{"source":"boe","urgency":"media","title":"Prueba","summary_md":"Test","url":"https://boe.es","published_at":"2026-04-19T00:00:00Z"}'
```

## Flujo "contact relay" (Afiladocs → n8n)

1. Usuario envía formulario en `/contacto`.
2. `POST /api/contact` valida con Zod + rate-limit (5 req / 10 min).
3. Server action reenvía a `N8N_CONTACT_WEBHOOK_URL` con Bearer.
4. n8n (`Contact Form Relay`): filtra spam + reenvía a SMTP (pendiente de configurar SMTP al 2026-04-19).

## Operativa

- **Activar/desactivar un monitor:** directamente en `https://n8n.alexendros.me` (requiere credenciales admin de la instancia). Apagarlo ahí es lo único que impide ingesta nueva; el handler en Afiladocs no tiene toggle.
- **Cambiar Bearer secret:** ver [runbooks/rotacion-secretos.md §6](runbooks/rotacion-secretos.md#6-n8n--n8n_contact_webhook_url-y-n8n_alerts_webhook_secret). Rotar en n8n y Vercel simultáneamente.
- **Añadir un nuevo monitor:** documentar aquí antes de activarlo en producción. Usar el mismo Bearer `N8N_ALERTS_WEBHOOK_SECRET` — no crear secretos nuevos salvo que justifique aislamiento.

## Referencias

- [src/app/api/webhooks/n8n-alerts/route.ts](../src/app/api/webhooks/n8n-alerts/route.ts) — handler y validación Bearer.
- [src/app/api/contact/route.ts](../src/app/api/contact/route.ts) — contact relay origen.
- [CLAUDE.md § Integraciones n8n](../CLAUDE.md#integraciones-n8n) — resumen canónico.
- [guias/guia-workflows.md](guias/guia-workflows.md) — política de incorporación de workflows nuevos.
