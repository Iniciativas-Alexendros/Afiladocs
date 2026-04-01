import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface SubscriptionActiveEmailProps {
  userName: string
  productName: string
  nextBillingDate: string
  portalUrl: string
}

export const SubscriptionActiveEmail = ({ userName, productName, nextBillingDate, portalUrl }: SubscriptionActiveEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Suscripción activada - Afiladocs</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-slate-200 rounded-lg p-8 max-w-xl shadow-sm">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-blue-600">Portal</span>
            </Text>
            
            <Heading className="text-2xl font-bold text-slate-900 mb-4">
              🛡️ Tu suscripción ha comenzado
            </Heading>
            
            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Hola {userName}, tu suscripción a <strong>{productName}</strong> está oficialmente activa.
            </Text>
            
            <Text className="text-base text-slate-600 mb-4 leading-relaxed">
              A partir de este momento, nuestros sistemas monitorizarán el panorama normativo. Si detectamos un cambio legal que afecte a tu negocio (BOE, jurisprudencia relevante, etc.), actualizaremos tus documentos de forma proactiva.
            </Text>

            <Section className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-8 mt-6">
              <Text className="text-sm text-slate-500 m-0">Próximo cargo estimado:</Text>
              <Text className="text-base font-semibold text-slate-900 mt-1 mb-0">{nextBillingDate}</Text>
            </Section>

            <Section className="text-center mt-8 mb-8">
              <Link 
                href={portalUrl}
                className="bg-slate-900 text-white rounded-md px-6 py-3 text-base font-semibold inline-block shadow-sm"
              >
                Gestionar suscripción
              </Link>
            </Section>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              Puedes cancelar o modificar tu suscripción en cualquier momento desde tu panel de cliente.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default SubscriptionActiveEmail
