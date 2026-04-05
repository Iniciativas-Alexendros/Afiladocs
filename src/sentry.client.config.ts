import * as Sentry from '@sentry/nextjs'

Sentry.init({
  dsn: process.env.NEXT_PUBLIC_OBSERVABILITY_SENTRY_DSN ?? 'https://44d3053d4ff114af023e6f31cf071447@o4511156887814144.ingest.de.sentry.io/4511156890173520',
  environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',

  // Performance Monitoring — 10% en producción, 100% en desarrollo
  tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 0.1 : 1.0,

  // Session Replay — captura 100% de sesiones con error, 10% de sesiones normales
  replaysOnErrorSampleRate: 1.0,
  replaysSessionSampleRate: 0.1,

  debug: false,

  integrations: [
    Sentry.replayIntegration({
      maskAllText: true,
      blockAllMedia: true,
    }),
  ],
})

export const onRouterTransitionStart = Sentry.captureRouterTransitionStart;
