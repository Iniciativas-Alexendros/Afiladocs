# Fase 5 — Performance y coste

## Estado: ✅ CERRADA — 2026-04-17 (scope F5.1 + F5.2)

Deuda remanente documentada en §"Deuda performance cerrada" al final del archivo (ex `F5-performance-audit.md`, fusionado aquí).

**Duración estimada:** continua (se introduce gradualmente)
**Prioridad:** Media (más alta si los costes de Vercel o los tiempos de respuesta se degradan)
**Dependencias:** F1 (convive con middleware para nonce+geo)

## Objetivo

Reducir TTFB y coste de Functions en Vercel sin sacrificar frescura de datos, y sentar las bases para mantener Core Web Vitals verdes a medida que el tráfico crece. La fase es **continua** — no se cierra con un sprint, se incorpora a la higiene de cada PR.

## Entregables

### 5.1 Caché granular con tags

Introducir `unstable_cache` con tags invalidables en las queries del portal:

- `getUserOrders(userId)` → tags `['orders', 'user:{userId}']`, `revalidate: 60`.
- `getProductCatalog()` → tags `['products']`, `revalidate: 300`.
- `getUserSubscriptions(userId)` → tags `['subscriptions', 'user:{userId}']`, `revalidate: 120`.

En los webhooks que mutan datos, llamar `revalidateTag('orders')` / `revalidateTag('products')` según corresponda. Los webhooks afectados: [src/app/api/webhooks/stripe/route.ts](../../src/app/api/webhooks/stripe/route.ts), [src/app/api/webhooks/docuseal/route.ts](../../src/app/api/webhooks/docuseal/route.ts).

### 5.2 Bundle analyzer en CI

- Integrar `@next/bundle-analyzer` con flag `ANALYZE=true`.
- Job opcional en GitHub Actions que publique reporte como artefacto en PRs.
- Umbrales declarados en `docs/README.md`: main bundle < 300kB gzip, página más pesada < 450kB gzip.
- Convertir componentes no above-the-fold a `dynamic()`: ShoppingCart drawer, `BillingPortalButton`, modales pesados.

### 5.3 Imágenes y assets

- Auditoría: todas las `<img>` → `next/image` (ya hay regla ESLint `@next/next/no-img-element`).
- `priority` en Hero y primera imagen above-the-fold de listados.
- `placeholder="blur"` con blur data URL para imágenes de Supabase Storage (helper `getBlurDataUrl` en `src/lib/supabase/storage.ts`).
- `sizes` prop correcto en cards responsivas.
- Formato preferente: AVIF con fallback WebP (configurar en `next.config.ts` `images.formats`).

### 5.4 Edge Middleware con personalización geo

Extender el middleware de F1 para aprovechar `request.geo`:

- Detectar España → mostrar banner LOPDGDD específico; resto UE → banner GDPR genérico; fuera UE → banner reducido.
- Divisa: EUR por defecto; preparar lógica para futuro USD/GBP (no aplicar aún hasta que Stripe tenga precios multi-moneda).
- Log de geo → `audit_log.event='visitor.geo'` muestreado (1 de cada 100) para análisis sin coste.

### 5.5 Streaming y Suspense estratégico

- Revisar páginas del portal para identificar fetches paralelizables con `Suspense` boundaries.
- `loading.tsx` en `/portal`, `/portal/pedidos`, `/ops`, `/ops/pedidos` con skeletons realistas.
- Usar `use cache` de React 19 en server components que no requieran datos frescos.

## Criterios de aceptación

- [ ] Home `/` TTFB < 200ms (p75) en Vercel Analytics.
- [ ] `/portal/pedidos` tras login: 3 renders consecutivos en < 10s no generan nuevas queries DB (evidencia de cache hit).
- [ ] Bundle main < 300kB gzip; informe del analyzer adjunto al PR de cierre.
- [ ] Lighthouse Mobile Performance ≥ 92 en `/`, `/tienda`, `/portal`.
- [ ] Webhook Stripe después de `checkout.session.completed`: `/portal` refleja nuevo pedido en < 5s (revalidateTag efectivo).

## Archivos a modificar

- `src/lib/prisma/queries.ts` (o crear si no existe) — wrapping con `unstable_cache`.
- `src/app/api/webhooks/stripe/route.ts` + `docuseal/route.ts` — `revalidateTag()` en puntos clave.
- `next.config.ts` — `bundleAnalyzer` + `images.formats`.
- `src/middleware.ts` — extender con geo (convive con F1).
- `package.json` — script `analyze: "ANALYZE=true next build"`.
- `.github/workflows/` — job opcional de bundle (cuando se reintroduzca CI).
- Componentes no críticos → `dynamic(() => import(...))`.

## Validación

