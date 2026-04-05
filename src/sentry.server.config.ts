import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: 'https://44d3053d4ff114af023e6f31cf071447@o4511156887814144.ingest.de.sentry.io/4511156890173520',
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
  tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 0.1 : 1.0,
  debug: false,
  // GDPR/LOPDGDD — no enviar PII por defecto
  sendDefaultPii: false,
})
