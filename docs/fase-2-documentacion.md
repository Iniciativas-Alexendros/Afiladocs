# Fase 2 — Documentación técnica operativa

**Duración estimada:** 1 semana
**Prioridad:** Alta (habilita onboarding y reduce MTTR en incidentes)
**Dependencias:** ninguna (se ejecuta en paralelo con F1)

## Objetivo

Completar la carpeta [docs/](../docs/) con los documentos operativos que hoy están referenciados pero no existen. Sustituir el viejo `docs-INDEX.md` (que apuntaba a archivos inexistentes) por un `docs/README.md` real y útil tanto para humanos como para Claude Code.

## Entregables

### 2.1 Docs nuevos en `docs/`

| Archivo | Contenido mínimo |
|---------|------------------|
| `docs/README.md` | Índice operativo con enlaces relativos a todos los docs; reemplaza a `docs-INDEX.md` |
| `docs/UI_GUIDE.md` | Design system: tokens (color, espaciado, tipografía), componentes base (`src/components/ui`), variantes de Button/Input/Card/Dialog, patrones de formulario con `react-hook-form` + Zod, reglas de accesibilidad Radix |
| `docs/ROUTES_MAP.md` | Mapa de rutas `src/app` por dominio (marketing, auth, portal, ops, api) con propósito de negocio, autenticación requerida y doc asociado |
| `docs/CRON_JOBS.md` | Los 5 crons de [vercel.json](../vercel.json): schedule, SLA esperado, payload, dependencias externas, alertas de fallo |
| `docs/PORTAL_CLIENTE.md` | Journey cliente: dashboard, listado pedidos, detalle, intake, descarga firmado, gestión suscripción |
| `docs/BACKOFFICE_OPS.md` | Journey ops: dashboard KPIs, gestión pedidos, upload PDF, envío a firma, alertas normativas, audit log |

### 2.2 Runbooks de incidentes

Crear `docs/runbooks/` con al menos:

| Runbook | Escenario |
|---------|-----------|
| `docs/runbooks/rollback-vercel.md` | Revertir deploy fallido desde CLI o dashboard; criterios para rollback vs forward-fix |
| `docs/runbooks/rotacion-secretos.md` | Stripe, Supabase, DocuSeal, Resend: pasos de rotación sin downtime |
| `docs/runbooks/recovery-docuseal.md` | Qué hacer si el webhook DocuSeal falla o un PDF firmado no llega al Storage |
| `docs/runbooks/stripe-webhook-fallido.md` | Reconciliación cuando un evento `checkout.session.completed` no se procesó |
| `docs/runbooks/incidente-rls.md` | Diagnóstico si un cliente ve datos de otro (violación RLS) |

### 2.3 Umbrales de calidad declarados

- Documentar en `docs/README.md` el umbral de cobertura obligatorio: **≥ 70% statements en `src/lib/stripe`, `src/lib/orders`, `src/lib/verifactu`, `src/app/api/**`** (no global — enfoque en dominio crítico).
- Añadir sección "Cómo contribuir" con referencia a [guias/guia-calidad.md](guias/guia-calidad.md) y a los templates `.github/`.

## Criterios de aceptación

- [ ] `docs/README.md` existe con índice funcional; `docs-INDEX.md` ya no aparece en la raíz del repo.
- [ ] Los 5 docs operativos + 5 runbooks existen con contenido real (no TODO placeholders).
- [ ] Cada doc tiene TOC, enlaces relativos a código (sintaxis `[file.ts](../src/...)`) y fecha de última revisión.
- [ ] El umbral de cobertura 70% está declarado en `docs/README.md` y referenciado en `guias/guia-calidad.md`.
- [ ] Ningún doc referencia Documenso, Hostinger, PM2 o Nginx (stack legacy ya retirado).
- [ ] `rg -i 'documenso|hostinger|nginx|PM2' docs/` devuelve 0.

## Archivos a crear / modificar

- `docs/README.md` (NEW)
- `docs/UI_GUIDE.md` (NEW)
- `docs/ROUTES_MAP.md` (NEW)
- `docs/CRON_JOBS.md` (NEW)
- `docs/PORTAL_CLIENTE.md` (NEW)
- `docs/BACKOFFICE_OPS.md` (NEW)
- `docs/runbooks/*.md` (NEW × 5)
- `CLAUDE.md` — añadir enlace a `docs/README.md` en la sección "Arquitectura de directorios"

## Validación

1. Abrir cada doc en el VSCode Markdown preview: todos los enlaces relativos deben resolver.
2. `find docs -name '*.md' | xargs wc -l` — ningún doc operativo < 50 líneas (indicador de contenido real).
3. Un contribuidor externo debe poder seguir `docs/runbooks/rollback-vercel.md` sin contexto previo.

## Riesgos

- **Documentación que envejece sin mantenimiento**: mitigar con entry en el roadmap maestro de "revisión mensual de docs" y regla en [guias/guia-calidad.md](guias/guia-calidad.md) que obligue a actualizar docs cuando cambie el código referenciado.

## Cierre

- Actualizar [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md) — eje "Docs internas" pasa a ✅.
- Anotar `project_f2_docs_closed.md` con fecha y commit.
