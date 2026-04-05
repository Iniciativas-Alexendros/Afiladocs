import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface SlaAlertEmailProps {
  overdueCount: number
  documents: Array<{
    orderId: string
    productId: string
    customerName: string
    daysPending: number
  }>
  opsUrl: string
}

export const SlaAlertEmail = ({ overdueCount, documents, opsUrl }: SlaAlertEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>{`${String(overdueCount)} documentos pendientes de firma superan el SLA de 7 dias`}</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-amber-200 rounded-lg p-8 max-w-xl border-t-4 border-t-amber-500 shadow-sm">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-amber-600">Ops</span>
            </Text>

            <Heading className="text-xl font-bold text-slate-900 mb-4">
              Alerta SLA: {overdueCount} documento{overdueCount > 1 ? 's' : ''} pendiente{overdueCount > 1 ? 's' : ''} de firma
            </Heading>

            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Los siguientes documentos llevan mas de 7 dias enviados a firma sin completarse:
            </Text>

            {documents.map((doc) => (
              <Section key={doc.orderId} className="bg-slate-50 border border-slate-100 rounded-lg p-4 mb-3">
                <Text className="text-sm text-slate-900 m-0 font-semibold">{doc.productId}</Text>
                <Text className="text-sm text-slate-600 m-0">Cliente: {doc.customerName}</Text>
                <Text className="text-sm text-amber-600 m-0">{doc.daysPending} dias pendiente</Text>
              </Section>
            ))}

            <Section className="text-center mt-8 mb-8">
              <Link
                href={opsUrl}
                className="bg-amber-600 text-white rounded-md px-6 py-3 text-base font-semibold inline-block"
              >
                Ver panel de operaciones
              </Link>
            </Section>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              Alerta automatica del sistema de monitoreo SLA — Afiladocs
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default SlaAlertEmail
