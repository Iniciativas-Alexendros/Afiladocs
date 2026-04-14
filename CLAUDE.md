# CLAUDE.md — Afiladocs Project Context

## Identidad del proyecto

Plataforma de servicios legales digitales B2C (Valencia, España).
Stack: Next.js 15.3 + React 19 + TypeScript 5.8 (strict) + Tailwind v4 + shadcn/ui
       + Stripe SDK 21 (API `2026-03-25.dahlia`) + Prisma 7 + Supabase + Resend
       + Framer Motion + react-hook-form + Zod + Sonner + Lucide React + n8n webhooks.
Deploy: **Vercel** (región `mad1`). CI/CD: GitHub Actions (pendiente de configurar en `.github/workflows/`).
Dominio: **afiladocs.com** (activo). `NEXT_PUBLIC_SITE_URL=https://afiladocs.com` en Vercel.

## Referencia al hub central (SIMBIOSIS)

> **Contexto global**: antes de operar, consulta `~/.claude/PROYECTOS.md` para
> conocer el estado, prioridad y urgencia del resto de apps de Alexendros.
> Este indice se actualiza via la cadena: `mem-sintetizar → dev-arquitectura →
> prod-actualizar-stakeholders → mem-actualizar` (nodo N13 de `omni-maestria`).
>
> **Alertas cruzadas**: `~/.claude/projects/-var-home-soyalexendros/memory/cross-app-alerts.md`
> — consulta obligatoria antes de deploys, rotaciones de secretos u operaciones destructivas.
>
> **🔴 Alerta activa para esta app**: 3 secretos LIVE (Stripe, GitHub PAT, Sentry) estaban
> expuestos en `.claude/settings.local.json` antes de la homogeneizacion del 2026-04-10.
> Archivo limpiado y `.gitignore` blindado. Rotacion de los tokens es responsabilidad del
> usuario — detalles en `cross-app-alerts.md`.
>
> **Registro dinamico**: `~/.claude/projects/-var-home-soyalexendros/memory/apps-registry.md`
> — estado por app (commits, CI, PRs, alertas).
>
> **Protocolo herencia GSD**: si detectas `.planning/`, `gsd-*`, `ROADMAP.md` o
> directivas `<!-- GSD:* -->`, sigue `~/.claude/Deportacion_GSD.md`.
> **NO invoques skills `gsd-*`** (estan descatalogados). Cadena equivalente:
> `prod-brainstorming → prod-especificacion → app-maestria → dev-revision`.

## Reglas absolutas

- NUNCA expongas `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`, `DOCUSEAL_*`, `RESEND_API_KEY` ni `CRON_SECRET` al cliente. Solo server-side.
- NUNCA uses variables `NEXT_PUBLIC_*` para claves privadas.
- NUNCA elimines validación Zod de API routes ni Server Actions.
- NUNCA uses `any` en TypeScript. Strict mode activo. Prohibido `@ts-ignore` sin justificación + enlace a issue.
- SIEMPRE valida `rgpd_accepted === true` server-side antes de procesar datos personales.
- SIEMPRE usa `next/image` para imágenes (regla ESLint activa, no `<img>` directo).
- NUNCA modifiques `.env.local` — solo lee las variables que ya existen.
- SIEMPRE ejecuta **`npm run typecheck && npm run lint && npm run test:coverage && npm run build`** antes de declarar una tarea completa.
- Componentes client-side llevan `"use client"` explícito en primera línea; server components (RSC por defecto) NO llevan directiva.
- Las variables de entorno se centralizan en [`src/lib/env.ts`](src/lib/env.ts) con lazy getters (evita errores en build time).
- SDKs de terceros (Stripe, Resend, DocuSeal, Verifactu) se instancian **lazy** dentro de funciones, nunca a nivel de módulo.
- **Documenso es legacy mantenido** (webhook + adapter conservados por compatibilidad). DocuSeal es el firmante activo. No introducir nuevo código que dependa de Documenso.

## Repositorio remoto

Remoto único: `github` → GitHub via SSH — `git@github.com:alexendros/afiladocs.git`

Al finalizar cada tarea que genere commits en `main`:

```bash
git push github main
```

GitLab fue descatalogado el 2026-04-14. Las referencias a `official`/GitLab en historial previo son legacy. Si el push falla, reportarlo antes de cerrar la tarea.

## Comandos del proyecto

