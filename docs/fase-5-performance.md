# Fase 5 — Performance y coste

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

En los webhooks que mutan datos, llamar `revalidateTag('orders')` / `revalidateTag('products')` según corresponda. Los webhooks afectados: [src/app/api/webhooks/stripe/route.ts](../src/app/api/webhooks/stripe/route.ts), [src/app/api/webhooks/docuseal/route.ts](../src/app/api/webhooks/docuseal/route.ts).

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
