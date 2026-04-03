# CLAUDE.md — Afiladocs Project Context

## Identidad del proyecto
Plataforma de servicios legales digitales B2C (Valencia, España).
Stack: Next.js 15.3 + React 19 + TypeScript 5.8 (strict) + Tailwind v4 + shadcn/ui
       + Stripe SDK 21 (API `2026-03-25.dahlia`) + Prisma 7 + Supabase + Resend
       + Framer Motion + react-hook-form + Zod + Sonner + Lucide React + n8n webhooks.
Deploy: **Vercel** (región `mad1`). CI/CD: GitLab CI SLSA Level 3 (.gitlab-ci.yml).
Dominio: pendiente de adquirir. URL actual: subdominio `.vercel.app`.

## Reglas absolutas
- NUNCA expongas `STRIPE_SECRET_KEY` ni `STRIPE_WEBHOOK_SECRET` al cliente. Solo server-side.
- NUNCA expongas claves privadas en variables `NEXT_PUBLIC_*`.
- NUNCA elimines validación Zod de API routes.
- NUNCA uses `any` en TypeScript. Strict mode activo. Prohibido `@ts-ignore` sin justificación.
- SIEMPRE valida `rgpd_accepted === true` server-side antes de procesar datos personales.
- SIEMPRE usa `next/image` para imágenes (no `<img>` directo).
- NUNCA modifiques `.env.local` — solo lee las variables que ya existen.
- SIEMPRE ejecuta `npm run typecheck && npm run lint && npm run build` antes de declarar una tarea completa.
- Los componentes client-side llevan `"use client"` explícito en primera línea.
- Los componentes server-side NO llevan directiva (RSC por defecto en App Router).
- Las variables de entorno se centralizan en `src/lib/env.ts` con lazy getters (evita errores en build time).
- El SDK de Stripe y Resend se instancian de forma lazy (nunca al nivel de módulo).

## Repositorios remotos — sincronización obligatoria

Al finalizar cada tarea que genere commits, SIEMPRE sincronizar con ambos remotos en este orden:

```bash
git push official main   # GitLab  — https://gitlab.com/Alexendros/afiladocs
git push github main     # GitHub  — https://github.com/alexendros/afiladocs
```

Remotos configurados:

- `official` → GitLab (CI/CD principal, SLSA pipeline)
- `github`   → GitHub (mirror público, GitHub Apps access)

Si algún push falla, reportarlo explícitamente antes de cerrar la tarea. Nunca asumir que el mirror está sincronizado sin confirmar el éxito de ambos pushes.

## Comandos del proyecto
- `npm run dev` — Turbopack dev server en :3000
- `npm run build` — Build de producción (sin `output: standalone` — Vercel lo gestiona)
- `npm run typecheck` — tsc --noEmit (0 errores requeridos)
- `npm run lint` — ESLint 9 flat config (0 errores requeridos)
- `npx prisma generate` — Regenerar cliente Prisma tras cambios en schema
- `npx prisma migrate dev` — Aplicar migraciones en desarrollo

## Arquitectura de directorios
```
src/
├── app/
│   ├── (auth)/           — Login, registro, recuperar password
│   ├── (marketing)/      — Páginas públicas: home, tienda, servicios, blog, contacto, legal
│   ├── api/
│   │   ├── checkout/     — POST: crea Stripe Checkout session
│   │   ├── contact/      — POST: relay a n8n webhook
│   │   └── webhooks/
│   │       ├── stripe/   — POST: verifica firma + envía email de confirmación (Resend)
│   │       └── documenso/— POST: webhooks de firma electrónica (Documenso)
│   ├── ops/              — Panel de operaciones (roles: admin, ops)
│   │   └── pedido/[id]/  — Gestión de pedido individual + subida de documentos
│   ├── portal/           — Portal cliente autenticado
│   │   └── pedido/[id]/  — Detalle de pedido + intake form + descarga de documentos
│   ├── sitemap.ts        — Sitemap dinámico (noindex en .vercel.app, index cuando hay dominio)
│   ├── robots.ts         — Disallow: / en .vercel.app; Allow: / con dominio propio
│   └── layout.tsx        — Root layout: DM Sans (next/font), metadata dinámica, noindex temporal
├── components/
│   ├── ui/               — shadcn/ui primitives (NO modificar directamente)
│   ├── CookieBanner.tsx  — GDPR/LOPDGDD: dos botones igual prominencia, key 'afiladocs-cookie-consent'
│   ├── JsonLd.tsx        — Schema.org LegalService (server component)
│   ├── Header.tsx        — Nav principal + carrito
│   ├── ShoppingCart.tsx  — Cart drawer
│   └── ...               — BlogCard, ServiceCard, ContactForm, Footer, etc.
├── hooks/
│   ├── useCart.tsx       — CartProvider + useCart context
│   ├── useContactForm.tsx— Validación de formulario de contacto
│   └── use-mobile.tsx    — Media query hook
├── lib/
│   ├── env.ts            — Centralización de env vars: serverEnv (lazy getters) + publicEnv
│   ├── auth.ts           — requireAuth(), requireRole(['admin','ops']), getUser()
│   ├── prisma/client.ts  — PrismaClient con @prisma/adapter-pg (serverless-safe)
│   ├── supabase/         — server.ts, client.ts, middleware.ts, service.ts
│   ├── stripe/client.ts  — stripe singleton + PRODUCT_PRICE_MAP + EIDAS_LEVEL_MAP
│   ├── stripe/actions.ts — createCheckoutSession() server action
│   ├── email/send.ts     — sendEmail() via Resend (lazy instantiation)
│   ├── rate-limit.ts     — Upstash Redis rate limiting (fallback null en dev sin Redis)
│   ├── verifactu/        — Integración EasyVerifactu (facturación)
│   └── utils.ts          — cn() helper (clsx + tailwind-merge)
├── emails/
│   └── PaymentConfirmation.tsx — React Email template (Resend)
└── types/
    └── database.types.ts — Tipos Supabase (regenerar con Supabase CLI)
```

