import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface WelcomeEmailProps {
  userName: string
  loginUrl: string
}

export const WelcomeEmail = ({ userName, loginUrl }: WelcomeEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Bienvenido a Afiladocs - Tu plataforma Legaltech</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-slate-200 rounded-lg p-8 max-w-xl">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-blue-600">Portal</span>
            </Text>
            
            <Heading className="text-2xl font-bold text-slate-900 mb-4">
              ¡Bienvenido, {userName}!
            </Heading>
            
            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Gracias por unirte a Afiladocs. A partir de ahora podrás gestionar todos tus documentos legales, informes de compliance y automatizaciones jurídicas desde tu panel de cliente de forma rápida y segura.
            </Text>

            <Section className="text-center mt-8 mb-8 rounded-lg bg-blue-50 py-6">
              <Link 
                href={loginUrl}
                className="bg-blue-600 text-white rounded-md px-6 py-3 text-base font-semibold inline-block"
              >
                Acceder a mi panel
              </Link>
            </Section>

            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Si tienes alguna duda o necesitas un desarrollo a medida, no dudes en contactarnos respondiendo a este correo.
            </Text>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              Equipo de Afiladocs • Legaltech Inteligente
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default WelcomeEmail
