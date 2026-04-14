import {
  Body,
  Button,
  Container,
  Head,
  Hr,
  Html,
  Preview,
  Section,
  Text,
} from '@react-email/components'

interface ReviewReadyProps {
  userName: string
  productName: string
  portalUrl: string
  reviewerNote?: string
}

export function ReviewReady({
  userName,
  productName,
  portalUrl,
  reviewerNote,
}: ReviewReadyProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Tu revisión de {productName} está lista</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>afiladocs</Text>
          <Text style={title}>Tu revisión experta está lista</Text>
          <Hr style={hr} />
          <Text style={body}>Hola {userName},</Text>
          <Text style={body}>
            Hemos terminado la revisión de tu <strong>{productName}</strong>. Puedes descargar el PDF anotado y la nota del abogado desde tu portal.
          </Text>
          {reviewerNote && (
            <Section style={detailsBox}>
              <Text style={detailRow}>
                <strong>Resumen del revisor:</strong> {reviewerNote}
              </Text>
            </Section>
          )}
          <Section style={{ textAlign: 'center', margin: '28px 0' }}>
            <Button href={portalUrl} style={btn}>
              Ver revisión
            </Button>
          </Section>
          <Hr style={hr} />
          <Text style={footer}>
            Dudas: <a href="mailto:hola@afiladocs.com">hola@afiladocs.com</a>
          </Text>
          <Text style={footer}>afiladocs · Valencia, España</Text>
        </Container>
      </Body>
    </Html>
  )
}

const main = { backgroundColor: '#f9fafb', fontFamily: "'DM Sans', Arial, sans-serif" }
const container = { margin: '0 auto', padding: '32px 24px', maxWidth: '560px', backgroundColor: '#ffffff', borderRadius: '8px' }
const heading = { fontSize: '22px', fontWeight: '700', color: '#111827', margin: '0 0 4px' }
const title = { fontSize: '18px', fontWeight: '600', color: '#374151', margin: '0 0 16px' }
const body = { fontSize: '15px', color: '#374151', lineHeight: '1.6', margin: '0 0 12px' }
const btn = { backgroundColor: '#111827', color: '#ffffff', padding: '12px 20px', borderRadius: '6px', fontSize: '15px', fontWeight: '600', textDecoration: 'none' }
const detailsBox = { backgroundColor: '#f3f4f6', borderRadius: '6px', padding: '12px 16px', margin: '16px 0' }
const detailRow = { fontSize: '14px', color: '#374151', margin: '4px 0' }
const hr = { borderColor: '#e5e7eb', margin: '16px 0' }
const footer = { fontSize: '13px', color: '#9ca3af', margin: '4px 0' }
