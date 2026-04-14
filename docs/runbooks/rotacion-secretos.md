# Runbook — Rotación de secretos sin downtime

**Última revisión:** 2026-04-14
**Frecuencia obligatoria:** cada 180 días por defecto; inmediata ante sospecha de exposición.
**Requiere:** acceso a Vercel dashboard, Supabase, Stripe, DocuSeal, Resend y GitHub.

## Principio

Vercel aplica env vars nuevas cuando se **redespliegua**. Rotar un secreto implica tres pasos: (1) generar el nuevo, (2) configurar ambos en producción si el proveedor soporta rotación con doble token, (3) redesplegar y validar, (4) invalidar el viejo.

Sin doble-token (la mayoría), la ventana de downtime del endpoint afectado es el tiempo entre `update env` y `redeploy`. Vercel tarda 1-2 min en promover el nuevo build.

## 1. Stripe — `STRIPE_SECRET_KEY` y `STRIPE_WEBHOOK_SECRET`

### Secret key (`sk_live_...`)

1. Stripe Dashboard → Developers → API keys → **Roll key** (genera nueva secreta, la vieja sigue activa 12h).
2. Copiar la nueva en Vercel: `STRIPE_SECRET_KEY` (env `Production`).
3. `vercel --prod` o push a `main` con commit trivial para forzar redeploy.
4. Validar: crear checkout session de prueba vía `/api/checkout`; revisar logs.
5. Stripe Dashboard → **Revoke old key** antes de que expiren las 12h.

### Webhook secret (`whsec_...`)

1. Stripe Dashboard → Developers → Webhooks → endpoint `https://afiladocs.com/api/webhooks/stripe` → **Roll signing secret**.
2. **Doble token durante transición:**
   - Actualizar `STRIPE_WEBHOOK_SECRET` en Vercel con el nuevo.
   - Opcional: soportar ambos en el handler si se espera ventana larga — no recomendado; Stripe acepta reintento automático, basta redesplegar rápido.
3. Redeploy.
4. Verificar en `/api/webhooks/stripe`: Stripe Dashboard → Webhook deliveries — las últimas deben pasar con el nuevo secret.

## 2. Supabase — `NEXT_PUBLIC_SUPABASE_ANON_KEY` y `SUPABASE_SERVICE_ROLE_KEY`

### Anon key (público)

Se rota con `supabase secrets rotate` o desde Supabase Dashboard → Project Settings → API → **Reset anon key**. Cuidado: invalida cualquier cliente con el key cacheado en localStorage. En la práctica basta con actualizar `.env` y redesplegar — los clientes se refrescan al cargar el bundle nuevo.

### Service role key (server only)

1. Supabase Dashboard → Project Settings → API → **Reset service role key**. Invalida inmediatamente.
2. Actualizar `SUPABASE_SERVICE_ROLE_KEY` en Vercel.
3. Redeploy.
4. Validar: probar un endpoint que use el service role (p.ej. un cron de `subscription-reminders` manualmente con `curl -H "Authorization: Bearer $CRON_SECRET" https://afiladocs.com/api/cron/subscription-reminders`).

### DB passwords (`DATABASE_URL`, `DIRECT_URL`)

1. Supabase Dashboard → Database → **Reset database password**.
2. Supabase regenera automáticamente las URLs del pooler y la directa.
3. Copiar **ambas** (puerto 6543 Supavisor y 5432 directo) en Vercel.
4. Redeploy. Validar con un query simple desde `/api/health` o un cron.

## 3. DocuSeal — `DOCUSEAL_WEBHOOK_SECRET` (+ API key si aplica)

1. Admin DocuSeal → Webhooks → regenerar HMAC secret.
2. Actualizar `DOCUSEAL_WEBHOOK_SECRET` en Vercel.
3. Redeploy.
4. Enviar un documento de prueba → completar firma en sandbox → webhook debe procesarse (validar `audit_log` con `event: 'docuseal.signed'`).
5. Si hay API key para upload: rotar y actualizar `DOCUSEAL_API_KEY` (o el nombre vigente en [src/lib/env.ts](../../src/lib/env.ts)).

## 4. Resend — `RESEND_API_KEY`

1. Resend Dashboard → API Keys → crear nueva, copiar.
2. Actualizar `RESEND_API_KEY` en Vercel.
3. Redeploy.
4. Validar: disparar manualmente el cron `daily-report` (curl con `CRON_SECRET`). El email debe llegar a `ops@afiladocs.com`.
5. Resend Dashboard → revocar la vieja.

## 5. CRON_SECRET (Vercel Cron)

1. Generar token nuevo: `openssl rand -hex 32`.
2. Actualizar `CRON_SECRET` en Vercel (env Production).
3. Redeploy.
4. Vercel Cron empieza a usar el nuevo en la siguiente ejecución. Si se necesita disparar algo entre rotación y redeploy, hacerlo manualmente antes.

## 6. n8n — `N8N_CONTACT_WEBHOOK_URL` y `N8N_ALERTS_WEBHOOK_SECRET`

- **Webhook URL:** si n8n regenera la URL, actualizar en Vercel y en la config del workflow. Sin doble-token posible → redeploy inmediato.
- **Alerts secret:** `openssl rand -hex 32` → pegar en n8n y en Vercel como `N8N_ALERTS_WEBHOOK_SECRET` simultáneamente → redeploy.

## 7. GitHub PAT / Vercel token (CI)

Rotar cada 90 días o ante sospecha:

1. Generar nuevo en cada proveedor.
2. Actualizar GitHub Actions secrets y las variables de integración en Vercel.
3. Revocar los viejos.

## Checklist de cierre

- [ ] Nuevo secreto válido en producción (`/api/health`, webhook test, cron test).
- [ ] Secreto antiguo revocado en el proveedor.
- [ ] `.env.local` de desarrollo actualizado si aplica (no commit).
- [ ] Audit log o nota en `project_*.md` de memoria con fecha, motivo y responsable.
- [ ] Si la rotación fue por sospecha de exposición → revisar Sentry / Vercel logs últimas 72h por patrones anómalos.

## Referencias

- [CLAUDE.md](../../CLAUDE.md) § "Variables de entorno clave".
- [guias/guia-seguridad.md](../guias/guia-seguridad.md) — política general de secretos.
- `~/.claude/projects/-var-home-soyalexendros/memory/cross-app-alerts.md` — alertas cruzadas entre apps (Afiladocs reporta aquí si rota un secreto que comparte con otras apps).
