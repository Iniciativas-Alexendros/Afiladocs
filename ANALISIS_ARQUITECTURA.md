# 🏗️ Análisis Jerarquizado de Arquitectura y Stack Tecnológico - Afiladocs

Este documento proporciona una radiografía técnica y estructural exhaustiva del proyecto **Afiladocs**, diseñada para facilitar futuras validaciones, auditorías y ajustes arquitectónicos con precisión milimétrica.

---

## 1. 🌐 Conexiones e Integraciones (Infraestructura y Servicios de Terceros)

La arquitectura de red y despliegue se apoya en una combinación de infraestructura autoalojada y servicios SaaS (Software as a Service) clave para el flujo de negocio:

- **Infraestructura de Hosting:**
  - **Hostinger VPS / Cloud:** Entorno de despliegue principal de producción.
  - **Nginx:** Actúa como *Reverse Proxy* gestionando la terminación SSL/TLS (Let's Encrypt).
  - **PM2 (Cluster Mode):** Gestor de procesos Node.js que asegura alta disponibilidad y balanceo de carga interno en el VPS.
- **Integraciones de Terceros (SaaS / API):**
  - **Stripe Checkout (API v2025-03-31.basil):** Pasarela de pagos principal para la tienda digital. Se integra dinámicamente (`dynamic import`) para evitar bloqueos en el build, delegando la carga PCI-DSS a la sesión hospedada de Stripe.
  - **n8n (Webhook Relay):** Orquestador de automatización (autoalojado o cloud) empleado como *backend* sin código para procesar los leads de los formularios de contacto y conectarlos con un CRM o notificaciones por email.
- **DevSecOps:**
  - **GitLab CI/CD:** Orquestación de pipelines automáticos para integración, linting, análisis estático y despliegue hacia entornos de producción.

---

## 2. 🛠️ Herramientas Core (Frameworks y Lenguajes)

El motor principal del proyecto utiliza las versiones más recientes ('Bleeding Edge' estabilizado) del ecosistema web moderno:

- **Framework Principal:** **Next.js 15.3.1**
  - Emplea el paradigma **App Router** (`src/app`).
  - Uso intensivo de Server Components (RSC) para mejorar LCP y SEO, combinados con Client Components para la interactividad.
  - Utiliza **Turbopack** para un entorno de desarrollo de latencia ultra baja.
- **Runtime UI:** **React 19.1.0**
- **Lenguaje de Programación:** **TypeScript 5.8.x**
  - Configurado bajo modo estricto continuo y validación de tipos sin emisión (`tsc --noEmit`).
- **Motor de Estilos:** **Tailwind CSS v4.1.4**
  - Integrado vía `@tailwindcss/postcss`. Uso de variables CSS nativas (HSL) para la gestión del (*Design System*) e inicialización de modo oscuro/claro de forma nativa.

---

## 3. 📦 Ecosistema de Paquetes y Librerías

La selección de dependencias sigue principios de minimalismo, accesibilidad (WCAG) y seguridad. No se utilizan meta-frameworks pesados sobre React que no aporten valor directo.

### A. Interfaz de Usuario (UI) y Componentes Base

- **shadcn/ui (Radix UI Primitives):** `<Accordion>`, `<Dialog>`, `<HoverCard>`, `<ScrollArea>`, etc. Base de la UI head-less que asegura comportamiento accesible y full keyboard navigation.
- **lucide-react (v0.469):** Sistema iconográfico SVG optimizado y unificado.
- **vaul:** Para drawers de alta calidad en dispositivos móviles (ej. carrito interactivo responsivo).

### B. Funcionalidad Crítica: Formularios y Validación

- **react-hook-form (v7.71):** Gestión del ciclo de vida del formulario (Contacto) sin re-renders innecesarios mediante *uncontrolled components*.
- **zod (v4.3):** Declaración de esquemas (schemas) para validación estricta de *runtime data* y derivación de tipos estáticos TypeScript de frontera a frontera (End-to-end type safety).
- **@hookform/resolvers:** Puente entre React Hook Form y Zod.

### C. Experiencia de Usuario (Micro-interacciones)

- **framer-motion (v11):** Orquestador de animaciones de entrada, mount/unmount de elementos dinámicos y transiciones complejas.
- **embla-carousel-react (v8):** Carruseles fluidos para (e.g. testimonios), altamente optimizado.
- **sonner:** Sistema de notificaciones *Toast* montado fuera del DOM convencional para alerts de éxito/error de feedback inmediato.
- **tw-animate-css:** Utilidades adicionales para Tailwind en micro-animaciones CSS-only.

### D. Utilidades Estructurales

- **clsx & tailwind-merge:** Herramienta fundacional (`cn()` method en `src/lib/utils.ts`) para la composición condicional de clases optimizada evitando colisiones de Tailwind.
- **stripe (Node SDK):** Para gestionar interacciones server-side con la API de Stripe en la ruta API privada.

### E. Security & Code Quality (Dev Dependencies)

- **ESLint 9 (Flat Config):**
  - `eslint-plugin-sonarjs`: Para detección de complejidad ciclomática.
  - `eslint-plugin-security`: Identificación de patrones OWASP y vulnerabilidades de inyección RegExp/Node.
  - `eslint-plugin-promise`: Prevención de antipatrones asíncronos.
- **ts-prune & depcheck:** Análisis de dependencias huérfanas o no utilizadas, garantizando árbol de importaciones esbelto.

---

## 4. 🏛️ Arquitectura de Software y Patrones de Diseño

El proyecto sigue una estructura limpia basada en principios SOLID modificados adaptados a React/Next.js:

1. **Enrutamiento y Backend-for-Frontend (BFF):**
   - `src/app/api`: Rutas de frontera que ocultan secretos y realizan validaciones Zod server-side antes de comunicarse con servicios externos.
     - `POST /api/checkout`: Reemplaza dependencias de comercio propietario, orquestando una Checkout Session segura de Stripe con los items inyectados desde en estado cliente global.
     - `POST /api/contact`: Sanitiza y reenvía solicitudes al webhook n8n para segregación de responsabilidad de mailing/CRM.
2. **Lógica Desacoplada (Custom Hooks):**
   - `src/hooks/`: Aisla el estado complejo (`useCart`, `useContactForm`) inyectándolo en Componentes presentacionales. Esto permite reemplazar UIs enteras sin tocar lógica de negocio.
3. **Persistencia Efímera Local:**
   - Estado de e-commerce delegado a un contexto global (`CartProvider`) que rehidrata la sesión del carrito en `localStorage` del lado del cliente, permitiendo funcionamiento PWA/Offline-ready en la interacción inicial de compras.
4. **Component Driven Architecture (CDA):**
   - Separación estricta entre **Smart Components** (que consumen Hooks y mutan estado de Cart) y **Dumb Components** (UI Components puramente posicionales/estéticos como `ServiceCard`, `TrustBullet`, que se definen por sus Props Contracts estáticos).
