import { Body, Container, Head, Heading, Html, Link, Preview, Section, Text, Tailwind } from '@react-email/components'
import * as React from 'react'

interface IntakeRequiredEmailProps {
  userName: string
  productName: string
  intakeUrl: string
}

export const IntakeRequiredEmail = ({ userName, productName, intakeUrl }: IntakeRequiredEmailProps) => {
  return (
    <Html>
      <Head />
      <Preview>Acción requerida: Faltan datos para tu informe</Preview>
      <Tailwind>
        <Body className="bg-slate-50 font-sans">
          <Container className="mx-auto mt-8 mb-8 bg-white border border-amber-200 rounded-lg p-8 max-w-xl border-t-4 border-t-amber-500 shadow-sm">
            <Text className="text-2xl font-bold text-slate-900 tracking-tight mb-6">
              Afiladocs<span className="text-amber-600">Portal</span>
            </Text>
            
            <Heading className="text-2xl font-bold text-slate-900 mb-4">
              Necesitamos información tuya
            </Heading>
            
            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Hola {userName}, para poder redactar con precisión el documento <strong>{productName}</strong>, necesitamos que completes un breve formulario de datos (Intake Form).
            </Text>

            <Section className="text-center mt-8 mb-8">
              <Link 
                href={intakeUrl}
                className="bg-amber-600 text-white rounded-md px-6 py-3 text-base font-semibold inline-block shadow-sm"
              >
                Completar datos del pedido
              </Link>
            </Section>

            <Text className="text-base text-slate-600 mb-6 leading-relaxed">
              Este paso es esencial. Una vez nos envíes los datos, el plazo de entrega comenzará a correr y recibirás el borrador en breve.
            </Text>

            <Text className="text-sm text-slate-400 mt-12 border-t border-slate-100 pt-6">
              Si ignoras este mensaje, el servicio quedará paralizado.
            </Text>
          </Container>
        </Body>
      </Tailwind>
    </Html>
  )
}

export default IntakeRequiredEmail
