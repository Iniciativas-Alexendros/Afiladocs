# TEMPLATE.MD — Blueprint de Reproducción: Afiladocs

> **Propósito:** Este documento permite a cualquier agente IA (o desarrollador) reproducir el proyecto Afiladocs desde cero con plena fidelidad de arquitectura, diseño y lógica.

---

## 1. Identidad del Proyecto

| Campo         | Valor                                                   |
|---------------|---------------------------------------------------------|
| **Nombre**    | afiladocs                                               |
| **Dominio**   | https://afiladocs.com                                  |
| **Idioma**    | Español (es-ES)                                         |
| **Propósito** | Despacho de documentos legales online (Valencia, España)|
| **Modelo**    | Servicios a precio cerrado + Tienda digital con Stripe  |

---

## 2. Stack Tecnológico

```
Framework:      Next.js 15 (App Router, Turbopack dev)
Runtime:        React 19
Lenguaje:       TypeScript 5.8 (strict + noEmit typecheck)
Estilos:        Tailwind CSS v4 + tw-animate-css
UI Components:  shadcn/ui (Radix UI primitives)
Fuente:         DM Sans (Google Fonts, variable CSS)
Iconos:         lucide-react
Formularios:    react-hook-form + @hookform/resolvers + zod
Pagos:          Stripe Checkout (API version 2025-03-31.basil)
Notificaciones: sonner (toast)
Animaciones:    framer-motion + embla-carousel-react
Linting:        ESLint 9 + sonarjs + security + promise plugins
Deploy target:  Hostinger VPS · Nginx · PM2
```

---

## 3. Estructura de Directorios

```
afiladocs-website/
├── TEMPLATE.MD               ← este archivo
├── eslint.config.mjs         ← ESLint flat config con sonarjs/security/promise
├── next.config.ts
├── package.json
├── tsconfig.json
├── tailwind.config.ts        ← (generado por Tailwind v4 si necesario)
└── src/
    ├── app/                  ← App Router de Next.js
    │   ├── layout.tsx        ← Root Layout: DM Sans, CartProvider, Header, Footer, Toaster
    │   ├── globals.css       ← Tailwind v4 + CSS Variables del tema
    │   ├── page.tsx          ← Home: Hero, TrustBullets, Servicios, Proceso, Testimonios, CTA
    │   │
    │   ├── servicios/page.tsx
    │   ├── informes-juridicos/page.tsx
    │   ├── legaltech-ia/page.tsx
    │   ├── tienda/page.tsx   ← E-commerce: listado de productos Stripe
    │   ├── blog/page.tsx     ← Listado de artículos (estáticos o CMS)
    │   ├── sobre-mi/page.tsx
    │   ├── contacto/page.tsx ← Embebe <ContactForm>
    │   ├── pago-exitoso/page.tsx
    │   │
    │   ├── legal/
    │   │   ├── aviso-legal/page.tsx
    │   │   ├── privacidad/page.tsx
    │   │   ├── cookies/page.tsx
    │   │   └── condiciones-generales/page.tsx
    │   │
    │   └── api/
    │       ├── contact/route.ts    ← POST: valida y reenvía a n8n webhook
    │       └── checkout/route.ts  ← POST: crea Stripe Checkout Session
    │
    ├── components/
    │   ├── Header.tsx          ← sticky, blur, mobile menu, carrito badge
    │   ├── Footer.tsx          ← 3 columnas: brand, legal links, contacto
    │   ├── ShoppingCart.tsx    ← drawer lateral derecho con items/total/checkout
    │   ├── ContactForm.tsx     ← UI only, delega lógica a useContactForm hook
    │   ├── ServiceCard.tsx     ← card clickable con icon, title, price, link
    │   ├── TrustBullet.tsx     ← icono + texto de propuesta de valor
    │   ├── ProcessStep.tsx     ← paso numerado del proceso
    │   ├── TestimonialCard.tsx ← quote + nombre + ciudad + servicio
    │   ├── BlogCard.tsx        ← preview de artículo
    │   ├── FAQItem.tsx         ← accordion item de FAQ
    │   ├── ScrollToTop.tsx     ← botón flotante scroll to top
    │   └── ui/                 ← Componentes shadcn/ui (button, input, label…)
    │
    ├── hooks/
    │   ├── useCart.tsx         ← CartContext + CartProvider + useCart + formatCurrency
    │   ├── useContactForm.tsx  ← estado + validación + submit del formulario de contacto
    │   └── use-mobile.tsx      ← detección de viewport mobile
    │
    └── lib/
        └── utils.ts            ← cn() helper (clsx + tailwind-merge)
```

---

## 4. Sistema de Diseño (Design Tokens)

### Paleta de Colores (CSS Variables HSL, modo claro)

