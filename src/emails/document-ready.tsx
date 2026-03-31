import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface DocumentReadyEmailProps {
  userName: string
  productName: string
  version: string
  documentUrl: string
}

export const DocumentReadyEmail = ({ userName, productName, version, documentUrl }: DocumentReadyEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Tu documento (v{version}) ha sido redactado - Afiladocs</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-blue-200 rounded-lg p-8 max-w-xl border-t-4 border-t-blue-500 shadow-sm">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-blue-600">Portal</span>
            </Text>
            
            <Heading className="text-2xl font-bold text-slate-900 mb-4">
              Borrador disponible para revisión
            </Heading>
            
            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Hola {userName}, nuestro equipo y sistemas algorítmicos han finalizado la versión {version} de tu <strong>{productName}</strong>.
            </Text>

            <Section className="text-center mt-8 mb-8">
              <Link 
                href={documentUrl}
                className="bg-blue-600 text-white rounded-md px-6 py-3 text-base font-semibold inline-block shadow-sm"
              >
                Revisar documento ahora
              </Link>
            </Section>

            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Por favor, verifica el documento en tu panel. Si está correcto, puedes aprobarlo para pasar a firma. Si necesitas ajustes, detalla en la misma plataforma qué cambios precisas.
            </Text>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              Afiladocs · La nueva forma de entender los servicios legales
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default DocumentReadyEmail
