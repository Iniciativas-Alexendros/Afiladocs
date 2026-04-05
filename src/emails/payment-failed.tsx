import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface PaymentFailedEmailProps {
  customerEmail: string
  errorMessage: string
  retryUrl: string
}

export const PaymentFailedEmail = ({ customerEmail, errorMessage, retryUrl }: PaymentFailedEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Tu pago no se ha podido procesar — Afiladocs</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-red-200 rounded-lg p-8 max-w-xl border-t-4 border-t-red-500 shadow-sm">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-red-600">Portal</span>
            </Text>

            <Heading className="text-2xl font-bold text-slate-900 mb-4">
              Problema con tu pago
            </Heading>

            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Hola, hemos detectado un problema al procesar el pago asociado a <strong>{customerEmail}</strong>.
            </Text>

            <Section className="bg-red-50 border border-red-100 rounded-lg p-6 mb-8">
              <Text className="text-sm text-red-700 m-0">
                <strong>Motivo:</strong> {errorMessage}
              </Text>
            </Section>

            <Section className="text-center mt-8 mb-8">
              <Link
                href={retryUrl}
                className="bg-slate-900 text-white rounded-md px-6 py-3 text-base font-semibold inline-block"
              >
                Reintentar pago
              </Link>
            </Section>

            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Si el problema persiste, contacta con tu banco o escríbenos a hola@afiladocs.com.
            </Text>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              Equipo de Afiladocs · Legaltech Inteligente
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default PaymentFailedEmail
