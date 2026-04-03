import { publicEnv } from '@/lib/env'

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
      name: 'Selecciona tu documento',
      text: 'Elige el documento que necesitas en nuestra tienda: contratos, recursos, informes y más.',
      url: `${siteUrl}/tienda`,
    },
    {
      '@type': 'HowToStep',
      position: 2,
      name: 'Completa el formulario de datos',
      text: 'Rellena el formulario con la información necesaria para personalizar tu documento. Todo online, sin visitas.',
    },
    {
      '@type': 'HowToStep',
      position: 3,
      name: 'Recibe tu documento',
      text: 'Tu abogado redacta y revisa el documento. Lo recibes en tu portal en un plazo de 24–48 horas.',
    },
  ],
}

const faqSchema = {
  '@context': 'https://schema.org',
  '@type': 'FAQPage',
  mainEntity: [
    {
      '@type': 'Question',
      name: '¿Cuánto tarda la entrega del documento?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'El plazo habitual es de 24 a 48 horas hábiles desde que nos envías los datos necesarios.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Los documentos son legalmente válidos?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Todos los documentos son redactados y revisados por abogados colegiados y tienen plena validez jurídica en España.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Qué pasa si necesito modificaciones?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Incluimos una ronda de ajustes sin coste adicional. Si necesitas cambios sustanciales, te lo indicamos antes de proceder.',
      },
    },
    {
      '@type': 'Question',
      name: '¿Puedo solicitar una consulta antes de comprar?',
      acceptedAnswer: {
        '@type': 'Answer',
        text: 'Sí. Ofrecemos una primera valoración gratuita a través de nuestro formulario de contacto.',
      },
    },
  ],
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