## Arquitectura de autenticación y roles
- **Auth**: Supabase Auth + middleware de sesión (`src/lib/supabase/middleware.ts`)
- **requireAuth()**: redirige a `/login` si no hay sesión
- **requireRole(['admin','ops'])**: redirige a `/portal` si el rol no coincide
- **Tabla `profiles`**: extiende `auth.users` — campos: `full_name`, `company_name`, `nif`, `phone`, `role`
- **Roles**: `client` (default), `ops`, `admin`

## Base de datos (Prisma + Supabase PostgreSQL)
- **Prisma 7** con `@prisma/adapter-pg` (engine "client" JS puro, sin binario nativo)
- Supabase Supavisor pooler: `DATABASE_URL` con puerto 6543 para queries
- `DIRECT_URL` (puerto 5432) para migraciones `prisma migrate`
- **Modelos principales**: `profiles`, `orders`, `documents`, `audit_log`, `subscriptions`, `monitor_alerts`
- Regenerar cliente tras cambios en schema: `npx prisma generate`

## Flujo de pago (Stripe)
1. Cliente añade producto → `useCart` → POST `/api/checkout` → `stripe.checkout.sessions.create`
2. Stripe redirige a `success_url` → `/pago-exitoso`
3. Stripe envía webhook → POST `/api/webhooks/stripe` → `constructEventAsync` (firma verificada)
4. `checkout.session.completed` → `sendEmail` (Resend) con `PaymentConfirmation`
- Rate limiting: Upstash Redis (10 req/min por IP en checkout, 5 req/10min en contact)
- Sin Upstash configurado: sin rate limiting (fallback graceful para desarrollo)

## Variables de entorno clave
| Variable | Scope | Descripción |
|---|---|---|
| `STRIPE_SECRET_KEY` | Server only | Clave secreta Stripe (no NEXT_PUBLIC_) |
| `STRIPE_WEBHOOK_SECRET` | Server only | `whsec_...` del webhook endpoint |
| `NEXT_PUBLIC_SUPABASE_URL` | Client+Server | URL del proyecto Supabase |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Client+Server | Clave anónima Supabase |
| `DATABASE_URL` | Server only | Supabase pooler (puerto 6543) |
| `RESEND_API_KEY` | Server only | Clave API Resend para emails |
| `UPSTASH_REDIS_REST_URL` | Server only | URL Upstash Redis (opcional, rate limiting) |
| `UPSTASH_REDIS_REST_TOKEN` | Server only | Token Upstash Redis (opcional) |
| `NEXT_PUBLIC_SITE_URL` | Build+Client | Dominio propio (NO definir hasta tener dominio) |
| `N8N_CONTACT_WEBHOOK_URL` | Server only | Webhook n8n para formulario de contacto (opcional) |

**Cuando no hay `NEXT_PUBLIC_SITE_URL`**: `publicEnv.siteUrl` resuelve desde `VERCEL_URL` (subdominio .vercel.app). `robots.ts` pone `Disallow: /` y `metadata.robots` pone `noindex`. Al adquirir el dominio: añadir `NEXT_PUBLIC_SITE_URL=https://afiladocs.com` en Vercel Dashboard y hacer redeploy.

## Patrones establecidos
- **Env vars**: importar `serverEnv` / `publicEnv` desde `@/lib/env` (nunca `process.env` directo en handlers)
- **Lazy init**: SDKs de terceros (Stripe, Resend) se instancian dentro de funciones, no al nivel de módulo
- **Context**: `CartProvider` en `(marketing)/layout.tsx`
- **Validación**: siempre Zod en API routes. Nunca validación manual ad-hoc
- **Toast**: sonner `toast.success()` / `toast.error()`
- **Estilos**: Tailwind utility classes + CSS variables del tema (globals.css)
- **Importaciones**: path alias `@/` para `src/`
- **Rutas del portal**: `/portal/pedido/[id]`, `/portal/pedidos` (no `/pedido/[id]` sin prefijo)
- **Rutas de ops**: `/ops/pedido/[id]`, `/ops/pedidos`
- **Structured logging**: `console.log(JSON.stringify({event, ...data, ts}))` en API routes y webhooks

## Restricciones de seguridad
- CSP headers en `next.config.ts` — incluye `*.supabase.co`, `js.stripe.com`, `fonts.gstatic.com`
- Rate limiting via `src/lib/rate-limit.ts` con Upstash Redis (fallback graceful sin Redis)
- Stripe webhooks: SIEMPRE `stripe.webhooks.constructEventAsync()` (async, serverless-safe)
- `STRIPE_SECRET_KEY` solo referenciable desde `serverEnv.stripeSecretKey` (server-side)
- Cookie consent: `'afiladocs-cookie-consent'` en localStorage (no cookie)
- `output: 'standalone'` ELIMINADO — incompatible con Vercel

## Deploy Vercel
- `vercel.json` en raíz: región `mad1`, `maxDuration` por función
- Pipeline GitLab: stage `deploy_vercel` (manual, en `main`)
- Variables CI necesarias: `VERCEL_TOKEN`, `VERCEL_ORG_ID`, `VERCEL_PROJECT_ID`, `VERCEL_DEPLOY_URL`
- Prisma en Vercel: `postinstall: "prisma generate"` en package.json (ya configurado)
