# Fase 1 — Seguridad y endurecimiento

## Estado: ✅ CERRADA — 2026-04-14

**Duración estimada:** 2 semanas
**Prioridad:** Alta (bloqueante para auditoría externa)
**Dependencias:** ninguna (puede ejecutarse en paralelo con F2)

## Objetivo

Cerrar los 3 gaps de seguridad identificados en [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md): CSP con `unsafe-inline`, middleware sin detección de bots/geo y ausencia de UI para `audit_log`. Al cerrar esta fase, la aplicación debe superar una auditoría OWASP ASVS Level 2 sin hallazgos *High* en la capa de transporte/cabeceras.

## Entregables

### 1.1 CSP nonce-based

- Generar nonce criptográfico por request en [src/middleware.ts](../../src/middleware.ts) (`crypto.randomUUID()` → base64).
- Propagar nonce al header `x-nonce` de la request hacia RSC.
- Sustituir `'unsafe-inline'` del `script-src` por `'nonce-{value}'` en [next.config.ts](../../next.config.ts) — el header CSP pasa a generarse desde middleware (no desde `headers()` estático).
- Los scripts inline (Stripe, analytics) leen el nonce desde `headers()` en el layout y lo inyectan en `<Script nonce={nonce}>`.

### 1.2 Middleware con bot detection y geo

- Detectar user-agents sospechosos (patrón `/bot|crawl|spider|scan|curl|wget/i`) en rutas `/api/*` y responder 403 — excluyendo a bots legítimos conocidos (Googlebot, Bingbot) que tienen reverse-DNS válido.
- Bloqueo geo opcional controlado por `serverEnv.geoBlockedCountries` (default: vacío; RGPD hace que geo-blocking sea sensible, activar sólo bajo petición explícita).
- Regex de rutas sospechosas (`/\.\.|\/etc\/|\/proc\/|<script/i`) → log estructurado + 400.

### 1.3 UI de `audit_log` en Ops

- Nueva ruta `src/app/ops/auditoria/page.tsx` (sólo roles `admin`/`ops`).
- Tabla paginada (cursor-based para consistencia con F4) con filtros por `event`, `user_id`, rango de fechas.
- Server Action `exportAuditLogCsv` (registro propio en audit_log con evento `report.exported`).
- Reutilizar componentes del design system existente (`src/components/ui/table`, filtros de `/ops/pedidos`).

## Criterios de aceptación

- [ ] `curl -I https://afiladocs.com` muestra `Content-Security-Policy` con `script-src 'self' 'nonce-<base64>' https://js.stripe.com https://*.sentry.io` y **sin** `'unsafe-inline'`.
- [ ] Lighthouse Best Practices ≥ 95 en `/` y `/tienda`.
- [ ] Un request con `User-Agent: sqlmap/1.7` a `/api/contact` recibe 403 (no 429, no 400).
- [ ] `/ops/auditoria` renderiza 100 eventos en < 500ms (SSR) y permite exportar CSV con firma del evento en audit_log.
- [ ] Tests nuevos en `src/__tests__/middleware.test.ts` y `src/__tests__/api/ops-auditoria.test.ts`.
- [ ] `npm run typecheck && npm run lint && npm run test:coverage` sin regresiones.

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| [src/middleware.ts](../../src/middleware.ts) | Añadir nonce, bot/geo detection, propagación header |
| [next.config.ts](../../next.config.ts) | Retirar `unsafe-inline`, mover CSP a middleware |
| `src/app/layout.tsx` | Leer nonce de `headers()` y pasar a `<Script>` |
| `src/lib/env.ts` | Añadir `geoBlockedCountries` (optional) a `serverEnv` |
| `src/app/ops/auditoria/page.tsx` (NEW) | Página listado + filtros |
| `src/app/ops/auditoria/actions.ts` (NEW) | Server Action export CSV |
| `src/lib/prisma/audit.ts` (NEW o extender) | Query paginada cursor-based |
| `src/__tests__/middleware.test.ts` (NEW) | Tests de bot/geo/nonce |
| `src/__tests__/api/ops-auditoria.test.ts` (NEW) | Tests de página + export |

## Validación end-to-end

1. Local: `npm run dev` → inspector de red muestra CSP con nonce distinto en cada recarga.
2. Preview Vercel: curl a `/api/contact` con UA sospechoso → 403.
3. Producción post-deploy: ejecutar [Mozilla Observatory](https://observatory.mozilla.org) y verificar grade **A+**.
4. Prueba de regresión Stripe: `/tienda` → checkout → confirmar que `js.stripe.com` carga (no romper pagos al endurecer CSP).

## Riesgos y mitigaciones

- **Romper scripts inline de terceros** (p.ej. widget de Intercom si se añadiera): mitigar con whitelist explícita de dominios en CSP y tests E2E de la home.
- **Falsos positivos en bot detection**: log antes de bloquear durante 48h en preview → revisar patrones → activar bloqueo en prod.
- **Geo-blocking con RGPD**: mantener lista vacía por defecto; activar sólo por petición comercial documentada.

## Cierre

Al terminar:
- Actualizar [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md) — CSP/Middleware/Audit log pasan a ✅.
- Anotar `project_f1_security_closed.md` en memoria con commit de cierre.
- Revisar [guias/guia-seguridad.md](guias/guia-seguridad.md) para reflejar el patrón nonce como convención obligatoria.