1. Medir Core Web Vitals en Vercel Analytics durante 7 días post-deploy.
2. Comparar coste de Function Invocations pre/post (Vercel Dashboard → Usage).
3. Ejecutar `npm run analyze` antes de cada release mayor; revisar los top-10 módulos por peso.

## Riesgos

- **Stale data en portal**: ajustar `revalidate` por tipo de query; pedidos deben ser más frescos que productos.
- **Bundle más pequeño rompe features**: tests E2E deben cubrir componentes convertidos a `dynamic()`.
- **Geo-ID + RGPD**: no persistir IP del visitante; Vercel geo headers son efímeros y no identifican personalmente.

## Cierre

- La fase **no se cierra**: queda como proceso continuo. Cada release añade mejoras incrementales.
- Cada 30 días: snapshot en [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md) con métricas RUM.

---

## Deuda performance cerrada (F5.1 + F5.2)

**Fecha:** 2026-04-15 → 2026-04-17. Baseline Lighthouse: [performance-baseline/](performance-baseline/) (6 snapshots: home/tienda/suscripciones × desktop/mobile).

### Hallazgo principal

Todas las páginas de marketing consumiendo catálogo estaban `export const dynamic = 'force-dynamic'` (introducido en `3aa4afa feat(f3/b+c)`), forzando SSR por request y anulando ISR. El catálogo es público y cambia raras veces — candidato obvio para ISR con invalidación por tag.

### Páginas migradas (F5.1)

| Ruta | Antes | Después |
|------|-------|---------|
| [/](../../src/app/(marketing)/page.tsx) | `force-dynamic` | `revalidate = 3600` |
| [/revisiones](../../src/app/(marketing)/revisiones/page.tsx) | `force-dynamic` | `revalidate = 3600` |
| [/producto/[slug]](../../src/app/(marketing)/producto/[slug]/page.tsx) | `force-dynamic` | SSG con `generateStaticParams` |
| [/tienda/[categoria]](../../src/app/(marketing)/tienda/[categoria]/page.tsx) | `force-dynamic` | SSG (7 categorías `VALID`) |
| [/tienda](../../src/app/(marketing)/tienda/page.tsx) | `force-dynamic` | dinámico por `searchParams`, DB vía cache |

`src/lib/catalog/query.ts` migrado de `cache()` (per-request) a `unstable_cache` con tag único `products`, `revalidate: 3600`. `.catch()` fuera del wrapper → si DB falla no se cachea el vacío. `revalidateProductsCache()` expuesto para writes desde `src/app/ops/productos/actions.ts`.

### Bundle wins (F5.2, PRs #22/#23/#24)

| Ruta | Antes F5 | Tras F5.2 | Delta |
|------|----------|-----------|-------|
| `/` (home) | 234 kB | **194 kB** | −40 kB (−17 %) |
| `/recuperar-password` | 189 kB | **128 kB** | −61 kB (−32 %) |
| `/recuperar-password/confirmar` | 189 kB | **127 kB** | −62 kB (−33 %) |
| `/portal/pedido/[id]` | 204 kB | 204 kB | latencia query reducida ~60 s por cache granular |

Home pasa de ruta híbrida a `○` (RSC estática) al sacar framer-motion y migrar Hero+ProcessSteps a Server Components.

Cambios concretos:
- **framer-motion eliminado** del proyecto; migrado a CSS animations nativas (`.afd-fade-up` en [globals.css](../../src/app/globals.css)).
- **`@supabase/ssr` lazy-loaded** vía [src/lib/supabase/lazy-client.ts](../../src/lib/supabase/lazy-client.ts).
- **Cache granular portal:** `/portal/pedido/[id]` envuelve `findFirst` en `unstable_cache` con tags `['orders', 'orders-${uid}', 'order-${id}']`; webhooks Stripe/DocuSeal y ops actions propagan invalidación granular.

### Qué queda pendiente (ROI descendente)

1. **PPR en /tienda** — esperando estabilización de Partial Prerendering de Next 15; entonces static shell + Suspense boundary por filtro.
2. **CSP nonce overhead** — medir impacto en TTFB con snapshots de [performance-baseline/](performance-baseline/) como referencia.
3. **Migración completa de /tienda a estático** — exige mover filtrado `?cat=` a client component con `useSearchParams()`. ROI bajo hasta superar ~50 productos.

### Cómo verificar en producción

- Tras deploy: `curl -I https://afiladocs.com/ | grep -i 'x-nextjs-cache\|age'`. Primera request debe ser `MISS`; siguientes `HIT` hasta 3600 s o `revalidateProductsCache()`.
- Tocar un producto en `/ops/productos` → recargar `/` → cambio inmediato (invalidación por tag).
- Relanzar Lighthouse sobre `https://afiladocs.com/` y comparar contra [performance-baseline/home-desktop.json](performance-baseline/home-desktop.json).