- `npm run dev` — Turbopack dev server en :3000
- `npm run build` — Build de producción (sin `output: standalone` — Vercel lo gestiona)
- `npm run typecheck` — `tsc --noEmit` (0 errores requeridos)
- `npm run lint` — ESLint 9 flat config (0 errores, 0 warnings nuevos)
- `npm run test` · `npm run test:coverage` — Vitest (`happy-dom`, coverage v8, umbral ≥ 70% en módulos críticos)
- `npm run test:e2e` — Playwright (Chromium)
- `npx prisma generate` — Regenerar cliente Prisma tras cambios en schema
- `npx prisma migrate dev` — Aplicar migraciones en desarrollo

## Documentación operativa

> **Índice único**: [docs/README.md](docs/README.md) reúne los docs operativos (UI_GUIDE, ROUTES_MAP, CRON_JOBS, PORTAL_CLIENTE, BACKOFFICE_OPS), los runbooks de incidentes (rollback, rotación de secretos, recovery DocuSeal, webhook Stripe, RLS) y el roadmap F1–F6. Es el primer sitio al que acudir antes de tocar código. Cualquier cambio de rutas, crons, componentes base o flujos de cliente/ops actualiza el doc correspondiente en el mismo PR.

## Arquitectura de directorios

```text
src/
├── app/
│   ├── (auth)/           — Login, registro, recuperar password
│   ├── (marketing)/      — Páginas públicas: home, tienda, servicios, revisiones, suscripciones, contacto, legal
│   ├── api/
│   │   ├── checkout/     — POST: crea Stripe Checkout session (Zod + rate-limit)
│   │   ├── contact/      — POST: relay formulario a n8n (Bearer)
│   │   ├── health/       — GET: healthcheck simple
│   │   ├── cron/
│   │   │   ├── cleanup-expired-sessions/ — GET: soft-delete pedidos abandonados (>90d)
│   │   │   ├── subscription-reminders/   — GET: emails renovación suscripciones >25d
│   │   │   ├── intake-reminders/         — GET: recordatorios de intake pendiente
│   │   │   ├── sla-monitor/              — GET: vigila SLA intake→firma (alerta ops si excede)
│   │   │   └── daily-report/             — GET: email diario de KPIs a ops (L-V)
│   │   └── webhooks/
│   │       ├── stripe/    — POST: constructEventAsync + Verifactu + email confirmación
│   │       ├── docuseal/  — POST: HMAC-SHA256, descarga PDF firmado → Storage, revalidateTag
│   │       └── n8n-alerts/— POST: ingesta de alertas normativas desde n8n (Bearer)
│   ├── ops/              — Panel operaciones (roles: admin, ops)
│   │   ├── pedidos/      — Listado + filtros
│   │   ├── pedido/[id]/  — Gestión de pedido + subida PDF + envío firma
│   │   ├── alertas/      — Alertas normativas (monitor_alerts)
│   │   ├── auditoria/    — Audit log UI (F1)
│   │   └── page.tsx      — Dashboard KPIs
│   ├── portal/           — Portal cliente autenticado
│   │   ├── pedidos/      — Listado de pedidos
│   │   ├── pedido/[id]/  — Detalle + intake + descarga firmado
│   │   ├── suscripciones/
│   │   ├── cuenta/       — (F3) datos personales
│   │   └── facturas/     — (F3) Stripe Invoices
│   ├── sitemap.ts        — Sitemap dinámico (index activo con afiladocs.com; noindex en previews sin NEXT_PUBLIC_SITE_URL)
│   ├── robots.ts         — Allow en producción; Disallow en previews sin dominio propio
│   └── layout.tsx        — Root layout: DM Sans (next/font), metadata dinámica, providers globales
├── components/
│   ├── ui/               — shadcn/ui primitives (NO modificar directamente)
│   ├── marketing/        — secciones home/landings (HeroSection, SocialProof, ProcessSteps, FaqAccordion, ...)
│   ├── portal/           — componentes específicos portal cliente
│   ├── ops/              — componentes específicos backoffice
│   ├── JsonLd.tsx        — Schema.org (LegalService + F3 FAQPage/HowTo/Product/BreadcrumbList)
│   ├── Header.tsx, Footer.tsx, CookieBanner.tsx, ShoppingCart.tsx ...
├── hooks/                — useCart, useContactForm, use-mobile, ...
├── lib/
│   ├── env.ts            — serverEnv (lazy getters) + publicEnv
│   ├── auth.ts           — requireAuth(), requireRole(['admin','ops']), getUser()
│   ├── prisma/client.ts  — PrismaClient + @prisma/adapter-pg (serverless-safe)
│   ├── supabase/         — server.ts, client.ts, middleware.ts, service.ts
│   ├── stripe/           — client.ts (getProductPriceMap, EIDAS_LEVEL_MAP), actions.ts
│   ├── email/send.ts     — sendEmail() via Resend (lazy)
│   ├── rate-limit.ts     — Upstash Redis (fallback null en dev sin Redis)
│   ├── signing/          — DocuSealAdapter + getSigningAdapter()
│   ├── verifactu/        — EasyVerifactuAdapter
│   └── utils.ts          — cn() (clsx + tailwind-merge)
├── emails/               — 13 plantillas React Email (ver §Emails transaccionales)
└── types/                — tipos compartidos + database.types.ts (Supabase CLI)

prisma/                   — schema.prisma + migrations
supabase/                 — SQL manual (RLS, índices, Storage buckets)
docs/                     — n8n-workflows.md (+ docs operativos tras F2)
Informes para Claude Code/ — roadmap vivo (README + fases + guías)
.github/                  — pull_request_template.md, ISSUE_TEMPLATE/
```

