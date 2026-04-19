# Fase 3 — UX, conversión y pulido

**Duración estimada:** 3 semanas (5 sub-fases A–E)
**Prioridad:** Alta (impacto directo en funnel de ventas)
**Dependencias:** F2 UI_GUIDE (para garantizar coherencia con design system)

## Estado de avance (2026-04-15)

| Sub-fase | Estado | PR | Commit |
|----------|--------|----|--------|
| 3.1 — Limpieza de rutas | ✅ Cerrada | #10 | `d7aa94d` |
| 3.2 — Home rediseñada | ✅ Cerrada | #12 | `3aa4afa` |
| 3.3 — Schema.org enrichment | ✅ Cerrada | #12 | `3aa4afa` |
| 3.4 — Tienda y landings | 🔲 Pendiente | — | — |
| 3.5 — Intake form enterprise | 🔲 Pendiente | — | — |
| 3.6 — Portal cliente rediseñado | 🔲 Pendiente | — | — |
| 3.7 — Header / Footer | 🔲 Pendiente | — | — |

## Objetivo

Subir la tasa de conversión del funnel `/` → `/tienda` → checkout → portal, dejar solo lo que vende o da credibilidad y mejorar la percepción enterprise. Las páginas ya tienen contenido real; esta fase añade CRO, SEO estructurado, pulido del panel cliente y limpieza de rutas placeholder.

Métricas objetivo:
- **Core Web Vitals (RUM)**: LCP < 2.5s, INP < 200ms, CLS < 0.1 en `/`, `/tienda`, `/portal`.
- **Lighthouse Mobile** ≥ 90 en Performance, Accessibility, Best Practices, SEO — en `/` y una ficha de producto.
- **axe-core**: 0 violations *serious* o *critical* en `/`, `/tienda`, `/producto/[slug]`, `/portal/pedidos`.

## Premisas innegociables

- **WCAG 2.2 AA**. Contraste ≥ 4.5:1 texto normal, ≥ 3:1 UI.
- **Mobile-first** funcional a 360 px (breakpoints Tailwind por defecto).
- **Sin emojis** en UI salvo decoración controlada en ilustraciones SVG.
- Preservar RSC por defecto; `"use client"` sólo donde haga falta estado/eventos.
- Usar shadcn/ui primitives existentes en [src/components/ui](../src/components/ui/). No reinventar.
- Respetar CSP de [next.config.ts](../next.config.ts) — no añadir dominios externos sin actualizarla.

## Entregables

### 3.1 — Sub-fase A · Limpieza de rutas (1 PR ~ 4 h)

**Rutas a eliminar** (borrado + 301 + sitemap + JSON-LD):

| Ruta | Acción | Destino 301 |
|------|--------|-------------|
| `src/app/(marketing)/blog/` | Borrar completo | `/` |
| `src/app/(marketing)/sobre-mi/` | Borrar completo | `/contacto` |
| `src/app/(marketing)/informes-juridicos/` | Borrar (sin producto asociado) | `/` |
| `src/app/(marketing)/legaltech-ia/` | Borrar (placeholder) | `/` |

- Eliminar enlaces en `Header.tsx` y `Footer.tsx`.
- Actualizar `src/app/sitemap.ts` (regenerar tras borrado).
- Eliminar JSON-LD `BlogPosting` / `BreadcrumbList` que apunten a blog en `JsonLd.tsx`.
- Script simple de verificación post-borrado: `rg -n "blog|sobre-mi|informes-juridicos|legaltech-ia" src/` no debe devolver enlaces (sólo comentarios o contexto permitido).

**Rutas que se conservan o renuevan**:

- `/` home (rediseño — 3.2)
- `/tienda` + `/tienda/[categoria]` (pulido — 3.4)
- `/producto/[slug]` (Schema.org Product — 3.3)
- `/revisiones` landing de revisión experta
- `/suscripciones` landing de packs por suscripción
- `/servicios` nueva: tabla comparativa tienda / revisión / suscripción
- `/contacto` formulario (n8n webhook)
- `/legal/*` (no tocar)
- `/portal/*` (se extiende — 3.6)
- `/ops/*` (no tocar en este pase — queda para F4)

**Secciones "en construcción"**: si se conserva alguna landing sin producto, incluir `<Alert>` shadcn con CTA al contacto (`?referer=seccion-construccion`) y `metadata.robots = { index: false, follow: true }` hasta publicar.

### 3.2 — Sub-fase B · Home rediseñada para conversión (1 PR ~ 6 h)

