import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface SignatureRequiredEmailProps {
  userName: string
  productName: string
  signUrl: string
}

export const SignatureRequiredEmail = ({ userName, productName, signUrl }: SignatureRequiredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Tu firma es requerida - Afiladocs</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-indigo-200 rounded-lg p-8 max-w-xl border-t-4 border-t-indigo-500 shadow-sm">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-blue-600">Portal</span>
            </Text>
            
            <Heading className="text-2xl font-bold text-slate-900 mb-4">
              Documento pendiente de firma
            </Heading>
            
            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Hola {userName}, hemos enviado a través de nuestro proveedor de firma cualificada (DocuSeal) el documento finalizado de: <strong>{productName}</strong>.
            </Text>

            <Section className="text-center mt-8 mb-8 p-6 bg-slate-50 rounded-lg">
              <Link 
                href={signUrl}
                className="bg-indigo-600 text-white rounded-md px-6 py-3 text-base font-semibold inline-block shadow-sm"
              >
                Acceder a DocuSeal para firmar
              </Link>
            </Section>

            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              La firma tiene validez legal plena gracias a nuestro sistema de e-signature avanzado. Te notificaremos cuando todas las partes involucradas hayan firmado.
            </Text>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              No respondas a este correo. Para dudas, dirígete al soporte oficial en tu portal.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default SignatureRequiredEmail
