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

## Segunda tanda (este PR de seguimiento)

### `/producto/[slug]` → SSG con `generateStaticParams`

- `force-dynamic` → `revalidate = 3600` + `dynamicParams = true`.
- `generateStaticParams` pre-renderiza todos los `is_active=true` al build; cualquier slug nuevo se genera bajo demanda por ISR y queda cacheado.
- Verificado en build: aparece como `●` (SSG) en la tabla de `next build`.

### `/tienda/[categoria]` → SSG con categorías conocidas

- `force-dynamic` → `revalidate = 3600`.
- `generateStaticParams` devuelve los 7 valores de `VALID` (enum cerrado). Quedan todos pre-renderizados con `1h 1y` según el build.

### `/tienda` (raíz con `?cat=`)

- Retirado `force-dynamic`. El page sigue siendo `ƒ` dinámico porque consume `searchParams`, pero el acceso a DB viaja por `unstable_cache` (catálogo cacheado 1 h).
- Migración completa a estático exige refactor: mover el filtrado a client component con `useSearchParams()`. Queda como deuda; ROI bajo hasta que subamos el catálogo por encima de ~50 productos.

### RUM / Web Vitals

Ya estaban cableados en [`src/app/layout.tsx`](../src/app/layout.tsx): `<Analytics />` (@vercel/analytics) + `<SpeedInsights />` (@vercel/speed-insights). No requieren cambios.

### Bundle budget (snapshot 2026-04-15)

`npm run analyze` contra este branch. First Load JS compartido: **103 kB gzip**.

Rutas más pesadas:
| Ruta | Page JS | First Load |
|------|---------|------------|
| `/` (home) | 42.5 kB | 234 kB |
| `/producto/[slug]` | 6.2 kB | 207 kB |
| `/` (portal/ops, varios) | ~3 kB | ~185 kB |

Top módulos compartidos (gzip):
- `react-dom-client` · 54 kB — framework, inevitable.
- Cliente Supabase (`GoTrueClient`, `realtime-js`, `phoenix`) · ~30 kB acumulado — presente en marketing público aunque allí no se necesita sesión.
- `sonner` · 9 kB — toast global.
- `framer-motion` (`create-projection-node` y otros) · 5-6 kB visibles, probablemente mayor al tirar del grafo.
- Varios Radix UI · 3-6 kB cada uno.

Candidatos a optimización en PR separado (ROI descendente):
1. **Quitar Supabase del bundle de marketing**. El cliente `@supabase/ssr` sólo hace falta en rutas `/portal` y `/ops`. Revisar dónde lo importa `layout.tsx` o componentes compartidos. Ahorro estimado: ~30 kB gzip en home.
2. **Dynamic-import de `framer-motion`** en secciones que sólo animan al scroll (Hero, Process steps). Next/dynamic + ssr:false donde no aporte a LCP.
3. **Audit de Lucide React** — usar solo `lucide-react` con imports nombrados (ya lo hacemos) y verificar que Turbopack/webpack está tree-shaking correctamente.

## Qué queda pendiente en F5

Ordenado por ROI descendente:

1. **Bundle wins** — sacar Supabase y framer-motion del First Load de marketing (ver arriba).
2. **PPR en `/tienda`** — una vez Next 15 estabilice Partial Prerendering, migrar la raíz de `/tienda` a static shell + Suspense boundary por filtro.
3. **Cache granular en portal** — `/portal/pedidos` y `/portal/pedido/[id]` hoy leen Supabase por request. Estudiar `unstable_cache` por `user_id` (tag `orders-${user_id}` ya emitido desde webhooks).
4. **CSP nonce overhead** — F1 introdujo nonce por request; medir impacto en TTFB con los snapshots de [`docs/performance-baseline/`](./performance-baseline/) como referencia.

## Cómo verificar en producción

- Tras deploy: `curl -I https://afiladocs.com/ | grep -i 'x-nextjs-cache\|age'`. En la primera request tras el deploy debe verse `x-nextjs-cache: MISS`; en las siguientes, `HIT` hasta que pasen 3600 s o se llame a `revalidateProductsCache()`.
- Tocar un producto en `/ops/productos` → recargar `/` → debe mostrar el cambio inmediatamente (invalidación por tag).
- Relanzar Lighthouse sobre `https://afiladocs.com/` y comparar contra [`home-desktop.json`](./performance-baseline/home-desktop.json) — TTFB y LCP deberían bajar; FCP depende más del CSP.
