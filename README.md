# Afiladocs

Plataforma de servicios legales digitales B2C (Valencia, España) — plantillas legales rellenables vía DocuSeal + revisiones expertas humanas.

|             |                                                                                                      |
| ----------- | ---------------------------------------------------------------------------------------------------- |
| **Estado**  | Producción activa                                                                                    |
| **Dominio** | [afiladocs.com](https://afiladocs.com)                                                               |
| **Stack**   | Next.js 15 · React 19 · TypeScript 5.8 · Tailwind v4 · Prisma 7 · Stripe · Supabase · DocuSeal · n8n |

---

## Desarrollo

```bash
git clone git@github.com:alexendros/afiladocs.git && cd afiladocs
npm install && cp .env.example .env.local && npm run dev
```

### Comandos

| Comando             | Uso                          |
| ------------------- | ---------------------------- |
| `npm run dev`       | Turbopack dev server `:3000` |
| `npm run build`     | Build producción             |
| `npm run typecheck` | `tsc --noEmit`               |
| `npm run lint`      | ESLint 9 flat config         |
| `npm run test`      | Vitest + coverage            |
| `npm run test:e2e`  | Playwright Chromium          |
| `npm run ci:local`  | Gate pre-push completo       |

---

## Arquitectura

```
Cliente → /tienda · /portal → POST /api/checkout → Stripe → webhook
                                                          ↓
Admin (/ops) → /ops/*                          Verifactu → orders → DocuSeal → Storage
```

Flujo completo: [CLAUDE.md § Flujo de pago](CLAUDE.md#flujo-de-pago-stripe--verifactu--docuseal).

---

## Documentación

### Core

| Doc                                                      | Contenido                                 |
| -------------------------------------------------------- | ----------------------------------------- |
| [CLAUDE.md](CLAUDE.md)                                   | Reglas absolutas, flujo de pago, env vars |
| [docs/00-ESTADO-ACTUAL.md](docs/00-ESTADO-ACTUAL.md)     | Snapshot por eje                          |
| [docs/01-ROADMAP-MAESTRO.md](docs/01-ROADMAP-MAESTRO.md) | Fases F1–F6                               |

### Producto

| Doc                                            | Contenido                         |
| ---------------------------------------------- | --------------------------------- |
| [docs/UI_GUIDE.md](docs/UI_GUIDE.md)           | Design system, shadcn/ui, RHF+Zod |
| [docs/ROUTES_MAP.md](docs/ROUTES_MAP.md)       | Rutas `src/app/` con auth         |
| [docs/CRON_JOBS.md](docs/CRON_JOBS.md)         | 5 crons Vercel                    |
| [docs/CATALOG.md](docs/CATALOG.md)             | Ciclo de vida SKUs                |
| [docs/DEPLOY_MANUAL.md](docs/DEPLOY_MANUAL.md) | Env vars, CI, Vercel              |

### Runbooks

| Runbook                                                              | Escenario             |
| -------------------------------------------------------------------- | --------------------- |
| [golive-stripe-live.md](docs/runbooks/golive-stripe-live.md)         | Go-live P0b           |
| [rollback-vercel.md](docs/runbooks/rollback-vercel.md)               | Revertir deploy       |
| [rotacion-secretos.md](docs/runbooks/rotacion-secretos.md)           | Rotar credenciales    |
| [recovery-docuseal.md](docs/runbooks/recovery-docuseal.md)           | Recuperar PDF firmado |
| [stripe-webhook-fallido.md](docs/runbooks/stripe-webhook-fallido.md) | Reconciliar webhook   |
| [incidente-rls.md](docs/runbooks/incidente-rls.md)                   | Violación RLS         |

---

## Roadmap

| Fase             | Estado               |
| ---------------- | -------------------- |
| F1 Seguridad     | Cerrada              |
| F2 Documentación | Cerrada              |
| F3 UX/Conversión | Parcial (D en curso) |
| F4 Ops avanzado  | Cerrada              |
| F5 Performance   | Cerrada              |
| F6 Crecimiento   | Pendiente            |

---

## Licencia

[LICENSE](LICENSE) — todos los derechos reservados.
