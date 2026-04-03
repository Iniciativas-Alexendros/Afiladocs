// Server Component — sin 'use client': lee env vars en server y renderiza HTML estático.
// Solo visible en deployments de preview (ramas != main). En producción no renderiza nada.
// Documentación Vercel: https://vercel.com/docs/deployments/environments

import { publicEnv } from '@/lib/env'

export function PreviewBanner() {
  const env = publicEnv.vercelEnv

  // En producción o desarrollo local: no renderizar nada
  if (env === 'production') return null

  const branch = publicEnv.vercelGitBranch
  const sha = publicEnv.vercelGitSha

  const shaSegment = sha ? ` · ${sha}` : ''
  const previewLabel = `Preview · ${branch}${shaSegment}`
  const label = env === 'preview' ? previewLabel : 'Development · local'
  const bgColor = env === 'preview' ? '#7c3aed' : '#059669'

  return (
    <div
      role="banner"
      aria-label="Entorno de previsualización"
      style={{
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        zIndex: 9999,
        backgroundColor: bgColor,
        color: '#fff',
        fontSize: '0.75rem',
        fontFamily: 'monospace',
        fontWeight: 600,
        textAlign: 'center',
        padding: '0.25rem 1rem',
        letterSpacing: '0.02em',
        pointerEvents: 'none',
        userSelect: 'none',
      }}
    >
      {label}
    </div>
  )
}
