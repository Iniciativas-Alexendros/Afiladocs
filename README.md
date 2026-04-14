# Afiladocs

Plataforma de servicios legales digitales B2C (Valencia, España).

- **Stack:** Next.js 15.3 · React 19 · TypeScript 5.8 strict · Tailwind v4 · shadcn/ui · Prisma 7 + Supabase · Stripe SDK 21 · Resend · DocuSeal · n8n.
- **Deploy:** Vercel (región `mad1`).
- **Dominio:** <https://afiladocs.com>.

## Empezar a desarrollar

```bash
git clone git@github.com:alexendros/afiladocs.git
cd afiladocs
npm install
cp .env.example .env.local   # editar valores reales
npm run dev                  # http://localhost:3000
```

## Comandos

- `npm run dev` — Turbopack dev server.
- `npm run typecheck` — TypeScript estricto.
- `npm run lint` — ESLint 9 flat config.
- `npm run build` — build producción.
- `npm run test` — Vitest.
- `npx prisma migrate dev` — aplica migraciones en dev.

## Documentación

Toda la documentación técnica y operativa vive en [docs/README.md](docs/README.md):

- Docs operativos: `UI_GUIDE`, `ROUTES_MAP`, `CRON_JOBS`, `PORTAL_CLIENTE`, `BACKOFFICE_OPS`.
- Runbooks: rollback, rotación de secretos, recovery DocuSeal, Stripe webhooks, RLS.
- Roadmap F1–F6 y guías transversales (seguridad, calidad, UI/UX, workflows).

Reglas absolutas del stack y variables de entorno en [CLAUDE.md](CLAUDE.md).

## Licencia

Uso e implementación limitados según acuerdos contractuales con Alexendros. Afiladocs es propiedad intelectual del titular.
