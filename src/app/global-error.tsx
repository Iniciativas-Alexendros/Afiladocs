'use client'

import { useEffect } from 'react'
import Link from 'next/link'
import * as Sentry from '@sentry/nextjs'

export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string }
  reset: () => void
}) {
  useEffect(() => {
    Sentry.captureException(error, {
      tags: { route: 'global.error', digest: error.digest },
    })
    console.error(JSON.stringify({
      event: 'global.error',
      message: error.message,
      digest: error.digest ?? null,
      stack: process.env.NODE_ENV === 'development' ? error.stack : undefined,
      ts: new Date().toISOString(),
    }))
  }, [error])

  return (
    <html lang="es">
      <body
        style={{
          display: 'flex',
          minHeight: '100vh',
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'column',
          gap: '1.5rem',
          padding: '1rem',
          textAlign: 'center',
          fontFamily: 'system-ui, sans-serif',
          background: '#fff',
          color: '#111',
        }}
      >
        <h1 style={{ fontSize: '1.875rem', fontWeight: 700, margin: 0 }}>
          Error crítico del sistema
        </h1>
        <p style={{ color: '#6b7280', maxWidth: '28rem', margin: 0 }}>
          Ha ocurrido un error inesperado al cargar la aplicación. Por favor,
          recarga la página.
        </p>
        {error.digest && (
          <p
            style={{
              fontFamily: 'monospace',
              fontSize: '0.75rem',
              color: '#9ca3af',
              margin: 0,
            }}
          >
            Referencia: {error.digest}
          </p>
        )}
        <div style={{ display: 'flex', gap: '1rem' }}>
          <button
            onClick={() => reset()}
            style={{
              background: '#111',
              color: '#fff',
              border: 'none',
              borderRadius: '0.375rem',
              padding: '0.625rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              cursor: 'pointer',
            }}
          >
            Reintentar
          </button>
          <Link
            href="/"
            style={{
              border: '1px solid #e5e7eb',
              borderRadius: '0.375rem',
              padding: '0.625rem 1.5rem',
              fontSize: '0.875rem',
              fontWeight: 500,
              textDecoration: 'none',
              color: '#111',
            }}
          >
            Volver al inicio
          </Link>
        </div>
      </body>
    </html>
  )
}
