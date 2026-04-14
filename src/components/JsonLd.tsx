import { publicEnv } from '@/lib/env'
import { FAQ_ITEMS } from '@/lib/faq-data'

// Structured data JSON-LD — componente server-side (RSC por defecto, sin 'use client')
// Mejora el rich snippets en Google Search para servicios legales.

const siteUrl = publicEnv.siteUrl

const legalServiceSchema = {
  '@context': 'https://schema.org',
  '@type': 'LegalService',
  name: 'afiladocs',
  url: siteUrl,
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

const organizationSchema = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'afiladocs',
  url: siteUrl,
  logo: `${siteUrl}/logo.png`,
  description: 'Plataforma de servicios legales digitales. Documentos jurídicos redactados por abogados a precio cerrado.',
  address: {
    '@type': 'PostalAddress',
    addressLocality: 'Valencia',
    addressRegion: 'Comunidad Valenciana',
    addressCountry: 'ES',
  },
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer support',
    availableLanguage: 'Spanish',
    url: `${siteUrl}/contacto`,
  },
}

const howToSchema = {
  '@context': 'https://schema.org',
  '@type': 'HowTo',
  name: 'Cómo solicitar un documento legal en afiladocs',
  description: 'Obtén tu documento jurídico en 3 pasos sencillos, sin cita previa y a precio cerrado.',
  totalTime: 'PT48H',
  step: [
    {
      '@type': 'HowToStep',
      position: 1,
      name: 'Elige tu documento',
      text: 'Selecciona el documento que necesitas en nuestra tienda: contratos, recursos, informes y más. El precio es cerrado y visible antes de pagar.',
      url: `${siteUrl}/tienda`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Personaliza los datos',
      text: 'Rellena el formulario online con tu información. Nuestro equipo lo personaliza para tu caso concreto.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Firma y descarga',
      text: 'Recibe tu documento firmado digitalmente (eIDAS AES) en tu portal en menos de 48 horas hábiles.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: FAQ_ITEMS.map((item) => ({
    '@type': 'Question',
    name: item.q,
    acceptedAnswer: {
      '@type': 'Answer',
      text: item.a,
    },
  })),
}

export function JsonLd() {
  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(legalServiceSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
    </>
  )
}
