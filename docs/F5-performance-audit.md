# F5 Performance — Auditoría y plan

**Fecha**: 2026-04-15
**Baseline Lighthouse**: [`docs/performance-baseline/`](./performance-baseline/) (6 snapshots: home/tienda/suscripciones × desktop/mobile, capturados sobre `https://afiladocs.com/`)

## Estado previo (antes de este PR)

Piezas ya hechas por `f7aecb9 feat(f5): performance`:

- Script `npm run analyze` (`ANALYZE=true next build`) con `@next/bundle-analyzer` cableado en [`next.config.ts`](../next.config.ts).
- `revalidateTag('orders')` en Stripe checkout webhook → portal se refresca < 5 s tras pago.
- `unstable_cache` en [`/portal/suscripciones`](../src/app/portal/suscripciones/page.tsx) (tags `subscriptions`, 120 s).
- CI workflow con typecheck + lint + tests + build en [`.github/workflows/ci.yml`](../.github/workflows/ci.yml).

## Hallazgo principal

Todas las páginas de marketing que consumen catálogo estaban marcadas `export const dynamic = 'force-dynamic'` (introducido en `3aa4afa feat(f3/b+c)`), lo que fuerza SSR por request y anula cualquier ISR posible. El catálogo es público y cambia raras veces — es el candidato obvio para ISR con invalidación por tag.

Páginas afectadas:

| Ruta | Estado previo | Decisión este PR |
|------|---------------|------------------|
| [`/`](../src/app/(marketing)/page.tsx) | `force-dynamic` | `revalidate = 3600` |
| [`/revisiones`](../src/app/(marketing)/revisiones/page.tsx) | `force-dynamic` | `revalidate = 3600` |
| [`/tienda`](../src/app/(marketing)/tienda/page.tsx) | `force-dynamic` | diferido (lee `searchParams`) |
| [`/tienda/[categoria]`](../src/app/(marketing)/tienda/[categoria]/page.tsx) | `force-dynamic` | diferido (misma razón) |
| [`/producto/[slug]`](../src/app/(marketing)/producto/[slug]/page.tsx) | `force-dynamic` | diferido (estudiar `generateStaticParams`) |

`tienda` y `producto/[slug]` quedan para un PR de seguimiento porque requieren más análisis: en `tienda/` los filtros por `?cat=` podrían generar combinatoria de cache; en `producto/[slug]` conviene añadir `generateStaticParams` para pre-renderizar los productos activos.

## Cambios de este PR

### 1. `src/lib/catalog/query.ts`

Migrado de `cache()` (React per-request dedup) a `unstable_cache` (persistente, cross-request):

- Tag único compartido: `products`.
- `revalidate: 3600` segundos.
- `.catch()` fuera del wrapper `unstable_cache` → si la DB falla, **no cacheamos el array vacío**; la siguiente request reintenta.
- Expone `revalidateProductsCache()` — helper centralizado para invalidar desde writes.

### 2. Home y Revisiones

`export const dynamic = 'force-dynamic'` → `export const revalidate = 3600`.

Ambas páginas son estáticas salvo por `getActiveProducts()` / `getProductsByCategory('review')`, que ahora viajan por `unstable_cache`. Cualquier otro dato (hero, FAQ, schema.org) es literal en el componente.

### 3. `src/app/ops/productos/actions.ts`

`createProduct`, `updateProduct`, `toggleProductActive` ahora llaman `revalidateProductsCache()` además del `revalidatePath` existente. Así los cambios del catálogo se reflejan en marketing en la siguiente request sin esperar a 3600 s.

## Qué queda pendiente en F5

Ordenado por ROI descendente:

1. **Tienda y producto a ISR** — migrar `/tienda*` y `/producto/[slug]` a ISR. Para `producto/[slug]` pre-generar con `generateStaticParams(getActiveProducts)`. Para `tienda` evaluar si los filtros `?cat=` se pueden servir con `<Suspense>` + cliente en lugar de SSR-por-filtro.
2. **RUM / Web Vitals** — `@vercel/analytics` ya está instalado; verificar que está montado en `layout.tsx` raíz y añadir `<SpeedInsights />` si no lo está. Considerar Sentry Performance (ya tenemos SDK).
3. **Bundle audit** — correr `npm run analyze` en local, documentar los 3 chunks más pesados y marcar candidatos a `next/dynamic` (probablemente Framer Motion en landings secundarias).
4. **Cache granular adicional** — `/portal/pedidos` y `/portal/pedido/[id]` hoy leen Supabase por request; estudiar si `unstable_cache` por `user_id` aporta (tag `orders-${user_id}` ya emitido desde webhooks).
5. **CSP nonce overhead** — F1 introdujo nonce por request; medir impacto en TTFB en producción con los snapshots de baseline como referencia.

## Cómo verificar en producción

- Tras deploy: `curl -I https://afiladocs.com/ | grep -i 'x-nextjs-cache\|age'`. En la primera request tras el deploy debe verse `x-nextjs-cache: MISS`; en las siguientes, `HIT` hasta que pasen 3600 s o se llame a `revalidateProductsCache()`.
- Tocar un producto en `/ops/productos` → recargar `/` → debe mostrar el cambio inmediatamente (invalidación por tag).
- Relanzar Lighthouse sobre `https://afiladocs.com/` y comparar contra [`home-desktop.json`](./performance-baseline/home-desktop.json) — TTFB y LCP deberían bajar; FCP depende más del CSP.
