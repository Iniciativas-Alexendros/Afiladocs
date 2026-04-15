# Pull Request — Afiladocs

## 1. Tipo de cambio

- [ ] Fix (bug)
- [ ] Feature
- [ ] Refactor
- [ ] Docs
- [ ] Chore / Dev-ex
- [ ] Seguridad

## 2. Resumen

Explica brevemente **qué** hace este PR y **por qué**. Enlaza a issue o a la fase del roadmap si aplica.

## 3. Fase del roadmap

Marca la fase que cubre este PR (ver [Informes para Claude Code/01-ROADMAP-MAESTRO.md](../Informes%20para%20Claude%20Code/01-ROADMAP-MAESTRO.md)):

- [ ] F1 — Seguridad y endurecimiento
- [ ] F2 — Documentación técnica
- [ ] F3 — UX/Conversión
- [ ] F4 — Ops avanzado
- [ ] F5 — Performance
- [ ] F6 — Crecimiento
- [ ] Fuera de roadmap (justificar)

## 4. Guías transversales aplicables

Marca las guías relevantes y confirma que el cambio las respeta:

- [ ] [Seguridad](../Informes%20para%20Claude%20Code/guias/guia-seguridad.md) — si toca `api/`, `lib/` server-side, middleware o CSP
- [ ] [Calidad](../Informes%20para%20Claude%20Code/guias/guia-calidad.md) — siempre
- [ ] [UI/UX](../Informes%20para%20Claude%20Code/guias/guia-ui-ux.md) — si toca UI
- [ ] [Workflows](../Informes%20para%20Claude%20Code/guias/guia-workflows.md) — si toca Stripe/DocuSeal/Supabase/Resend/n8n/Verifactu/cron

## 5. Cambios técnicos

- Archivos/directorios principales modificados:
- Decisiones de diseño relevantes:
- Dependencias añadidas/quitadas:

## 6. Verificación

- [ ] `npm run ci:local` verde (equivale a check:env + typecheck + lint + test:coverage + build)
- [ ] `npm run test:e2e` (si aplica)
- [ ] Preview deployment Vercel probado manualmente
- [ ] He revisado [docs/DEPLOY_MANUAL.md](../docs/DEPLOY_MANUAL.md) y este PR no rompe la matriz de env vars ni el contrato CI

## 7. Riesgos y rollback

- Riesgos conocidos:
- Estrategia de rollback: (revertir commit / rollback Vercel / runbook específico en `docs/runbooks/`)

## 8. Seguridad / RGPD

- [ ] Sin nuevos secretos en `NEXT_PUBLIC_*`
- [ ] Sin nuevos dominios en CSP sin justificación
- [ ] Handlers con PII validan `rgpd_accepted` server-side
- [ ] Variables nuevas añadidas a `src/lib/env.ts` como lazy getter

## 9. Notas para revisión

Puntos que el revisor debería mirar con especial atención.
