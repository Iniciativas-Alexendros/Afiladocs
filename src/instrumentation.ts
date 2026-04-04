/**
 * Next.js Instrumentation
 * Se ejecuta una sola vez al iniciar el servidor (Cold Start)
 * https://nextjs.org/docs/app/building-your-application/optimizing/instrumentation
 */
export async function register() {
  // Runtime Node.js
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    // OpenTelemetry
    try {
      const { registerOTel } = await import('@vercel/otel');
      registerOTel({ serviceName: 'afiladocs' });
    } catch (err) {
      console.error('[Instrumentation] Error initializing OpenTelemetry:', err);
    }

    // Sentry Server
    try {
      await import('./sentry.server.config');
    } catch (err) {
      console.error('[Instrumentation] Error initializing Sentry Server:', err);
    }
  }

  // Runtime Edge
  if (process.env.NEXT_RUNTIME === 'edge') {
    try {
      await import('./sentry.edge.config');
    } catch (err) {
      console.error('[Instrumentation] Error initializing Sentry Edge:', err);
    }
  }
}

// Re-exportar onRequestError desde Sentry para capturar excepciones automáticamente
export { onRequestError } from '@sentry/nextjs';
