# Routes Map — Afiladocs

**Última revisión:** 2026-04-14
**Framework:** Next.js 15.3 App Router (React Server Components por defecto)
**Route groups:** `(marketing)`, `(auth)` — paréntesis no afectan URL.

## Tabla de contenidos

- [(marketing) — rutas públicas](#marketing--rutas-públicas)
- [(auth) — autenticación](#auth--autenticación)
- [/portal/\* — cliente autenticado](#portal--cliente-autenticado)
- [/ops/\* — role admin/ops](#ops--role-adminops)
- [/api/\* — backend](#api--backend)
- [Rutas especiales](#rutas-especiales)
- [Middleware y gates](#middleware-y-gates)

## (marketing) — rutas públicas

Sin auth. Servidas vía RSC + `CartProvider` en [src/app/(marketing)/layout.tsx](../src/app/(marketing)/layout.tsx).

| Ruta | Archivo | Propósito |
|------|---------|-----------|
| `/` | [page.tsx](../src/app/(marketing)/page.tsx) | Home: hero, servicios, testimonios |
| `/tienda` | [tienda/page.tsx](../src/app/(marketing)/tienda/page.tsx) | Catálogo por categorías |
| `/tienda/[categoria]` | [tienda/[categoria]/page.tsx](../src/app/(marketing)/tienda/[categoria]/page.tsx) | Productos de una categoría |
| `/producto/[slug]` | [producto/[slug]/page.tsx](../src/app/(marketing)/producto/[slug]/page.tsx) | Detalle de producto |
| `/servicios` | [servicios/page.tsx](../src/app/(marketing)/servicios/page.tsx) | Servicios legales |
| `/blog` | [blog/page.tsx](../src/app/(marketing)/blog/page.tsx) | Listado artículos |
| `/blog/[slug]` | [blog/[slug]/page.tsx](../src/app/(marketing)/blog/[slug]/page.tsx) | Artículo individual |
| `/contacto` | [contacto/page.tsx](../src/app/(marketing)/contacto/page.tsx) | Formulario contacto (n8n) |
| `/sobre-mi` | [sobre-mi/page.tsx](../src/app/(marketing)/sobre-mi/page.tsx) | Sobre el abogado |
| `/informes-juridicos` | [informes-juridicos/page.tsx](../src/app/(marketing)/informes-juridicos/page.tsx) | Landing informes |
| `/legaltech-ia` | [legaltech-ia/page.tsx](../src/app/(marketing)/legaltech-ia/page.tsx) | Landing legaltech & IA |
| `/revisiones` | [revisiones/page.tsx](../src/app/(marketing)/revisiones/page.tsx) | Revisiones de documentos |
| `/suscripciones` | [suscripciones/page.tsx](../src/app/(marketing)/suscripciones/page.tsx) | Planes de suscripción |
| `/pago-exitoso` | [pago-exitoso/page.tsx](../src/app/(marketing)/pago-exitoso/page.tsx) | Confirmación post-Stripe |
| `/legal/aviso-legal` | [legal/aviso-legal/page.tsx](../src/app/(marketing)/legal/aviso-legal/page.tsx) | LOPDGDD/LSSI |
| `/legal/privacidad` | [legal/privacidad/page.tsx](../src/app/(marketing)/legal/privacidad/page.tsx) | Política de privacidad |
| `/legal/cookies` | [legal/cookies/page.tsx](../src/app/(marketing)/legal/cookies/page.tsx) | Política de cookies |
| `/legal/condiciones-generales` | [legal/condiciones-generales/page.tsx](../src/app/(marketing)/legal/condiciones-generales/page.tsx) | Términos y condiciones |

## (auth) — autenticación

Sin sesión; redirigen a `/portal` si ya hay una.

| Ruta | Archivo | Propósito |
|------|---------|-----------|
| `/login` | [login/page.tsx](../src/app/(auth)/login/page.tsx) | Email + contraseña (Supabase Auth) |
| `/registro` | [registro/page.tsx](../src/app/(auth)/registro/page.tsx) | Alta usuario |
| `/recuperar-password` | [recuperar-password/page.tsx](../src/app/(auth)/recuperar-password/page.tsx) | Solicitud reset |
| `/recuperar-password/confirmar` | [recuperar-password/confirmar/page.tsx](../src/app/(auth)/recuperar-password/confirmar/page.tsx) | Confirmación y nueva contraseña |

## /portal/\* — cliente autenticado

Gate: `requireAuth()` en cada `page.tsx`. Detalle de journey en [PORTAL_CLIENTE.md](PORTAL_CLIENTE.md).

| Ruta | Archivo | Propósito |
|------|---------|-----------|
| `/portal` | [portal/page.tsx](../src/app/portal/page.tsx) | Dashboard con KPIs + pedidos recientes |
| `/portal/pedidos` | [portal/pedidos/page.tsx](../src/app/portal/pedidos/page.tsx) | Listado histórico |
| `/portal/pedido/[id]` | [portal/pedido/[id]/page.tsx](../src/app/portal/pedido/[id]/page.tsx) | Detalle + descarga documentos |
| `/portal/pedido/[id]/intake` | [portal/pedido/[id]/intake/page.tsx](../src/app/portal/pedido/[id]/intake/page.tsx) | Formulario datos legales |
| `/portal/suscripciones` | [portal/suscripciones/page.tsx](../src/app/portal/suscripciones/page.tsx) | Gestión + Stripe Billing Portal |
| `/portal/configuracion` | [portal/configuracion/page.tsx](../src/app/portal/configuracion/page.tsx) | Perfil (profiles table) |

## /ops/\* — role admin/ops

Gate: `requireRole(['admin','ops'])` en [ops/layout.tsx](../src/app/ops/layout.tsx). Detalle operativo en [BACKOFFICE_OPS.md](BACKOFFICE_OPS.md).

| Ruta | Archivo | Propósito |
|------|---------|-----------|
| `/ops` | [ops/page.tsx](../src/app/ops/page.tsx) | Dashboard KPIs (processing, intake_pending, subscripciones) |
| `/ops/pedidos` | [ops/pedidos/page.tsx](../src/app/ops/pedidos/page.tsx) | Listado todos los pedidos |
| `/ops/pedido/[id]` | [ops/pedido/[id]/page.tsx](../src/app/ops/pedido/[id]/page.tsx) | Intake + upload PDF + cambio estado |
| `/ops/productos` | [ops/productos/page.tsx](../src/app/ops/productos/page.tsx) | Catálogo completo |
| `/ops/productos/nuevo` | [ops/productos/nuevo/page.tsx](../src/app/ops/productos/nuevo/page.tsx) | Crear producto |
| `/ops/productos/[sku]` | [ops/productos/[sku]/page.tsx](../src/app/ops/productos/[sku]/page.tsx) | Editar producto |
| `/ops/alertas` | [ops/alertas/page.tsx](../src/app/ops/alertas/page.tsx) | Alertas normativas n8n |
| `/ops/alertas/[id]` | [ops/alertas/[id]/page.tsx](../src/app/ops/alertas/[id]/page.tsx) | Detalle + marcar revisada |

> Próxima entrega operativa: `/ops/auditoria` (UI sobre `audit_log` con filtros y export CSV) — diseñada en la rama F1 pero aún no desplegada en `main`. Mientras tanto, consultar `audit_log` directamente en Supabase.

## /api/\* — backend

### User-facing

| Ruta | HTTP | Archivo | Propósito |
|------|------|---------|-----------|
| `/api/health` | GET | [health/route.ts](../src/app/api/health/route.ts) | Health check (status + ts) |
| `/api/contact` | POST | [contact/route.ts](../src/app/api/contact/route.ts) | Relay n8n + Zod + rate limit |
| `/api/checkout` | POST | [checkout/route.ts](../src/app/api/checkout/route.ts) | Crea Stripe Checkout Session |

### Webhooks (HMAC SHA-256)

| Ruta | HTTP | Archivo | Origen |
|------|------|---------|--------|
| `/api/webhooks/stripe` | POST | [webhooks/stripe/route.ts](../src/app/api/webhooks/stripe/route.ts) | `checkout.session.completed`, `invoice.paid`, etc. |
| `/api/webhooks/docuseal` | POST | [webhooks/docuseal/route.ts](../src/app/api/webhooks/docuseal/route.ts) | Firma DocuSeal (activo) |
| `/api/webhooks/documenso` | POST | [webhooks/documenso/route.ts](../src/app/api/webhooks/documenso/route.ts) | Firma Documenso (legacy) |
| `/api/webhooks/n8n-alerts` | POST | [webhooks/n8n-alerts/route.ts](../src/app/api/webhooks/n8n-alerts/route.ts) | Alertas normativas (Bearer token) |

### Cron (Vercel Cron → GET)

| Ruta | Schedule | Detalle |
|------|----------|---------|
| `/api/cron/cleanup-expired-sessions` | `0 3 * * *` | Ver [CRON_JOBS.md](CRON_JOBS.md#1-cleanup-expired-sessions) |
| `/api/cron/subscription-reminders` | `0 9 * * 1` | Ver [CRON_JOBS.md](CRON_JOBS.md#2-subscription-reminders) |
| `/api/cron/intake-reminders` | `0 10 * * *` | Ver [CRON_JOBS.md](CRON_JOBS.md#3-intake-reminders) |
| `/api/cron/sla-monitor` | `0 8 * * 1-5` | Ver [CRON_JOBS.md](CRON_JOBS.md#4-sla-monitor) |
| `/api/cron/daily-report` | `0 7 * * 1-5` | Ver [CRON_JOBS.md](CRON_JOBS.md#5-daily-report) |

## Rutas especiales

| Archivo | Propósito |
|---------|-----------|
| [src/app/sitemap.ts](../src/app/sitemap.ts) | `sitemap.xml` dinámico (noindex en `.vercel.app`, index en afiladocs.com) |
| [src/app/robots.ts](../src/app/robots.ts) | `robots.txt` — `Disallow: /` fuera de dominio propio |
| [src/app/global-error.tsx](../src/app/global-error.tsx) | Error boundary global + Sentry capture |
| [src/app/layout.tsx](../src/app/layout.tsx) | Root layout: DM Sans, metadata, CSP nonce inyectado |

## Middleware y gates

- **Middleware raíz:** [middleware.ts](../middleware.ts) — refresca sesión Supabase, inyecta `x-nonce` + CSP por request, bot allowlist (Googlebot/Bingbot/etc.), geo-blocking opcional vía `GEO_BLOCKED_COUNTRIES`, detección path traversal.
- **`requireAuth()`** — [src/lib/auth.ts](../src/lib/auth.ts): redirige a `/login` si no hay sesión.
- **`requireRole(['admin','ops'])`** — [src/lib/auth.ts](../src/lib/auth.ts): redirige a `/portal` si el rol de `profiles.role` no coincide.
- **`getUser()`** — devuelve `user | null` sin redirect (uso en server components no protegidos que personalizan contenido si hay sesión).

## Variables de entorno relacionadas

Dominio y URLs documentadas en [CLAUDE.md](../CLAUDE.md) § "Variables de entorno clave". Especialmente:

- `NEXT_PUBLIC_SITE_URL=https://afiladocs.com` (prod). En preview queda vacío → `noindex` automático vía `sitemap.ts` / `robots.ts`.
- `N8N_CONTACT_WEBHOOK_URL` — destino de `/api/contact`.
- `N8N_ALERTS_WEBHOOK_SECRET` — token compartido con `/api/webhooks/n8n-alerts`.
