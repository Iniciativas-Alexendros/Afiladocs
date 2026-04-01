import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface OrderConfirmationEmailProps {
  userName: string
  orderId: string
  productName: string
  amount: string
  portalUrl: string
}

export const OrderConfirmationEmail = ({ userName, orderId, productName, amount, portalUrl }: OrderConfirmationEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Comprobante de tu pedido - Afiladocs</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-slate-200 rounded-lg p-8 max-w-xl">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-blue-600">Portal</span>
            </Text>
            
            <Heading className="text-2xl font-bold text-slate-900 mb-4">
              Hemos recibido tu pedido
            </Heading>
            
            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Hola {userName}, gracias por tu confianza. Hemos tramitado correctamente el pago de tu pedido. A continuación tienes los detalles:
            </Text>

            <Section className="bg-slate-50 border border-slate-100 rounded-lg p-6 mb-8">
              <Text className="text-sm text-slate-500 m-0">Nº de pedido: <span className="font-mono text-slate-900">{orderId}</span></Text>
              <Text className="text-base font-semibold text-slate-900 mt-2 mb-0">{productName}</Text>
              <Text className="text-base text-slate-700 mt-1">Total abonado: <strong>{amount}</strong></Text>
            </Section>

            <Section className="text-center mt-8 mb-8">
              <Link 
                href={portalUrl}
                className="bg-slate-900 text-white rounded-md px-6 py-3 text-base font-semibold inline-block"
              >
                Ver estado de mi pedido
              </Link>
            </Section>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              Recibirás la factura por separado en los próximos días. Si necesitas ayuda, visita nuestro soporte.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default OrderConfirmationEmail