| Token             | HSL                | Descripción               |
|-------------------|--------------------|---------------------------|
| `--background`    | `36 20% 95%`       | Fondo principal (crema)   |
| `--foreground`    | `0 0% 10%`         | Texto principal           |
| `--primary`       | `42 52% 48%`       | Dorado/ámbar (brand)      |
| `--accent`        | `214 67% 13%`      | Azul marino oscuro        |
| `--card`          | `0 0% 100%`        | Blanco para tarjetas      |
| `--muted-fg`      | `0 0% 35%`         | Texto secundario          |
| `--border`        | `36 14% 87%`       | Borde suave cálido        |
| `--destructive`   | `0 84% 60%`        | Rojo para errores         |
| `--radius`        | `0.5rem`           | Border-radius base        |

Dark mode: `background` → `0 0% 10%`, `card` → `0 0% 15%`, misma `--primary`.

### Tipografía

- **Fuente**: DM Sans (variable `--font-sans`), subsets: `latin`, `latin-ext`
- **Aplicación**: `font-sans antialiased` en `<body>`
- **Headings**: `text-wrap: balance` para equilibrio tipográfico
- **Escala**: Tailwind estándar (text-sm / base / lg / xl / 2xl / 3xl / 4xl / 6xl)

---

## 5. Componentes — Contratos de Props

### `<Header />`
Sin props. Consume `useCart()` para badge del carrito. Estado interno: `mobileMenuOpen`, `isCartOpen`.

### `<ShoppingCart isCartOpen setIsCartOpen />`
```ts
interface ShoppingCartProps {
  isCartOpen: boolean;
  setIsCartOpen: (open: boolean) => void;
}
```
Consome `useCart()`, llama a `/api/checkout` para el pago.

### `<ContactForm preselectedService? />`
```ts
interface ContactFormProps {
  preselectedService?: string; // pre-rellena el <Select> de tipo de caso
}
```
Delega toda la lógica al hook `useContactForm(preselectedService)`.

### `<ServiceCard icon title description price link />`
```ts
interface ServiceCardProps {
  icon: LucideIcon;
  title: string;
  description: string;
  price: string;   // ej. "Desde 90 €"
  link: string;    // ruta interna
}
```

### `<TrustBullet icon text />`
```ts
{ icon: LucideIcon; text: string }
```

### `<ProcessStep number title description isLast? />`
```ts
{ number: number; title: string; description: string; isLast?: boolean }
```

### `<TestimonialCard name city service quote />`
```ts
{ name: string; city: string; service: string; quote: string }
```

### `<BlogCard />` y `<FAQItem />`
Componentes menores, props inferibles del uso en sus respectivas páginas.

---

## 6. Hooks — Lógica de Estado

### `useCart()` + `CartProvider`
- **Proveedor**: `<CartProvider>` en `layout.tsx` — envuelve toda la app.
- **Persistencia**: `localStorage` con key `"e-commerce-cart"`.
- **API expuesta**:
  ```ts
  cartItems: CartItem[]
  addToCart(product, variant, quantity, availableQuantity?) → Promise<void>
  removeFromCart(variantId: string) → void
  updateQuantity(variantId: string, quantity: number) → void
  clearCart() → void
  getCartTotal() → string   // formateado "€XX.XX"
  ```
- **Tipos clave**:
  ```ts
  CartVariant { id, title, price_in_cents, sale_price_in_cents, manage_inventory, currency_info? }
  CartProduct { id, title, image? }
  CartItem { product, variant, quantity }
  ```
- **`formatCurrency(priceInCents, currencyInfo?)`**: función exportada para mostrar precios.

### `useContactForm(preselectedService)`
- **Estado**: `formData` (name, email, case_type, message, rgpd_accepted), `isSubmitting`.
- **Submit**: valida campos requeridos + RGPD → `POST /api/contact` → toast success/error.
- **Devuelve**: `{ formData, setFormData, isSubmitting, handleSubmit }`.

### `use-mobile()`
- Detección de viewport ≤ 768px con `matchMedia` + listener de resize.

---

## 7. API Routes

### `POST /api/contact`
**Body**: `{ name, email, case_type, message, rgpd_accepted }`

**Flujo**:
1. Valida campos requeridos → `400` si faltan.
2. Si `N8N_CONTACT_WEBHOOK_URL` env está definida → reenvía el payload al webhook n8n.
3. Devuelve `{ success: true }` → `200`.

**Env**: `N8N_CONTACT_WEBHOOK_URL` (opcional).

---

### `POST /api/checkout`
**Body**: `{ items: [{ variantId, quantity }], successUrl, cancelUrl }`

**Flujo**:
1. Valida `items`, `successUrl`, `cancelUrl` → `400` si faltan.
2. Si `STRIPE_SECRET_KEY` no existe → `503` con mensaje de configuración.
3. Importa `stripe` dinámicamente (evita crash en build sin Stripe configurado).
4. Crea `stripe.checkout.sessions.create` en modo `"payment"`.
5. Devuelve `{ url: session.url }`.