**Tokens y sistema visual** en [src/app/globals.css](../src/app/globals.css):
- Paleta: mantener amber/primary del logo + neutros. Añadir acento secundario sobrio (teal 600 o indigo 600) para estados informativos.
- Tipografía (DM Sans ya cargada):
  - h1 → `text-5xl lg:text-7xl font-bold tracking-tight`
  - h2 → `text-3xl lg:text-4xl font-semibold`
  - h3 → `text-xl font-semibold`
  - body → `text-base leading-relaxed`
- Espaciado base 8 px; secciones separadas con `py-16 md:py-24`.
- Cards: `rounded-xl + border + shadow-sm`; hover eleva `hover:shadow-md` transición 150 ms.
- Focus ring visible `ring-2 ring-amber-500/60`.

**Hero** (arriba del fold, 80 vh desktop / 100 vh mobile):
- Dos columnas desktop, una en mobile.
- Izquierda: kicker pill · H1 grande · párrafo apoyo (≤ 30 palabras) · CTA primario "Ver catálogo" → `/tienda` · CTA secundario outline "Revisión experta 72 h" → `/revisiones` · 3 badges "RGPD · eIDAS · Verifactu".
- Derecha: ilustración SVG (lucide style) o grid 2×2 de mini-cards animadas con Framer Motion. **`useReducedMotion` obligatorio**.
- Fondo sutil: gradiente radial 6% opacidad o patrón grid tenue.
- `next/image` con `priority` + blur placeholder. LCP objetivo < 2.5s.

**Secciones bajo el Hero**:
1. **Cómo funciona** — 3 pasos horizontales (Lucide FileText → PenTool → ShieldCheck), microcopy ≤ 12 palabras.
2. **Catálogo destacado** — grid de 6 `ProductCard` reales (Prisma, `orderBy display_order`, `take 6`, `is_active=true`). CTA final "Ver todos →".
3. **Revisión humana** — banner con foto/ilustración, 2 métricas ("72 h SLA", "abogados colegiados"). CTA → `/revisiones`.
4. **Confianza** — tira de logos/menciones; en ausencia: 3 testimonios cortos con `<q>` semántico y `cite`.
5. **FAQ** — 6 preguntas con `<Accordion>` shadcn + `FAQPage` JSON-LD.
6. **CTA final** — full-width pre-footer, fondo primario, "¿No encuentras lo que buscas?" → `/contacto`.

Extraer secciones a `src/components/marketing/` (HeroSection, SocialProof, ProcessSteps, FaqAccordion, FinalCta).

### 3.3 — Schema.org enriquecido

Ampliar [src/components/JsonLd.tsx](../src/components/JsonLd.tsx):

- `FAQPage` en `/` y `/revisiones` (alimentado por los mismos datos del `<Accordion>`).
- `HowTo` en sección "Cómo funciona" (3 pasos).
- `BreadcrumbList` en `/tienda/[categoria]` y `/producto/[slug]`.
- `Product` en cada ficha de `/tienda` (datos Prisma).
- `Article` en blog MDX cuando F6 lo active (hasta entonces, sin `Article`).

Validar con Google Rich Results Test en preview antes de merge.

### 3.4 — Sub-fase C · Tienda y landings (1 PR ~ 4 h)

- **Tienda**: filtro por categoría (chips/pills) con estado en URL `?cat=...` (Server Component con `searchParams`) — funciona sin JS. Badge "Más popular" en flagship (hoy `AFD-PCK-001`). Modal de confirmación pre-checkout (resumen, precio, plazo, términos). Skeletons shadcn con Suspense boundary **por producto** (altura fija = CLS 0).
- **`/suscripciones`** rediseñada: comparador lado-a-lado con diferencias destacadas.
- **`/revisiones`** rediseñada: alinear con Hero de home (SLA 72 h visible arriba).
- **`/servicios`** nueva: tabla comparativa "Tienda / Revisión experta / Suscripción" con precio base, plazo SLA, eIDAS level, ejemplos de uso.
- **Sustituir** `/sobre-mi` por 301 → `/contacto`.

### 3.5 — Intake form enterprise

En `/portal/pedido/[id]/intake`:

- **Autoguardado debounced 2 s** → Server Action `saveIntakeDraft` → `orders.intake_data` (JSONB). Saltar si no hay cambios.
- **Indicador de progreso** (paso X de N) basado en campos completados sobre totales.
- **Validación por campo** con mensajes en español (no solo al submit).
- **Confirmación digital** del cliente antes del envío definitivo (checkbox + timestamp en `audit_log`).
- Tests E2E: completar intake parcial → salir → volver → datos preservados.

