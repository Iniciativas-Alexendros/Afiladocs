# afilodocs — Next.js 15

Website de afilodocs migrado a Next.js 15 + TypeScript + Tailwind v4 + App Router.

## Desarrollo

```bash
npm install
npm run dev
```

## Variables de entorno

Crea un archivo `.env.local`:

```env
# Stripe (configurar cuando esté listo)
STRIPE_SECRET_KEY=sk_test_...

# Webhook n8n para el formulario de contacto
N8N_CONTACT_WEBHOOK_URL=https://n8n.example.com/webhook/contact
```

## Producción

```bash
npm run build
npm start
```

La app usa `output: "standalone"` en `next.config.ts` para despliegue con PM2.
