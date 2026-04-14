# Fase 6 — Crecimiento y experimentación

**Duración estimada:** 4–6 semanas (se activa cuando hay señal de tracción)
**Prioridad:** Baja (no bloqueante; esperar validación de mercado)
**Dependencias:** F2 UI_GUIDE (blog MDX); F3 (textos estables antes de i18n)

## Objetivo

Habilitar iteración rápida sobre producto y expansión geográfica sin cambiar la base técnica. Tres ejes: **feature flags** (rollouts controlados sin redeploy), **blog con MDX** (contenido SEO con mejor DX que el array TS actual) y **i18n** (ES/CA como primera expansión si el mercado catalán se valida).

Esta fase se activa cuando se cumplan 2 de estas 3 señales:
- Funnel estable (conversión `/` → pagado > 3%).
- Demanda documentada de contenido SEO recurrente.
- Leads de clientes fuera de Valencia que requieran localización.

## Entregables

### 6.1 Feature flags con Vercel Edge Config

- Integrar `@vercel/edge-config` (zero runtime, lectura en Edge).
- `src/lib/flags.ts` con `getFeatureFlag(flag: string, defaultValue: boolean)`.
- Primeros flags candidatos: `new-checkout-flow`, `show-comparador-suscripciones`, `enable-review-booster`.
- Gestión desde Vercel Dashboard → Edge Config (cambio instantáneo, sin deploy).
- Documentar en `docs/runbooks/feature-flags.md` (parte de F2): quién puede modificar flags, cómo auditar cambios.

### 6.2 Blog con MDX + Contentlayer2

Sustituir el array de posts actual (`src/app/(marketing)/blog/data.ts`) por:

- Instalar `contentlayer2` + `next-contentlayer2`.
- Posts en `content/blog/*.mdx` con frontmatter validado por Zod (title, slug, date, tags, author, coverImage, summary).
- Pipeline de build genera tipos y objetos tipados.
- Componentes MDX custom (Callout, CodeBlock, Figure) respetando el design system de [docs/UI_GUIDE.md](../docs/UI_GUIDE.md).
- RSS feed en `/feed.xml` (Route Handler).
- Schema.org `Article` por post (integrado con `JsonLd` de F3).
- Sitemap dinámico incluye posts MDX automáticamente.

### 6.3 i18n con `next-intl`

Sólo si se valida demanda. Plan:

- Instalar `next-intl` con estructura `/[locale]/...`.
- Locales iniciales: `es` (default), `ca` (catalán para mercado Valencia/Cataluña).
- Middleware de detección de locale respeta `Accept-Language` + cookie.
- `messages/es.json`, `messages/ca.json` con todos los textos extraídos de componentes.
- URLs canónicas con `hreflang` en `<head>`.
- Formularios legales (RGPD/LOPDGDD): la versión CA debe revisarse por asesoría legal antes de publicar.

### 6.4 Instrumentación de experimentos

- Con flags ya disponibles, añadir tracking mínimo: qué variante se muestra a cada usuario (cookie anónima) y evento de conversión.
- Panel `/ops/experimentos` (ligero, paginado) que liste flags activos, % de exposición, conversión estimada.
- Datos desde `audit_log` con eventos `experiment.exposure` y `experiment.conversion` — sin persona data.

## Criterios de aceptación

- [ ] Cambiar un valor en Edge Config se refleja en `/` en < 30s sin redeploy.
- [ ] Crear un post MDX en `content/blog/` y hacer commit → aparece en `/blog` y `/feed.xml` tras build.
- [ ] Visitar `/ca` muestra textos en catalán; hreflang correcto en `<head>`.
- [ ] Panel de experimentos muestra al menos un flag activo con sus métricas.
- [ ] Sin regresiones en rutas legacy (`/`, `/blog/[slug]`, `/portal/*`).

## Archivos a crear / modificar

- `src/lib/flags.ts` (NEW)
- `contentlayer.config.ts` (NEW)
- `content/blog/*.mdx` (migración desde `data.ts`)
- `src/app/(marketing)/blog/*` — adaptado a Contentlayer
- `src/app/feed.xml/route.ts` (NEW)
- `next.config.ts` — integrar `withContentlayer`
- `i18n/*.json` + `src/middleware.ts` (coordinar con F1/F5)
- `src/app/ops/experimentos/page.tsx` (NEW)
- `docs/runbooks/feature-flags.md` (NEW en F2, detalle aquí)

## Validación

1. Toggle de flag desde Vercel Dashboard y verificar cambio sin nuevo deploy.
2. Lighthouse SEO en un post MDX ≥ 95.
3. Google Rich Results Test valida `Article` en blog post.
4. Validación legal CA antes de activar locale `ca` en producción.

## Riesgos

- **Complejidad de i18n en formularios legales**: mantener ES como autoritativo; CA sólo cuando haya revisión jurídica firmada.
- **Contentlayer2 está en activo desarrollo**: fijar versión en `package.json` y monitorizar breaking changes.
- **Edge Config cache miss**: hay caché de ~1s en Edge; no usar flags para datos críticos de seguridad.
- **Evaluar demanda real**: no construir i18n especulativo. Documentar en memoria el evento que dispara la activación (lead > X de CA).

## Cierre

- La fase se cierra por módulos (flags, MDX, i18n independientemente).
- Cada módulo deja su entry en memoria: `project_f6_flags_closed.md`, etc.
- [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md) actualiza los 3 ejes pendientes a ✅ a medida que cierran.
