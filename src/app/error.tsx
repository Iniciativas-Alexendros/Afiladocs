'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

export default function ErrorPage({
  error: err,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(err, {
      tags: { route: 'app.error', digest: err.digest },
    })
    console.error(JSON.stringify({
      event: 'app.error',
      message: err.message,
      digest: err.digest ?? null,
      stack: process.env.NODE_ENV === 'development' ? err.stack : undefined,
      ts: new Date().toISOString(),
    }))
  }, [err])

  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center gap-6 px-4 text-center">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">
          Algo salió mal
        </h1>
        <p className="text-muted-foreground max-w-md">
          Ha ocurrido un error inesperado. Puedes intentarlo de nuevo o volver
          al inicio.
        </p>
      </div>
      <div className="flex gap-4">
        <button
          onClick={() => reset()}
          className="bg-primary text-primary-foreground hover:bg-primary/90 rounded-md px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Reintentar
        </button>
        <Link
          href="/"
          className="border-border hover:bg-accent rounded-md border px-6 py-2.5 text-sm font-medium transition-colors"
        >
          Volver al inicio
        </Link>
      </div>
    </div>
  )
}
