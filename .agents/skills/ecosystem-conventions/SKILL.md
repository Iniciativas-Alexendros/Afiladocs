---
name: ecosystem-conventions
description: >
  Convenciones del ecosistema Alexendros y guia de desarrollo especifica para
  Afiladocs (plataforma B2C de documentos legales). Activar al trabajar en
  este repo para conocer stack, comandos, reglas y anti-patrones.
---

# Repo Profile

- Tipo: web-nextjs (B2C legal documents platform)
- Stack: Next.js 15.3, React 19, TypeScript 5.8 strict, Tailwind v4, shadcn/ui, Prisma 7, Supabase, Stripe SDK 21, DocuSeal, Resend, n8n, Zod, Vitest, Playwright
- Deploy: Vercel (region cdg1 Paris)
- Dominio: afiladocs.com
- Gestor: npm (no pnpm en este repo)
- BD: Supabase PostgreSQL self-hosted (supabase.afiladocs.com)

## Comandos esenciales

```bash
npm run dev                    # Turbopack dev server :3000
npm run build                  # Build de produccion
npm run typecheck              # tsc --noEmit (0 errores)
npm run lint                   # ESLint 9 flat config (0 errores)
npm run test                   # Vitest
npm run test:coverage          # Vitest + coverage v8 (>= 70%)
npm run test:e2e               # Playwright Chromium
npm run ci:local               # Gate pre-push completo
npx prisma migrate dev         # Aplicar migraciones en dev
npx prisma generate            # Regenerar cliente tras schema changes
```

## Pre-PR Checklist

1. `npm run typecheck` (0 errores)
2. `npm run lint` (0 errores, 0 warnings nuevos)
3. `npm run test:coverage` (>= 70% en modulos criticos)
4. `npm run build` (compila sin errores)
5. O mejor: `npm run ci:local` (ejecuta todo lo anterior en secuencia)

## Reglas de codigo

- TypeScript strict: prohibido `any`, `@ts-ignore` sin justificacion + issue
- Server Components por defecto; `"use client"` solo para interactividad browser
- Variables de entorno centralizadas en `src/lib/env.ts` (lazy getters)
- SDKs de terceros (Stripe, Resend, DocuSeal, Verifactu) instanciados lazy dentro de funciones, nunca a nivel de modulo
- Validar `rgpd_accepted === true` server-side antes de procesar datos personales
- Usar `next/image` para imagenes (regla ESLint activa)
- Componentes shadcn/ui en `components/ui/` con helper `cn()` en `lib/utils.ts`
- Zod para validacion en API routes y Server Actions

## Arquitectura clave

- `src/app/(marketing)/`: Paginas publicas (home, tienda, servicios)
- `src/app/portal/`: Area cliente autenticada
- `src/app/ops/`: Backoffice operaciones (admin, ops roles)
- `src/app/api/webhooks/`: Stripe, DocuSeal, n8n-alerts
- `src/app/api/cron/`: 5 cron jobs Vercel (cleanup, subscriptions, intake, SLA, daily report)
- `src/lib/signing/`: DocuSeal adapter (eIDAS AES)
- `src/lib/verifactu/`: EasyVerifactu (RD 1007/2023 compliance)
- `src/lib/orders/dispatch.ts`: Router por delivery_mode (fill_and_sign, fill_only, download_after_payment, human_review)

## Auth y roles

- Supabase Auth + middleware de sesion
- `requireAuth()` redirige a /login si no hay sesion
- `requireRole(['admin','ops'])` redirige a /portal si rol no coincide
- Roles: client (default), ops, admin
- Tabla `profiles` extiende `auth.users`

## Base de datos

- Prisma 7 + `@prisma/adapter-pg` (JS engine, serverless-safe)
- `DATABASE_URL` -> Supavisor pooler puerto 6543 (queries)
- `DIRECT_URL` -> puerto 5432 (migraciones)
- Modelos: profiles, orders, documents, audit_log, subscriptions, monitor_alerts, products, product_packs

## Secrets

- Stripe: `STRIPE_SECRET_KEY`, `STRIPE_WEBHOOK_SECRET`
- Supabase: `NEXT_PUBLIC_SUPABASE_URL`, `SUPABASE_SERVICE_ROLE_KEY`, `DIRECT_URL`
- DocuSeal: `DOCUSEAL_API_URL`, `DOCUSEAL_API_KEY`, `DOCUSEAL_WEBHOOK_SECRET`
- Verifactu: `EASYVERIFACTU_API_URL`, `EASYVERIFACTU_API_KEY`
- Resend: `RESEND_API_KEY`
- Cron: `CRON_SECRET`
- Ubicacion: `/run/repo_secrets/Afiladocs/.env.secrets` (NO imprimir)

## Anti-patrones

- NUNCA exponer secrets al cliente (solo server-side)
- NUNCA usar `NEXT_PUBLIC_*` para claves privadas
- NUNCA eliminar validacion Zod de API routes ni Server Actions
- NUNCA modificar `.env.local`
- NO usar `<img>` directo (usar `next/image`)
- NO comitear .env*, tokens, API keys
- NO instanciar SDKs a nivel de modulo (usar lazy dentro de funciones)
