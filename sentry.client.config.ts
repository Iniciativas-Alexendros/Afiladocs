import * as Sentry from '@sentry/nextjs'

// Only initialize Sentry when DSN is configured
const dsn = process.env.NEXT_PUBLIC_SENTRY_DSN
if (dsn) {
  Sentry.init({
    dsn,
    environment: process.env.NEXT_PUBLIC_VERCEL_ENV ?? 'development',
    // Reduce sample rate in development to avoid noise
    tracesSampleRate: process.env.NEXT_PUBLIC_VERCEL_ENV === 'production' ? 0.2 : 0,
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
}
