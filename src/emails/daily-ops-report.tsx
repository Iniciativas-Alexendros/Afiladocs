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

interface DailyOpsReportProps {
  date: string
  newOrders: number
  signedDocuments: number
  pendingIntakes: number
  alertsReceived: number
  failedPayments: number
  activeSubscriptions: number
}

export function DailyOpsReport({
  date,
  newOrders,
  signedDocuments,
  pendingIntakes,
  alertsReceived,
  failedPayments,
  activeSubscriptions,
}: DailyOpsReportProps) {
  return (
    <Html lang="es">
      <Head />
      <Preview>Informe diario ops — {date}</Preview>
      <Body style={main}>
        <Container style={container}>
          <Text style={heading}>afiladocs · ops</Text>
          <Text style={title}>Informe diario — {date}</Text>
          <Hr style={hr} />

          <Section style={tableSection}>
            <table style={table} cellPadding={0} cellSpacing={0}>
              <tbody>
                <Row label="Pedidos nuevos" value={newOrders} />
                <Row label="Documentos firmados" value={signedDocuments} />
                <Row label="Intakes pendientes" value={pendingIntakes} warn={pendingIntakes > 5} />
                <Row label="Alertas normativas" value={alertsReceived} />
                <Row label="Pagos fallidos" value={failedPayments} warn={failedPayments > 0} />
                <Row label="Suscripciones activas" value={activeSubscriptions} />
              </tbody>
            </table>
          </Section>

          <Hr style={hr} />
          <Text style={footer}>
            Generado automáticamente · afiladocs.com/ops
          </Text>
        </Container>
      </Body>
    </Html>
  )
}

function Row({ label, value, warn }: { label: string; value: number; warn?: boolean }) {
  return (
    <tr>
      <td style={cellLabel}>{label}</td>
      <td style={{ ...cellValue, color: warn ? '#dc2626' : '#111827' }}>
        {value}
      </td>
    </tr>
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
  fontWeight: '700' as const,
  color: '#111827',
  margin: '0 0 4px',
}

const title = {
  fontSize: '18px',
  fontWeight: '600' as const,
  color: '#374151',
  margin: '0 0 16px',
}

const hr = {
  borderColor: '#e5e7eb',
  margin: '16px 0',
}

const tableSection = {
  margin: '16px 0',
}

const table = {
  width: '100%' as const,
  borderCollapse: 'collapse' as const,
}

const cellLabel = {
  fontSize: '14px',
  color: '#6b7280',
  padding: '8px 0',
  borderBottom: '1px solid #f3f4f6',
}

const cellValue = {
  fontSize: '16px',
  fontWeight: '600' as const,
  textAlign: 'right' as const,
  padding: '8px 0',
  borderBottom: '1px solid #f3f4f6',
}

const footer = {
  fontSize: '13px',
  color: '#9ca3af',
  margin: '4px 0',
}
