import { publicEnv } from '@/lib/env'

// Structured data JSON-LD — componente server-side (RSC por defecto, sin 'use client')
// Mejora el rich snippets en Google Search para servicios legales.

const legalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: 'afiladocs',
  // URL dinámica: subdominio .vercel.app hasta que se adquiera el dominio propio
  url: publicEnv.siteUrl,
  description: 'Redacción y revisión de documentos legales a precio cerrado. Valencia, España.',
  areaServed: { '@type': 'Country', name: 'Spain' },
  serviceType: 'Servicios jurídicos a precio cerrado',
  priceRange: 'Desde 90€',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Valencia',
    addressRegion: 'Comunidad Valenciana',
    addressCountry: 'ES',
  },
  sameAs: [],
}

export function JsonLd() {
  return (
    <script
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(legalServiceSchema) }}
    />
  )
}
