import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface DocumentCompletedEmailProps {
  userName: string
  productName: string
  portalUrl: string
}

export const DocumentCompletedEmail = ({ userName, productName, portalUrl }: DocumentCompletedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>¡Tu documento está listo y firmado! - Afiladocs</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-emerald-200 rounded-lg p-8 max-w-xl border-t-4 border-t-emerald-500 shadow-sm">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-blue-600">Portal</span>
            </Text>
            
            <Heading className="text-2xl font-bold text-emerald-900 mb-4 flex items-center gap-2">
              🎉 Documento completado
            </Heading>
            
            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Hola {userName}, nos complace informarte de que <strong>{productName}</strong> ya cuenta con todas las firmas oportunas y ha sido archivado oficialmente.
            </Text>

            <Section className="text-center mt-8 mb-8 p-6 bg-emerald-50 rounded-lg border border-emerald-100">
              <Link 
                href={portalUrl}
                className="bg-emerald-600 text-white rounded-md px-6 py-3 text-base font-semibold inline-block shadow-sm"
              >
                Descargar copia certificada
              </Link>
            </Section>

            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Tanto tú como las otras partes habéis recibido el registro de auditoría de Documenso acreditando la firma con sello de tiempo oficial.
            </Text>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              Una copia segura quedará resguardada en los servidores de Afiladocs mientras tu cuenta esté activa.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default DocumentCompletedEmail