### 3.6 — Sub-fase D · Portal cliente rediseñado (1 PR ~ 8 h)

**Layout** ([src/app/portal/layout.tsx](../src/app/portal/layout.tsx)):
- Header con avatar y nombre; menú desplegable:
  - Mis pedidos → `/portal/pedidos`
  - Mis suscripciones → `/portal/suscripciones`
  - Datos personales → `/portal/cuenta` (**nuevo**)
  - Facturación → `/portal/facturas` (**nuevo**, listado Stripe Invoices)
  - Cerrar sesión
- Sidebar desktop con contador de pedidos activos por item.
- **Mobile**: bottom navigation fija (4 accesos: Pedidos / Suscripciones / Cuenta / Cerrar) respetando `safe-area-inset`.

**`/portal/pedidos`**: grid de tarjetas con estado visual (Pending / Awaiting signature / Delivered / Intake pending) + colores consistentes (amarillo/azul/verde/rojo). Filtro de estado + búsqueda por producto. Orden `created_at DESC`.

**`/portal/pedido/[id]`**: timeline vertical (compra → intake → firma → entrega). Panel de acciones contextuales:
- `docuseal_fill_*` → botón "Firmar ahora" (widget DocuSeal).
- `download_after_payment` → botón "Descargar" (signed URL 1 h).
- `human_review` → "Subir documentación" (Supabase Storage).
- Resumen de pago (últimos 4 dígitos, fecha, importe desde Stripe) + botón "Descargar factura" (EasyVerifactu).

**`/portal/suscripciones`**: card por suscripción con próximo cobro, días restantes, botón "Gestionar" → Stripe Customer Portal session. Banner si hay reembolso o impago.

**`/portal/cuenta`** (nuevo): formulario editable `full_name`, `company_name`, `nif`, `phone`. Avatar opcional a bucket Storage `avatars`. Preferencias: checkbox "Recibir recordatorios por email".

**`/portal/facturas`** (nuevo): tabla con número, fecha, importe, enlace PDF (Stripe hosted). Filtrable por año.

### 3.7 — Header / Footer

**Header**:
- Logo izq → `/`
- Nav central: Tienda · Revisiones · Suscripciones · Servicios · Contacto
- Derecha: carrito + "Mi portal" (si autenticado, avatar).
- Sticky header en todas las páginas; reducir padding al scroll > 40 px (`useScroll` de Framer Motion, client component mínimo).
- Banner superior opcional cerrable (cookie `afiladocs-announcement-v1`).

**Footer** (4 columnas desktop, acordeón mobile):
1. Afiladocs: misión + sello RGPD/eIDAS/Verifactu.
2. Productos: enlaces a categorías.
3. Legal: aviso, privacidad, cookies, términos.
4. Contacto: email, CIF, dirección corta.

Copyright + enlace a changelog (si existe) en la parte inferior.

### 3.8 — Sub-fase E · Accesibilidad WCAG 2.2 AA (1 PR ~ 3 h)

- Skip navigation link en root layout (`<a href="#main" class="sr-only focus:not-sr-only">`).
- Landmarks: `<header> <nav> <main id="main"> <footer>`.
- Focus visible en TODO elemento interactivo (no eliminar outline).
- `aria-label` en botones con solo icono (Cart, filtros, close).
- Formularios con `<Label htmlFor>` + `aria-describedby` para errores.
- `alt` descriptivo en imágenes; decorativas con `alt=""`.
- Menús/Sheets cierran con Escape y atrapan focus.
- Contrast audit de tokens Tailwind v4; ajustar si algún par texto/fondo baja de 4.5:1.
- Integrar `@axe-core/playwright` en `e2e/a11y.spec.ts` cubriendo `/`, `/tienda`, `/producto/[slug]`, `/portal/pedidos`.
- Auditoría Lighthouse en preview; abrir issues para fallos no resueltos en este pase.

### 3.9 — Microinteracciones y motion

- Framer Motion con `motion.div` + transición 200 ms por defecto.
- Respetar `useReducedMotion` en TODA animación no decorativa.
- Hover en ProductCard: imagen `scale 1.02` + overlay CTA "Ver detalle".
- Transiciones de página: fade opacity 0→1 en 150 ms (navegación client).
- Sin parallax ni efectos pesados en mobile.

## Criterios de aceptación (Definition of Done)