## Autenticación y roles

- **Auth**: Supabase Auth + middleware de sesión ([`src/lib/supabase/middleware.ts`](src/lib/supabase/middleware.ts)).
- **`requireAuth()`** redirige a `/login` si no hay sesión.
- **`requireRole(['admin','ops'])`** redirige a `/portal` si el rol no coincide.
- Tabla `profiles` extiende `auth.users` — campos: `full_name`, `company_name`, `nif`, `phone`, `role`.
- Roles: `client` (default) · `ops` · `admin`.

## Base de datos (Prisma 7 + Supabase PostgreSQL)

- `@prisma/adapter-pg` (engine JS puro, serverless-safe, sin binario nativo).
- **`DATABASE_URL`** → Supavisor pooler puerto 6543 (queries runtime).
- **`DIRECT_URL`** → puerto 5432 (migraciones `prisma migrate`).
- Modelos principales: `profiles`, `orders`, `documents`, `audit_log`, `subscriptions`, `monitor_alerts`, `products`.
- Regenerar cliente tras cambios: `npx prisma generate` (también se ejecuta en `postinstall`).

## Flujo de pago (Stripe → Verifactu → DocuSeal)

1. Cliente añade producto → `useCart` → POST `/api/checkout` → `stripe.checkout.sessions.create`.
2. Stripe redirige a `success_url` → `/pago-exitoso`.
3. Webhook POST `/api/webhooks/stripe` → `constructEventAsync` (firma verificada).
4. `checkout.session.completed`:
   - `orders.status = 'processing'`
   - Trigger Verifactu → `EasyVerifactuAdapter.createInvoice()` → guarda `orders.invoice_id` / `invoice_pdf`.
   - `sendEmail(PaymentConfirmation)` via Resend.
5. Ops sube PDF a `/ops/pedido/[id]` → Supabase Storage → envía a DocuSeal.
6. Webhook POST `/api/webhooks/docuseal` (HMAC-SHA256, `timingSafeEqual`):
   - Descarga PDF firmado → Storage bucket `documents`.
   - Calcula `hash_sha256_signed`.
   - `sendEmail(DocumentReady)` con signed URL 1 h.
   - `revalidateTag('orders')`.
7. Cliente descarga desde `/portal/pedido/[id]`.

Flujo completo documentado en [`Informes para Claude Code/guias/guia-workflows.md §3`](Informes%20para%20Claude%20Code/guias/guia-workflows.md).

## Firma electrónica (DocuSeal — único proveedor)

- DocuSeal self-hosted. Adapter pattern en [`src/lib/signing/`](src/lib/signing/) — `getSigningAdapter()` devuelve `DocuSealAdapter`.
- Webhook `/api/webhooks/docuseal` verifica HMAC-SHA256 con `DOCUSEAL_WEBHOOK_SECRET` antes de parsear el body.
- Env vars en `serverEnv`: `docusealApiUrl`, `docusealApiKey`, `docusealWebhookSecret`.
- **Idempotencia**: `docuseal_event_id` como clave única en `audit_log`; reprocesar el mismo evento no duplica efectos.

## Cron jobs (Vercel Cron)

Declarados en [`vercel.json`](vercel.json) → `crons` + `functions` (con `maxDuration`). Autenticados con `Authorization: Bearer ${CRON_SECRET}` + rate-limit 5 req/min. Todos idempotentes.

| Path | Schedule (UTC) | Propósito | maxDuration |
|------|----------------|-----------|-------------|
| `/api/cron/cleanup-expired-sessions` | `0 3 * * *` | Soft-delete pedidos `intake_pending` > 90d | 60s |
| `/api/cron/subscription-reminders` | `0 9 * * 1` | Emails renovación suscripciones > 25d | 60s |
| `/api/cron/intake-reminders` | `0 10 * * *` | Recordatorio intake pendiente | 60s |
| `/api/cron/sla-monitor` | `0 8 * * 1-5` | Alerta ops si SLA intake→firma excede | 60s |
| `/api/cron/daily-report` | `0 7 * * 1-5` | Email diario de KPIs a ops | 60s |

