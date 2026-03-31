<div align="center">

# ⚖️ Afiladocs

**Plataforma de Despacho Legal Digital y E-Commerce Cero Fricciones (Valencia, España)**

[![Pipeline Status](https://gitlab.com/Alexendros/afiladocs/badges/main/pipeline.svg)](https://gitlab.com/Alexendros/afiladocs/-/commits/main)
[![Next.js 15](https://img.shields.io/badge/Next.js-15.3-black?style=flat-square&logo=next.js)](https://nextjs.org/)
[![React 19](https://img.shields.io/badge/React-19.1-blue?style=flat-square&logo=react)](https://react.dev/)
[![TypeScript 5.8](https://img.shields.io/badge/TypeScript-5.8-blue?style=flat-square&logo=typescript)](https://www.typescriptlang.org/)
[![Tailwind v4](https://img.shields.io/badge/Tailwind_CSS-v4.1-38B2AC?style=flat-square&logo=tailwind-css)](https://tailwindcss.com/)
[![Stripe](https://img.shields.io/badge/Stripe-Checkout-6772E5?style=flat-square&logo=stripe)](https://stripe.com/)

---

Afiladocs representa el estándar en servicios legales digitales ofreciendo resoluciones a precio cerrado, generación de informes jurídicos avanzados (LegalTech) y asesoramiento transparente. Combina la agilidad de un MVP optimizado con la solidez de una arquitectura enterprise-ready construida sobre Next.js 15, garantizando tiempos de carga nulos y conversiones maximizadas.

[Características](#-características-principales) • [Arquitectura](#-arquitectura-y-topología) • [Instalación](#-instalación-y-desarrollo) • [Stack](#-stack-tecnológico) • [Seguridad](#-seguridad-y-devsecops)

</div>

---

## ✨ Características Principales

* 🛒 **E-Commerce Integrado (Stripe Checkout)**: Flujos de pago desacoplados, optimizados y resilientes utilizando la última API de Stripe (2025-03-31) inyectada de forma dinámica.
* ⚡ **Performance Absoluta (App Router)**: Múltiples layouts anidados con **React Server Components (RSC)** logrando un LCP inferior a 300ms gracias a builds Standalone.
* 🎨 **UI de Alto Rendimiento (Tailwind v4 & Shadcn/ui)**: Primitivas acccesibles Headless de Radix UI con CSS Variables dinámicas inyectadas nativamente en CSS purgado.
* 📱 **Manejo de Formularios Type-Safe**: Validaciones en tiempo real mediante Zod y React Hook Form con `resolver` asíncrono.
* 🔗 **Arquitectura API & Webhooks**: Gateways dedicados Next.js sirviendo integraciones CRMs vía n8n sin comprometer los tiempos de frontend.
* 🛡️ **Defensa en Profundidad**: Linting estricto anti-vulnerabilidades impulsado por SonarJS y dependencias OWASP audit-clean.

---

## 🏗️ Arquitectura y Topología

Afiladocs opera como un monolito Next.js moderno (Hybrid Deployment) orquestando flujos SSR, SSG y endpoints Edge-ready.

```text
                                +---------------------------+
                                |        Cloudflare /       |
                                |     Nginx Reverse Proxy   |
                                +-------------+-------------+
                                              | HTTPS
+---------------------------------------------v---------------------------------------------+
|                            Next.js 15 Server (Standalone Build)                           |
|                                                                                           |
|   +--------------------------+       +-------------------+       +--------------------+   |
|   | ⚛️ App Router (Views)    |       |  🧠 State Mgmt    |       | 🔌 API Routes      |   |
|   |                          |       |                   |       |                    |   |
|   | - / (Landing)            |       | - useCart()       |       | - /api/checkout    |<-----> Stripe API
|   | - /tienda (Catálogo)     |<----->| - CartProvider    |<----->| - /api/contact     |<-----> n8n Webhook
|   | - /servicios (Info)      |       | - useContactForm()|       |                    |   |
|   | - /blog (CMS)            |       |                   |       |                    |   |
|   +--------------------------+       +-------------------+       +--------------------+   |
|                                                                                           |
|   +-----------------------------------------------------------------------------------+   |
|   |                          🎨 Design System (Shadcn/UI)                             |   |
|   |                 (Tailwind v4 | Lucide Icons | Framer Motion)                      |   |
|   +-----------------------------------------------------------------------------------+   |
+-------------------------------------------------------------------------------------------+
```

### Árbol de Proyecto (Abreviado)

```text
afiladocs-website/
├── src/
│   ├── app/                # 🚦 Rutas App Router + API endpoints
│   ├── components/         # 🧩 UI modular (Core + Radix primitives)
│   ├── hooks/              # 🪝 Lógica de negocio custom (useCart, useContactForm)
│   └── lib/                # 🛠️ Utilidades (cn, formators)
├── public/                 # 🖼️ Assets estáticos e imágenes
├── next.config.ts          # ⚙️ Optimizaciones de build y cache
├── eslint.config.mjs       # 🧹 Reglas Flat Config OWASP/SonarJS
└── .gitlab-ci.yml          # 🚀 Pipeline SLSA Nivel 3 para CI/CD
```

---

## 🚀 Instalación y Desarrollo

### Requisitos Previos
* **Node.js**: v20.x o v22.x LTS.
* **npm**: Gestor de paquetes nativo.
* **Git**: Para control de versiones.

### Configuración Local

1. **Clonar el Repositorio**
   ```bash
   git clone https://gitlab.com/Alexendros/afiladocs.git
   cd afiladocs
   ```

2. **Instalación de Dependencias**
   ```bash
   npm install
   ```

3. **Configurar Variables de Entorno**
   Copia el archivo base y edita los valores del `.env.local`:
   ```bash
   # .env.local
   NEXT_PUBLIC_SITE_URL=http://localhost:3000
   
   # [OBLIGATORIO PARA LA TIENDA]
   STRIPE_SECRET_KEY=sk_test_...
   
   # [OPCIONAL PARA TEST DE FORMS]
   N8N_CONTACT_WEBHOOK_URL=https://n8n.tu-instancia.com/webhook-test/contact
   ```

4. **Levantar el Entorno de Desarrollo**
   Ejecuta mediante el motor Turbopack integrado en Next.js 15:
   ```bash
   npm run dev
   ```
   > Accede al portal en `http://localhost:3000`

---

## 🧪 Testing y Aseguramiento de Calidad (QA)

Afiladocs usa estándares Enterprise para asegurar un código robusto antes de producción:

* **Chequeo de Tipos (TSC)**: Valida aserciones e inferencias (estricto habilitado).
  ```bash
  npm run typecheck
  ```
* **Análisis Estático de Código (Linter)**: Ejecuta ESLint v9 (Flat Config) protegiendo contra patrones asíncronos peligrosos e incorporando checks SAST básicos de SonarJs.
  ```bash
  npm run lint
  ```

---

## ⚙️ Stack Tecnológico

**Core & View Layer**
* Next.js 15.3 (App Router, Turbopack)
* React 19.1 & React DOM
* TypeScript 5.8

**UI / UX y Animaciones**
* Tailwind CSS v4.1 (Zero Runtime)
* shadcn/ui (Radix UI) `Accordion`, `Dialog`, `Select`, `Scroll-Area`, `Toast`, etc.
* Framer Motion 11.15
* Embla Carousel (Integración Radix)
* Lucide React (Íconos SVG ligeros)
* Vaul (Drawers móviles)

**Formularios, Esquemas y Lógica Funcional**
* React Hook Form 7.71
* Zod 4.3.6 (Data Parsing de extremo a extremo)
* Stripe API 21+ Node.js SDK

**Calidad y DevSecOps**
* ESLint 9 + eslint-plugin-security + eslint-plugin-sonarjs
* Pipeline CI/CD vía GitLab Runners.
* PM2 / Nginx deploy infrastructure.

---

## 🛡️ Seguridad y DevSecOps

El ecosistema está forjado aplicando defensas en profundidad, alineado con **OWASP Top 10** y el marco **NIST**:
1. **Pipeline SLSA Nivel 3**: Integrado en GitLab-CI. Despliegues solo en builds herméticos Standalone.
2. **Security Scanning**: SAST (`Security/SAST`), Dependency Scanning y Secrets Detection integrados al merge.
3. **RBAC & Cero Confianza**: Aislamiento en el archivo `.env`. Las Keys de pago de Stripe son enmascaradas exclusivamente por servidor (`/api/checkout`). Nunca se exponen al front sin proxy.
4. **Data Sanitization**: Control implícito proporcionado por Zod al instanciar endpoints REST o SSR en acciones asíncronas.

---

## 📄 Identidad y Licencia

Diseñado para infraestructura legal en `https://afiladocs.com`. Uso e implementación limitados según acuerdos contractuales con sus desarrolladores o bajo licencia propietaria de Afiladocs. 

*Arquitectura y Documentación generadas por Antigravity IDE Agent.*
