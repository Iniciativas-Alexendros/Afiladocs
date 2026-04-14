# Runbook — Rollback de un deploy en Vercel

**Última revisión:** 2026-04-14
**SLA de respuesta:** detectar < 10 min, decidir rollback vs forward-fix < 5 min, rollback ejecutado < 2 min.
**Severidad típica:** S1 si el site está caído en producción; S2 si hay regresión funcional que afecta checkout o portal.

## Cuándo hacer rollback vs forward-fix

| Situación | Acción |
|-----------|--------|
| Home rota (500 server-wide), checkout caído, webhooks fallando, CSP bloquea Stripe | **Rollback inmediato.** Investigar con calma luego. |
| Regresión estética, bug en flujo no crítico, typo visible | **Forward-fix.** Abrir hotfix branch y desplegar corrección. |
| Migración Prisma ya aplicada + incidente | **NUNCA rollback solo.** El deploy anterior puede no ser compatible con el schema nuevo. Rollback + migración inversa coordinada. |
| Webhook secret rotado en este deploy | Rollback sólo si el handler soportaba el secret previo (pocos minutos de gracia). Si no, forward-fix. |

## Prerrequisitos

- Acceso a Vercel dashboard (`vercel.com/alexendros/afiladocs`) con permiso `deploy` o `admin`.
- `vercel` CLI autenticado (`vercel login` con la cuenta `alexendros`). Verificar con `vercel whoami`.
- Token `VERCEL_TOKEN` en env local si se usa CI (opcional para rollback manual).

## Procedimiento por dashboard (recomendado)

1. Abrir <https://vercel.com/alexendros/afiladocs/deployments>.
2. Identificar el deploy **"Ready" inmediatamente anterior** al que provocó el incidente (estado verde, fecha previa). Confirmar que apunta a un commit conocido-bueno (`git log`).
3. Clic en los tres puntos `…` → **Promote to Production**. Confirmar en el modal.
4. Vercel hace swap del alias `afiladocs.com` en ~30s sin downtime. Validar con `curl -I https://afiladocs.com` (HTTP 200) y abriendo el site.
5. Anotar en `#ops` (o ticket) el deploy ID promovido y el motivo.

## Procedimiento por CLI

```bash
cd /var/home/soyalexendros/Apps/afiladocs-website
vercel ls --scope alexendros afiladocs   # lista últimos deploys
# Identificar <DEPLOY_URL> del último Ready-good (p.ej. afiladocs-abc123.vercel.app)
vercel promote <DEPLOY_URL> --scope alexendros
```

El alias `afiladocs.com` y `www.afiladocs.com` se reasignan atómicamente.

## Validación post-rollback

1. `curl -sI https://afiladocs.com | head -5` — HTTP 200, cabeceras CSP presentes.
2. `curl -s https://afiladocs.com/api/health` — `{"status":"ok"}`.
3. Flujo de checkout manual con tarjeta de prueba Stripe (`4242 4242 4242 4242`) → `/pago-exitoso` + email recibido.
4. Portal: login → abrir un pedido existente → descargar documento firmado.
5. Abrir Sentry y Vercel Logs: confirmar que los errores de los últimos minutos han cesado.

## Qué hacer con la migración de BD

Si el deploy fallido aplicó una migración Prisma:

1. Comprobar en Supabase (`_prisma_migrations`) cuál fue la última aplicada.
2. **No ejecutar `prisma migrate reset`** — borra datos.
3. Opciones:
   - **Columna añadida NULLable:** dejar el schema como está. El código anterior la ignora.
   - **Columna NOT NULL con default:** en general compatible con el código viejo.
   - **Columna eliminada o renombrada, constraint nuevo:** coordinar downgrade manual vía SQL (`ALTER TABLE ...`) antes de promover el rollback. Hacerlo en una transacción.
4. Si no está claro, pedir revisión a @Alexendros antes de tocar la BD.

## Post-mortem obligatorio

Tras cualquier rollback en producción:

1. Crear issue `incident/<fecha>-<slug>` en GitHub.
2. Incluir: timeline (detección, decisión, rollback, recuperación), causa raíz (hipótesis), impacto (usuarios afectados, pagos en cola), mitigaciones aplicadas, acciones de prevención.
3. Si el incidente tocó datos personales → evaluar notificación AEPD (72h) con @Alexendros.
4. Archivar la auditoría relacionada exportando CSV desde `/ops/auditoria` con filtro temporal del incidente.

## Referencias

- [CLAUDE.md](../../CLAUDE.md) § "Deploy Vercel".
- [guias/guia-workflows.md](../guias/guia-workflows.md) — convenciones de branches y CI.
- [runbooks/stripe-webhook-fallido.md](stripe-webhook-fallido.md) — si el incidente afecta a pagos.
