# 01 — Roadmap maestro

## Objetivo estratégico

Llevar Afiladocs de **"producto funcional en Vercel"** (estado actual, 2026-04-14) a **"SaaS legal grado enterprise defendible"** ante auditorías de seguridad, Core Web Vitals y cumplimiento normativo (RGPD/LOPDGDD, RD 1007/2023, WCAG 2.1 AA).

El trabajo ya ejecutado (testing, observabilidad, webhooks HMAC, Verifactu, 13 emails, CRUD Ops completo) es la base. Las 6 fases que siguen **solo añaden lo que queda** — no reescriben lo existente.

## Matriz fase × área

| Fase | Seguridad | UX | Ops | Performance | Producto/Negocio |
|------|-----------|----|----|-------------|------------------|
| **F1** Seguridad | CSP nonce · middleware bot/geo · audit log UI | — | Vista audit log | — | — |
| **F2** Documentación | Runbook rotación secretos | — | Runbooks rollback | — | UI_GUIDE habilita F3 |
| **F3** UX/Conversión | — | CRO home · Schema.org · tienda · intake | — | LCP<2.5s INP<200ms | FAQ/HowTo SEO |
| **F4** Ops avanzado | — | — | Filtros · export · SLA · timeline | Paginación cursor | Export facturación |
| **F5** Performance | — | Edge banner LOPDGDD vs GDPR | — | Cache tags · bundle · edge | — |
| **F6** Crecimiento | — | MDX blog | — | Edge Config en caliente | Flags · i18n ES/CA |

## Secuencia recomendada

```
Semana 1-2    ─► F1 Seguridad (bloqueante para auditoría externa)
Semana 2-3    ─► F2 Documentación   (en paralelo con F1, habilita F3/F6)
Semana 4-6    ─► F3 UX/Conversión   (impacto directo en funnel)
Semana 7-8    ─► F4 Ops avanzado    (habilita escalado operativo)
Continuo      ─► F5 Performance     (métricas de RUM como gate)
On-demand     ─► F6 Crecimiento     (activar cuando haya señal de tracción)
```

## Dependencias bloqueantes

- **F6 blog MDX** depende de **F2 UI_GUIDE** (sin sistema documentado, los componentes MDX divergirían del design system).
- **F6 i18n** depende de **F3** (los textos se estabilizan antes de traducirlos).
- **F5 Edge geo** se coordina con **F1 middleware** (ambos tocan `src/middleware.ts`; conviene ejecutarlos secuenciales para evitar conflictos de merge).
- **F4 export CSV** depende del **audit log UI** de **F1** (la exportación debe registrar evento `report.exported`).

## Matriz de priorización (ROI vs esfuerzo)

| Iniciativa | Fase | Impacto | Esfuerzo | ROI |
|-----------|------|---------|----------|-----|
| CSP nonce | F1 | Alto (audit pass) | Medio | Alto |
| Middleware bot/geo | F1 | Medio | Bajo | Alto |
| Vista audit log Ops | F1 | Medio | Bajo | Alto |
| Docs operativos | F2 | Alto (onboarding) | Medio | Alto |
| Runbooks incidentes | F2 | Alto (MTTR) | Bajo | Muy alto |
| CRO home | F3 | Alto (conversión) | Medio | Alto |
| Schema.org FAQ/HowTo | F3 | Medio (SEO) | Bajo | Alto |
| Autoguardado intake | F3 | Medio (UX) | Medio | Medio |
| Filtros + cursor Ops | F4 | Medio | Medio | Medio |
| Export CSV Ops | F4 | Medio (facturación) | Bajo | Alto |
| Cache granular | F5 | Medio (coste Vercel) | Medio | Medio |
| Bundle analyzer | F5 | Bajo | Bajo | Medio |
| Edge Config flags | F6 | Alto (rollout seguro) | Medio | Medio |
| MDX blog | F6 | Medio (SEO) | Alto | Medio |
| i18n next-intl | F6 | Bajo (hasta expandir) | Alto | Bajo |

## Definición de "Fase completa"

Una fase se considera cerrada cuando:

1. Todos los entregables del `fase-N-*.md` están en `main`.
2. `npm run typecheck && npm run lint && npm run test:coverage` pasan sin warnings nuevos.
3. El snapshot en [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md) se actualiza para reflejar los ejes ya resueltos.
4. La guía transversal correspondiente (`guias/guia-*.md`) se ajusta si han cambiado convenciones.
5. Se anota un entry `project_*` en la memoria persistente con fecha absoluta y commit de cierre.

## Gobernanza del roadmap

- **Revisión mensual** (o cuando cierra una fase): re-auditar `00-ESTADO-ACTUAL.md` contra el repo.
- **Cambios de prioridad:** modificar la sección *"Secuencia recomendada"* y justificar en commit.
- **Fases nuevas:** añadir `fase-7-*.md` con la misma plantilla (objetivos, entregables, aceptación, dependencias, estimación).