Tests en `src/__tests__/api/cron-*.test.ts`. SLAs y runbook en `docs/CRON_JOBS.md` (F2).

## Emails transaccionales (13 plantillas React Email)

Directorio [`src/emails/`](src/emails/). Envío vía `sendEmail()` ([`src/lib/email/send.ts`](src/lib/email/send.ts), lazy):

`welcome` · `order-confirmation` (PaymentConfirmation) · `intake-required` · `signature-required` · `document-ready` · `document-completed` · `subscription-active` · `payment-failed` · `sla-alert` · `daily-ops-report` · `review-ready` · `template-download-ready`.

Al añadir una plantilla nueva: componente `.tsx` + test snapshot + test del handler que la dispara (`vi.mock('@/lib/email/send')`). Ver guía completa en [`Informes para Claude Code/guias/guia-workflows.md §8`](Informes%20para%20Claude%20Code/guias/guia-workflows.md).

## Integraciones n8n

- **Contact relay** (Afiladocs → n8n): POST `/api/contact` reenvía a `N8N_CONTACT_WEBHOOK_URL`.
- **Alerts ingest** (n8n → Afiladocs): POST `/api/webhooks/n8n-alerts` con `Authorization: Bearer ${N8N_ALERTS_WEBHOOK_SECRET}` → fila en `monitor_alerts` + email si `urgency='alta'` + `revalidateTag('alerts')`.
- Monitores programados en n8n (BOE/DOGV, AEPD, CGPJ) alimentan "Alerts ingest".
- Payloads y curl de prueba en [`docs/n8n-workflows.md`](docs/n8n-workflows.md).

## Variables de entorno clave

| Variable | Scope | Descripción |
|---|---|---|
| `STRIPE_SECRET_KEY` | Server | Clave secreta Stripe (no `NEXT_PUBLIC_`) |
| `STRIPE_WEBHOOK_SECRET` | Server | `whsec_...` del webhook endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` | Client+Server | URL proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client+Server | Clave anónima Supabase |
| `SUPABASE_SERVICE_ROLE_KEY` | Server | Operaciones privilegiadas (admin, Storage signed URLs) |
| `DATABASE_URL` | Server | Supavisor pooler (puerto 6543, queries runtime) |
| `DIRECT_URL` | Server | Puerto 5432, migraciones Prisma |
| `RESEND_API_KEY` | Server | Clave API Resend |
| `DOCUSEAL_API_URL` | Server | URL base DocuSeal self-hosted |
| `DOCUSEAL_API_KEY` | Server | API key DocuSeal |
| `DOCUSEAL_WEBHOOK_SECRET` | Server | HMAC secret para verificar webhooks DocuSeal |
| `EASY_VERIFACTU_API_URL` | Server | Endpoint EasyVerifactu |
| `EASY_VERIFACTU_API_KEY` | Server | API key EasyVerifactu |
| `UPSTASH_REDIS_REST_URL` | Server | URL Upstash (opcional; sin él, rate-limit pasa a null) |
| `UPSTASH_REDIS_REST_TOKEN` | Server | Token Upstash |
| `N8N_CONTACT_WEBHOOK_URL` | Server | Webhook n8n para contacto (opcional) |
| `N8N_ALERTS_WEBHOOK_SECRET` | Server | Bearer token compartido con n8n para alertas |
| `CRON_SECRET` | Server | Bearer token para cron jobs Vercel |
| `NEXT_PUBLIC_SITE_URL` | Build+Client | Dominio propio (`https://afiladocs.com`) |
| `OBSERVABILITY_SENTRY_AUTH_TOKEN` | Build | Sube source maps (integración Vercel+Sentry) |

**Dominio activo**: `NEXT_PUBLIC_SITE_URL=https://afiladocs.com` configurado en Vercel. SEO activo (`index: true`), sitemap apunta a afiladocs.com, redirect `www → non-www` habilitado. Previews sin `NEXT_PUBLIC_SITE_URL` mantienen `noindex` + `Disallow: /`.

## Patrones establecidos

