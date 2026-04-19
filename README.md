# Afiladocs

> Plataforma de servicios legales digitales B2C (Valencia, España) — tienda de plantillas legales rellenables vía DocuSeal + revisiones expertas humanas.

| | |
|---|---|
| **Estado** | Producción activa · go-live catálogo (P0b) en preparación |
| **Dominio** | <https://afiladocs.com> |
| **Deploy** | Vercel (región `cdg1` París — PoP más cercano a ES; Vercel no tiene Madrid) |
| **BD** | Supabase self-hosted en <https://supabase.afiladocs.com> |
| **Stack** | Next.js 15.3 · React 19 · TypeScript 5.8 strict · Tailwind v4 · shadcn/ui · Prisma 7 · Stripe SDK 21 · Resend · DocuSeal · n8n |
| **Última revisión docs** | 2026-04-19 |

## Empezar a desarrollar

```bash
git clone git@github.com:alexendros/afiladocs.git
cd afiladocs
npm install
cp .env.example .env.local   # editar valores reales — matriz en docs/DEPLOY_MANUAL.md
npm run dev                  # http://localhost:3000
```

Matriz completa de env vars (local · CI · Preview · Prod) en [docs/DEPLOY_MANUAL.md](docs/DEPLOY_MANUAL.md#1-matriz-de-entornos). Fuente canónica de configuración lazy: [src/lib/env.ts](src/lib/env.ts).

## Comandos

| Comando | Uso |
|---------|-----|
| `npm run dev` | Turbopack dev server en `:3000` |
| `npm run build` | Build de producción |
| `npm run typecheck` | `tsc --noEmit` (0 errores) |
| `npm run lint` | ESLint 9 flat config (0 errores/warnings nuevos) |
| `npm run test` · `test:coverage` | Vitest + coverage v8 (≥ 70% en módulos críticos) |
| `npm run test:e2e` | Playwright Chromium |
| `npm run analyze` | Bundle analyzer (`ANALYZE=true next build`) |
| `npm run ci:local` | Gate pre-push: check:env → typecheck → lint → test:coverage → build |
| `npx prisma migrate dev` | Aplicar migraciones en dev |
| `npx tsx scripts/audit-catalog.ts --all` | Auditar manifest contra BD/Stripe/DocuSeal |

Antes de declarar completa una tarea: `npm run ci:local` en verde.

## Mapa de documentación

Toda la doc técnica y operativa vive en [docs/](docs/). Índice navegable en [docs/README.md](docs/README.md).

### Arquitectura y reglas

- [CLAUDE.md](CLAUDE.md) — reglas absolutas del stack, patrones establecidos, flujo de pago, variables de entorno.
- [docs/00-ESTADO-ACTUAL.md](docs/00-ESTADO-ACTUAL.md) — snapshot del estado por eje (✅/🟡/❌).
- [docs/01-ROADMAP-MAESTRO.md](docs/01-ROADMAP-MAESTRO.md) — secuencia F1–F6 y dependencias.
- [docs/estado.html](docs/estado.html) — **playground interactivo** del estado y go-live (checklist P0-P3, DNS, catálogo, autoridad repo↔Notion). Abrir en navegador.

### Operativa del producto

| Doc | Para qué |
|-----|----------|
| [docs/UI_GUIDE.md](docs/UI_GUIDE.md) | Design system: tokens, tipografía DM Sans, componentes shadcn/ui, patrones RHF+Zod, a11y |
| [docs/ROUTES_MAP.md](docs/ROUTES_MAP.md) | Mapa completo de rutas `src/app/` con auth y propósito |
| [docs/CRON_JOBS.md](docs/CRON_JOBS.md) | Los 5 crons Vercel (cleanup · subscription · intake · sla · daily-report): schedule, SLA, payload, disparo manual |
| [docs/PORTAL_CLIENTE.md](docs/PORTAL_CLIENTE.md) | Journey del cliente en `/portal/*` (intake, documentos, suscripciones) |
| [docs/BACKOFFICE_OPS.md](docs/BACKOFFICE_OPS.md) | Journey ops en `/ops/*` (KPIs, pedidos, productos, alertas, auditoría) |
| [docs/CATALOG.md](docs/CATALOG.md) | Ciclo de vida de los 10 SKUs: draft → DocuSeal → Stripe → live · semver · script `audit-catalog.ts` |
| [docs/n8n-workflows.md](docs/n8n-workflows.md) | Los 5 workflows n8n (3 monitores BOE/DOGV/AEPD/CGPJ, contact relay, error router) |
| [docs/DEPLOY_MANUAL.md](docs/DEPLOY_MANUAL.md) | Matriz env vars por entorno, contrato CI, requisitos Vercel, fallos frecuentes |

### Runbooks (respuesta a incidencias)

Recetas paso-a-paso ejecutables sin contexto previo. Primer sitio al que acudir cuando algo va mal en producción.

| Runbook | Escenario |
|---------|-----------|
| [docs/runbooks/golive-stripe-live.md](docs/runbooks/golive-stripe-live.md) | **Go-live P0b**: poblar 10 SKUs en Stripe LIVE + DocuSeal + activar |
| [docs/runbooks/rollback-vercel.md](docs/runbooks/rollback-vercel.md) | Revertir un deploy fallido (CLI/dashboard, < 5 min) |
| [docs/runbooks/rotacion-secretos.md](docs/runbooks/rotacion-secretos.md) | Rotar Stripe · Supabase · DocuSeal · Resend · CRON_SECRET sin downtime |
| [docs/runbooks/recovery-docuseal.md](docs/runbooks/recovery-docuseal.md) | Recuperar un PDF firmado si falla el webhook DocuSeal |
| [docs/runbooks/stripe-webhook-fallido.md](docs/runbooks/stripe-webhook-fallido.md) | Reconciliar un `checkout.session.completed` no procesado |
| [docs/runbooks/incidente-rls.md](docs/runbooks/incidente-rls.md) | Cliente ve datos de otro cliente (violación RLS) |

### Guías transversales

Reglas que aplican a todas las fases del roadmap:

- [docs/guias/guia-seguridad.md](docs/guias/guia-seguridad.md) — CSP nonce, Zod en frontera, RLS, RGPD/LOPDGDD.
- [docs/guias/guia-calidad.md](docs/guias/guia-calidad.md) — linters, tests, cobertura, convenciones de commit.
- [docs/guias/guia-ui-ux.md](docs/guias/guia-ui-ux.md) — checklist de diseño y accesibilidad.
- [docs/guias/guia-workflows.md](docs/guias/guia-workflows.md) — ramas, PRs, CI/CD, deploy.

### Roadmap F1–F6

Sólo contiene trabajo pendiente; lo entregado se archiva.

| Fase | Estado | Doc |
|------|--------|-----|
| F1 Seguridad | ✅ cerrada 2026-04-14 | [docs/archive/fase-1-seguridad.md](docs/archive/fase-1-seguridad.md) |
| F2 Documentación | ✅ cerrada 2026-04-18 | [docs/archive/fase-2-documentacion.md](docs/archive/fase-2-documentacion.md) |
| F3 UX/Conversión | 🟡 parcial (A+B+C cerradas, D en curso) | [docs/fase-3-ux-conversion.md](docs/fase-3-ux-conversion.md) |
| F4 Ops avanzado | ✅ cerrada 2026-04-15 | [docs/archive/fase-4-ops-avanzado.md](docs/archive/fase-4-ops-avanzado.md) |
| F5 Performance | ✅ cerrada 2026-04-17 (F5.1 + F5.2) | [docs/archive/fase-5-performance.md](docs/archive/fase-5-performance.md) |
| F6 Crecimiento | ❌ pendiente | [docs/fase-6-crecimiento.md](docs/fase-6-crecimiento.md) |

## Catálogo y go-live P0b

Bloqueante para activar la tienda en producción. Todos los SKUs en `is_active=false` hasta poblar IDs externos.

- Estado canónico en [CLAUDE.md § P0b](CLAUDE.md#p0b--go-live-stripe-live).
- Trazabilidad por SKU (IDs externos, hashes, revisión legal): [catalog/manifest.json](catalog/manifest.json).
- Ciclo de vida y semver: [docs/CATALOG.md](docs/CATALOG.md).
- Runbook operativo paso-a-paso: [docs/runbooks/golive-stripe-live.md](docs/runbooks/golive-stripe-live.md).
- Drafts jurídicos por SKU: [catalog/drafts/](catalog/drafts/).

## Arquitectura en una página

```
Cliente                                          Admin (/ops)
  │                                                    │
  ▼                                                    ▼
/tienda · /producto/[slug] · /portal         /ops/{pedidos,productos,alertas,auditoria}
  │                                                    │
  └─► POST /api/checkout ──► Stripe ──► webhook ───────┤
                                           │           │
                                           ▼           │
                                       Verifactu       │
                                           │           │
                                           ▼           │
                                    orders.status      │
                                           │           │
                                  ┌────────┴────────┐  │
                                  ▼                 ▼  ▼
                            DocuSeal       Storage (PDF firmado)
                                  │                 │
                                  ▼                 ▼
                           /portal/pedido/[id] (descarga + timeline)
```

Detalle completo del flujo en [CLAUDE.md § Flujo de pago](CLAUDE.md#flujo-de-pago-stripe--verifactu--docuseal).

## Repositorio

- **Remoto único:** `github` → `git@github.com:alexendros/afiladocs.git`.
- **Rama principal:** `main`. Ramas activas: `main`, `staging`, `develop` (deploy Vercel activado en las 3).
- **Nomenclatura ramas:** `fase-N/<slug>` · `fix/<slug>` · `chore/<slug>` · `docs/<slug>`.
- **Plantillas PR/issue:** [.github/](.github/).
- Tras merge: `git push github main` (regla explícita en [CLAUDE.md § Repositorio remoto](CLAUDE.md#repositorio-remoto)).

## Integraciones con otras apps Alexendros

- **n8n-automations** ✅ confirmada — formulario contacto + ingesta alertas normativas. Detalle en [docs/n8n-workflows.md](docs/n8n-workflows.md).
- **alexendros-pro / alexendros-me** 🟡 oportunidad — sin dependencia técnica hoy. Contexto del split en `~/.claude/projects/-var-home-soyalexendros/memory/project_alexendros_split.md`.

Estado vivo de todas las apps de la cartera: `~/.claude/CARTERA.md`. Alertas cruzadas antes de deploys/rotaciones: `~/.claude/projects/-var-home-soyalexendros/memory/cross-app-alerts.md`.

## Licencia

Uso e implementación limitados según acuerdos contractuales con Alexendros. Afiladocs es propiedad intelectual del titular.
