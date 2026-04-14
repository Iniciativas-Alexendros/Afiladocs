# Informes para Claude Code

Roadmap vivo de Afiladocs adaptado al estado real del repositorio (Vercel serverless · Next.js 15.3 · DocuSeal · Prisma 7 · Supabase). Sustituye a los informes generados entre 2026-04-01 y 2026-04-14 que quedaron desalineados tras la migración a Vercel y la retirada de Documenso.

## Propósito

- Hoja de ruta **solo con trabajo pendiente**, organizada por fases con objetivos medibles.
- Guías transversales que Claude Code debe consultar antes de tocar seguridad, calidad, UI/UX o workflows.
- Fuente única para issues y PRs: los templates de `.github/` referencian explícitamente las fases.

## Cómo usar esta carpeta

1. **Empezar por el estado real:** [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md) confirma qué está implementado (no duplicar trabajo).
2. **Elegir fase:** [01-ROADMAP-MAESTRO.md](01-ROADMAP-MAESTRO.md) propone la secuencia y dependencias.
3. **Ejecutar:** cada `fase-N-*.md` tiene objetivo, entregables, criterios de aceptación y archivos a tocar.
4. **Consultar guías transversales** ([guias/](guias/)) para reglas que aplican a todas las fases.
5. **Abrir PR/issue:** usar plantillas de `.github/` — obligan a declarar qué fase cubre el cambio.

## Estructura

```
Informes para Claude Code/
├── README.md                    ← estás aquí
├── 00-ESTADO-ACTUAL.md          snapshot validado (próxima revisión: 2026-05-14)
├── 01-ROADMAP-MAESTRO.md        visión de fases, dependencias, matriz de priorización
├── fase-1-seguridad.md          CSP nonce · middleware bot/geo · audit log UI
├── fase-2-documentacion.md      docs/ completo (UI_GUIDE, ROUTES_MAP, runbooks)
├── fase-3-ux-conversion.md      CRO home · Schema.org · pulido tienda/intake
├── fase-4-ops-avanzado.md       filtros · export CSV · KPIs SLA
├── fase-5-performance.md        cache granular · bundle · edge geo
├── fase-6-crecimiento.md        feature flags · MDX blog · i18n
└── guias/
    ├── guia-seguridad.md
    ├── guia-calidad.md
    ├── guia-ui-ux.md
    └── guia-workflows.md
```

## Convenciones

- **Criterios de "Done":** cada entregable de una fase debe pasar `npm run typecheck && npm run lint && npm run test:coverage` (comando obligatorio antes de declarar tarea completa; ver [CLAUDE.md](../CLAUDE.md)).
- **Nomenclatura de ramas:** `fase-N/<slug-corto>` (p.ej. `fase-1/csp-nonce`).
- **Re-auditoría:** el snapshot de `00-ESTADO-ACTUAL.md` se revalida al cierre de cada fase o cada 30 días.
- **No inventar docs cruzados:** si una fase depende de otra, se declara en la sección *Dependencias* del `.md` correspondiente.

## Fuentes de verdad

- [CLAUDE.md](../CLAUDE.md) — reglas absolutas del stack (lo que no se negocia)
- [MEMORY.md](../../.claude/projects/-var-home-soyalexendros-Apps-afiladocs-website/memory/MEMORY.md) — memoria persistente de Claude Code
- `~/.claude/PROYECTOS.md` — contexto global SIMBIOSIS de las apps de Alexendros

Las referencias a stack antiguo (VPS/Nginx/PM2, Documenso) que puedan aparecer en commits viejos o comentarios son **legacy** y deben ignorarse: el stack activo es el descrito en `CLAUDE.md`.
