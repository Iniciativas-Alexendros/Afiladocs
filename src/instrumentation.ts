export async function register() {
  // OpenTelemetry — solo en runtime Node.js (no en Edge runtime)
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { registerOTel } = await import('@vercel/otel')
    registerOTel({ serviceName: 'afiladocs' })
  }

  // Sentry — server-side initialization
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    await import('../sentry.server.config')
  }

  if (process.env.NEXT_RUNTIME === 'edge') {
    await import('../sentry.edge.config')
  }
}

export const onRequestError = async (
  err: Error & { digest?: string },
  request: { path: string; method: string; headers: Record<string, string | string[] | undefined> },
  context: { routerKind: string; routePath: string; renderSource: string }
) => {
  // Forward unhandled request errors to Sentry
  if (process.env.NEXT_RUNTIME === 'nodejs') {
    const { captureRequestError } = await import('@sentry/nextjs')
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    captureRequestError(err, request as any, context as any)
  }
}
