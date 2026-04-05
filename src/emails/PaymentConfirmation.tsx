import {
  Body,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface PaymentConfirmationProps {
  customerEmail: string
  amount: string
  sessionId: string
}

export function PaymentConfirmation({
  customerEmail,
  amount,
  sessionId,
}: PaymentConfirmationProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Confirmación de pago — afiladocs</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>afiladocs</Text>
          <Text style={title}>Tu pago ha sido confirmado</Text>
          <Hr style={hr} />
          <Text style={body}>
            Hola,
          </Text>
          <Text style={body}>
            Hemos recibido correctamente tu pago de <strong>{amount}</strong>.
            En breve nos pondremos en contacto contigo en{' '}
            <strong>{customerEmail}</strong> para iniciar el trabajo.
          </Text>
          <Section style={detailsBox}>
            <Text style={detailRow}>
              <strong>Referencia:</strong> {sessionId}
            </Text>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Si tienes alguna duda, escríbenos a{' '}
            <a href="mailto:hola@afiladocs.com">hola@afiladocs.com</a>
          </Text>
          <Text style={footer}>
            afiladocs · Valencia, España
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = {
  backgroundColor: '#f9fafb',
  fontFamily: "'DM Sans', Arial, sans-serif",
}

const container = {
  margin: '0 auto',
  padding: '32px 24px',
  maxWidth: '560px',
  backgroundColor: '#ffffff',
  borderRadius: '8px',
}

const heading = {
  fontSize: '22px',
  fontWeight: '700',
  color: '#111827',
  margin: '0 0 4px',
}

const title = {
  fontSize: '18px',
  fontWeight: '600',
  color: '#374151',
  margin: '0 0 16px',
}

const body = {
  fontSize: '15px',
  color: '#374151',
  lineHeight: '1.6',
  margin: '0 0 12px',
}

const detailsBox = {
  backgroundColor: '#f3f4f6',
  borderRadius: '6px',
  padding: '12px 16px',
  margin: '16px 0',
}

const detailRow = {
  fontSize: '14px',
  color: '#374151',
  margin: '4px 0',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const footer = {
  fontSize: '13px',
  color: '#9ca3af',
  margin: '4px 0',
}