**Env**: `STRIPE_SECRET_KEY` (requerida para tener e-commerce funcional).

---

## 8. Variables de Entorno

```bash
# .env.local
NEXT_PUBLIC_SITE_URL=https://afiladocs.com

# Stripe (obligatorio para la tienda)
STRIPE_SECRET_KEY=sk_live_...

# n8n (opcional, para el formulario de contacto)
N8N_CONTACT_WEBHOOK_URL=https://n8n.TU_DOMINIO/webhook/contact
```

---

## 9. Patrones de Navegación y Layout

### Árbol de navegación (`navLinks` en `Header.tsx`)
```
/ → Home
/servicios
/informes-juridicos
/legaltech-ia
/tienda
/blog
/sobre-mi
/contacto
```

### Layout Shell
```
<html lang="es">
  <body className="font-sans antialiased">
    <CartProvider>          ← estado global del carrito
      <Header />             ← sticky, z-40
      <main>{page}</main>
      <Footer />
      <Toaster />            ← sonner global
    </CartProvider>
  </body>
</html>
```

---

## 10. SEO y Metadata

Configurado en `layout.tsx` con la API de Next.js `Metadata`:
```ts
{
  title: { default: "afiladocs – ...", template: "%s | afilodocs" },
  description: "...",
  metadataBase: new URL("https://afiladocs.com"),
  openGraph: { type: "website", locale: "es_ES", siteName: "afilodocs" }
}
```
Cada página puede exportar su propio `metadata` específico sobreescribiendo el template.

---

## 11. Configuración de Calidad de Código

### `eslint.config.mjs`
```js
compat.extends(
  "next/core-web-vitals",
  "next/typescript",
  "plugin:sonarjs/recommended",   // complejidad cognitiva
  "plugin:security/recommended",  // OWASP patterns
  "plugin:promise/recommended"    // anti-patterns async
)
// Reglas adicionales:
{ "complexity": ["warn", 10], "max-depth": ["warn", 3], "max-lines": ["warn", 300] }
```

### Scripts
```json
"dev":       "next dev --turbopack"
"build":     "next build"
"start":     "next start"
"lint":      "next lint"
"typecheck": "tsc --noEmit"
```

---

## 12. Guía Rápida de Instalación

```bash
# 1. Crear proyecto
npx create-next-app@latest afiladocs --typescript --tailwind --app --src-dir

# 2. Instalar dependencias de UI
npx shadcn@latest init
npx shadcn@latest add button input label textarea checkbox select

# 3. Instalar dependencias de negocio
npm install framer-motion embla-carousel-react sonner lucide-react vaul zod react-hook-form @hookform/resolvers stripe

# 4. Dev linting
npm install -D eslint-plugin-sonarjs eslint-plugin-promise eslint-plugin-security

# 5. Copiar globals.css con los CSS variables definidos en §4

# 6. Crear archivos en este orden:
#    src/lib/utils.ts
#    src/hooks/useCart.tsx
#    src/hooks/useContactForm.tsx
#    src/hooks/use-mobile.tsx
#    src/components/Header.tsx
#    src/components/Footer.tsx
#    src/components/ShoppingCart.tsx
#    src/components/ContactForm.tsx
#    src/components/ServiceCard.tsx
#    src/components/TrustBullet.tsx
#    src/components/ProcessStep.tsx
#    src/components/TestimonialCard.tsx
#    src/app/layout.tsx  (con CartProvider, DM Sans, Header, Footer, Toaster)
#    src/app/page.tsx    (secciones: Hero, Trust, Servicios, Proceso, Testimonios, CTA)
#    src/app/api/contact/route.ts
#    src/app/api/checkout/route.ts
#    (resto de páginas de rutas)

# 7. Configurar .env.local (§8)

# 8. Validar
npm run typecheck && npm run lint && npm run build
```

---

## 13. Principios Arquitectónicos (ADRs)

| Decisión                    | Razonamiento                                                         |
|-----------------------------|----------------------------------------------------------------------|
| **App Router (Next.js 15)** | RSC nativos, layouts anidados, metadata API, streaming               |
| **Tailwind v4**             | CSS variables nativas sin PostCSS plugin externo, zero-runtime       |
| **useCart como Context**    | Estado compartido entre Header (badge) y ShoppingCart (drawer)       |
| **useContactForm (hook)**   | SRP: separa lógica de negocio del renderizado (SOLID)                |
| **Stripe dynamic import**   | Evita crash en build/deploy antes de configurar STRIPE_SECRET_KEY    |
| **n8n como backend contact**| No-code relay para CRM/email sin servidor dedicado                   |
| **shadcn/ui + Radix**       | Accesibilidad (WCAG 2.1 AA), headless, themeable con CSS variables   |
| **sonner**                  | Toasts fuera del árbol React sin portal manual, API mínima           |
| **0 vulnerabilidades**      | npm audit limpio; stripe añadido explícitamente en package.json      |