- **Env vars**: importar `serverEnv` / `publicEnv` desde `@/lib/env` — nunca `process.env` directo en handlers.
- **Lazy init**: SDKs de terceros dentro de funciones, nunca a nivel de módulo.
- **Context**: `CartProvider` montado en `(marketing)/layout.tsx`.
- **Validación**: siempre Zod en API routes y Server Actions. Nunca validación manual ad-hoc.
- **Toast**: `sonner` → `toast.success()` / `toast.error()` (posición bottom-right, 5 s).
- **Estilos**: Tailwind utility classes + CSS variables en `globals.css`; `cn()` para composición condicional.
- **Imports**: alias `@/` → `src/`.
- **Rutas**: portal siempre bajo `/portal/*`, ops bajo `/ops/*`; nunca rutas sin prefijo para datos autenticados.
- **Structured logging**: `console.log(JSON.stringify({event, ...data, ts}))` en API routes, webhooks y crons. Campos estándar: `event` (kebab-case), `user_id?`, `request_id?`, `ts` ISO. Nunca loguear secretos ni PII completa.
- **Idempotencia webhooks**: usar `stripe_event_id` / `docuseal_event_id` como clave única en `audit_log`.

## Seguridad

- CSP en [`next.config.ts`](next.config.ts) — incluye `*.supabase.co`, `js.stripe.com`, `fonts.gstatic.com`. F1 migra `script-src` a nonce por request (elimina `unsafe-inline`).
- Rate limiting por endpoint en [`src/lib/rate-limit.ts`](src/lib/rate-limit.ts) — Upstash Redis (fallback graceful sin Redis).
  - `/api/checkout` → 10 req/min por IP
  - `/api/contact` → 5 req/10min
  - `/api/cron/*` → 5 req/min (además del Bearer)
- Stripe webhooks: SIEMPRE `stripe.webhooks.constructEventAsync()` (serverless-safe).
- Cookie consent: `afiladocs-cookie-consent` en localStorage (no cookie), dos botones con igual prominencia (RGPD/LOPDGDD).
- `output: 'standalone'` ELIMINADO — incompatible con Vercel.
- Guía completa: [`Informes para Claude Code/guias/guia-seguridad.md`](Informes%20para%20Claude%20Code/guias/guia-seguridad.md).

## Testing

- **Vitest** + `happy-dom` + coverage v8.
- **Playwright** (Chromium) con screenshots on failure.
- **Umbral obligatorio**: ≥ 70% statements en `src/lib/stripe/`, `src/lib/orders/`, `src/lib/verifactu/`, `src/lib/signing/`, `src/app/api/**/route.ts`.
- Para cada API route nueva: happy path + Zod rejection + rate-limit response mínimo.
- Para cada webhook: payload real + firma inválida → 400 + test de idempotencia (ejecutar 2 veces no duplica).

## Deploy Vercel

- [`vercel.json`](vercel.json): región `mad1`, `maxDuration` por función (checkout/webhooks 30 s, crons 60 s, contact 10 s, health 5 s).
- Deploy via Vercel Git integration (push a `main` → deploy automático). Ramas `main`, `staging`, `develop` con deploy activado.
- Crons **solo en producción** (comportamiento por defecto Vercel).
- Variables de integración: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`.
- Prisma en Vercel: `postinstall: "prisma generate"` en `package.json` (ya configurado).
- No cambiar `git.deploymentEnabled` sin coordinación + commit justificativo.

## Integraciones con otras apps de Alexendros

> ⚠️ Hipotesis preliminar — refinar con Alejandro (ver `~/.claude/projects/-var-home-soyalexendros/memory/feedback_relaciones_proyectos.md`).

- **n8n-automations** ✅ **confirmada** — afiladocs consume webhooks de n8n via `N8N_CONTACT_WEBHOOK_URL` (formulario de contacto) y `N8N_ALERTS_WEBHOOK_SECRET` (ingesta de alertas normativas en `/api/webhooks/n8n-alerts`).
- **techno-website** 🟡 **inferida** — ambas apps usan Stripe Checkout; comparten patron reutilizable (sin dependencia tecnica, solo oportunidad de extraer helper si surge una tercera app).
- **alexendros-monorepo** 🟡 **inferida** — misma familia de stack (Next.js 15 + Supabase + Stripe + Prisma). Candidato a consumir packages publicados del monorepo (`@repo/ui`, `@repo/stripe`) si se publican.
- **lexactu** 🟠 **especulativa** — ambas manejan documentos legales pero en dominios distintos (afiladocs = servicios legales B2C, lexactu = OCR judicial). Sin integracion tecnica actual.

## Skills recomendadas para esta app

`app-maestria` · `app-seguridad` · `app-despliegue` · `dev-revision` · `dev-depurar` · `app-entorno` · `app-migracion-bd` · `shadcn` · `infra-stripe` · `ux-pro-max` · `legal-cumplimiento`