- [ ] `npm run typecheck && npm run lint && npm run test:coverage && npm run test:e2e && npm run build` → 0 errores.
- [ ] **Lighthouse Mobile** en `/` y `/producto/[slug]`: Performance ≥ 90, Accessibility ≥ 95, Best Practices ≥ 95, SEO ≥ 95.
- [ ] **axe-core** (`@axe-core/playwright`): 0 violations *serious* o *critical* en `/`, `/tienda`, `/producto/[slug]`, `/portal/pedidos`.
- [ ] **Google Rich Results Test** valida FAQPage, HowTo, Product y BreadcrumbList.
- [ ] Intake: salir a mitad de formulario y volver preserva datos (verificado por E2E).
- [ ] Filtro de tienda funciona con JS desactivado (URL params nativos, Server Component).
- [ ] No quedan imports ni enlaces a rutas eliminadas (`rg` limpio).
- [ ] Screenshots antes/después en el PR de sub-fases B y D (home, `/tienda`, `/portal/pedidos`).
- [ ] Revisado manualmente en Chrome, Firefox y Safari iOS.
- [ ] Revisado con `prefers-reduced-motion` activo (animaciones desactivadas, sin regresiones).

## Archivos a modificar

- `src/app/(marketing)/page.tsx` — rediseño Home
- `src/app/(marketing)/blog/`, `sobre-mi/`, `informes-juridicos/`, `legaltech-ia/` — **borrar**
- `src/app/(marketing)/servicios/` — **nueva**
- `src/app/(marketing)/tienda/page.tsx` + componentes — filtros, badge, modal, skeletons
- `src/app/(marketing)/suscripciones/page.tsx` — comparador
- `src/app/(marketing)/revisiones/page.tsx` — rediseño
- `src/app/portal/layout.tsx` — header + sidebar + bottom nav
- `src/app/portal/pedidos/page.tsx` — grid de cards con estado
- `src/app/portal/pedido/[id]/page.tsx` — timeline + acciones contextuales
- `src/app/portal/pedido/[id]/intake/*` — autoguardado, progreso, validación
- `src/app/portal/pedido/[id]/actions.ts` — Server Action `saveIntakeDraft`
- `src/app/portal/cuenta/page.tsx` — **nueva**
- `src/app/portal/facturas/page.tsx` — **nueva**
- `src/app/portal/suscripciones/page.tsx` — cards + Stripe Customer Portal
- `src/app/layout.tsx` — skip nav, landmarks
- `src/components/marketing/*` — **nuevos** (HeroSection, SocialProof, ProcessSteps, FaqAccordion, FinalCta)
- `src/components/Header.tsx`, `Footer.tsx` — rediseño + bottom nav mobile
- `src/components/JsonLd.tsx` — FAQPage, HowTo, Product, BreadcrumbList
- `src/app/globals.css` — tokens CSS vars (paleta + escala tipográfica)
- `src/app/sitemap.ts` — regenerar tras borrados
- `next.config.ts` — 301s de rutas borradas
- `e2e/a11y.spec.ts` (NEW), `e2e/intake.spec.ts` (NEW)

## Validación

1. Lighthouse + PageSpeed Insights en preview deployment antes de merge.
2. Google Rich Results Test en rutas con schemas nuevos.
3. Navegación sólo teclado en `/` y `/tienda`: se alcanza todo elemento interactivo.
4. Pruebas con `prefers-reduced-motion` activo.
5. DevTools preset "Mobile S" (320 px) — nada rompe.

## Riesgos

- **LCP degradado por Hero rediseñado**: medir antes/después; aplicar `priority` + `sizes` + AVIF/WebP si hace falta.
- **CLS por skeletons mal dimensionados**: altura fija igual al contenido final.
- **Autoguardado costoso en Vercel Functions**: debounce 2 s + skip-if-unchanged. Si aparece coste, considerar cliente Supabase directo (cuidando RLS).
- **SEO transitorio por borrado de rutas**: 301s configurados antes del merge + actualización del sitemap en el mismo PR.

## Lo que NO se toca en esta fase

- Flujo de checkout Stripe (ya funciona).
- Webhooks (`/api/webhooks/*`).
- Prisma schema, migraciones, seed.
- Infraestructura Vercel / Supabase.
- Panel `/ops/*` — brief independiente en [archive/fase-4-ops-avanzado.md](archive/fase-4-ops-avanzado.md) (cerrada 2026-04-15).

## Cierre

- [00-ESTADO-ACTUAL.md](00-ESTADO-ACTUAL.md) — ejes Marketing/Portal pasan a ✅ completos.
- Entry `project_f3_ux_closed.md` con métricas Core Web Vitals pre/post y capturas Lighthouse.
