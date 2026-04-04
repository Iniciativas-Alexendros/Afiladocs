import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { notFound } from 'next/navigation'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { User, Briefcase, FileText } from 'lucide-react'
import { ChangeStatusForm, UploadDocumentForm } from './OpsForms'
import { IntakeDataViewer } from './IntakeDataViewer'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { formatCurrency } from '@/lib/format'

export const metadata = {
  title: 'Detalle de Pedido | Ops',
}

function IntakeContent({ status, intakeData }: { status: string; intakeData: Record<string, unknown> | null }) {
  if (status === 'intake_pending' && !intakeData) {
    return (
      <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
        <p className="text-sm text-amber-700">El cliente aún no ha rellenado el formulario de datos. No se debería comenzar la redacción.</p>
      </div>
    )
  }

  if (intakeData) {
    return <IntakeDataViewer data={intakeData} />
  }

  return <p className="text-sm text-muted-foreground">Sin datos de intake disponibles.</p>
}

export default async function OpsOrderDetailPage(props: { params: Promise<{ id: string }> }) {
  await requireRole(['admin', 'ops'])
  const { id } = await props.params

  const order = await prisma.orders.findUnique({
    where: { id },
    include: {
      user: true,
      documents: true,
      audit_log: { orderBy: { created_at: 'desc' }, take: 5 }
    }
  })

  if (!order) notFound()

  return (
    <div className="flex flex-col gap-8 max-w-5xl mx-auto">
      <div>
        <Breadcrumbs items={[
          { label: 'Ops', href: '/ops' },
          { label: 'Pedidos', href: '/ops/pedidos' },
          { label: `Pedido #${order.id.split('-')[0]}` },
        ]} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground flex items-center gap-3">
          Pedido <span className="text-muted-foreground font-mono text-lg font-normal">#{order.id.split('-')[0]}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info lateral */}
        <div className="flex flex-col gap-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="size-5 text-muted-foreground" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-2 text-sm">
                <p><span className="text-muted-foreground">ID:</span> {order.user_id.slice(0, 8)}</p>
                <p><span className="text-muted-foreground">Nombre:</span> {order.user?.full_name}</p>
                <p><span className="text-muted-foreground">Registro:</span> {order.user?.created_at?.toLocaleDateString('es-ES')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="size-5 text-muted-foreground" />
                Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex flex-col gap-4 text-sm">
                <div>
                  <p className="text-muted-foreground mb-1">Producto</p>
                  <p className="font-medium text-foreground">{order.product_id}</p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Importe pagado</p>
                  <p className="font-medium text-foreground">
                    {formatCurrency(order.amount_cents, order.currency)}
                  </p>
                </div>
                <div>
                  <p className="text-muted-foreground mb-1">Estado actual</p>
                  <Badge variant="outline" className="font-mono text-xs">
                    {order.status}
                  </Badge>

                  <Separator className="my-4" />
                  <p className="text-xs font-semibold text-foreground uppercase mb-2">Cambiar estado manualmente</p>
                  <ChangeStatusForm orderId={order.id} currentStatus={order.status} />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zona principal */}
        <div className="flex flex-col gap-6 md:col-span-2">

          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Intake Data (Formulario de cliente)</CardTitle>
            </CardHeader>
            <CardContent>
              <IntakeContent status={order.status} intakeData={order.intake_data as Record<string, unknown> | null} />
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="size-5 text-muted-foreground" />
                Gestión Documental
              </CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-8">

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">1. Subir Borrador / Documento para aprobación</h3>
                <p className="text-sm text-muted-foreground">Sube aquí el PDF generado. Esto cambiará el estado a `draft_ready` y avisará al cliente.</p>
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <UploadDocumentForm orderId={order.id} type="draft" />
                </div>
              </div>

              <div className="flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-foreground border-b border-border pb-2">2. Subir Documento Final Firmado</h3>
                <p className="text-sm text-muted-foreground">Sube aquí el PDF validado o finalizado (si no se usa la API de Documenso). Cambiará a `completed`.</p>
                <div className="p-4 bg-muted rounded-lg border border-border">
                  <UploadDocumentForm orderId={order.id} type="signed" />
                </div>
              </div>

              {order.documents.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xs font-semibold uppercase text-muted-foreground mb-3">Documentos adjuntos al pedido</h4>
                  <ul className="text-sm flex flex-col gap-2">
                    {order.documents.map(doc => (
                      <li key={doc.id} className="flex items-center gap-2 font-mono text-xs">
                        <Badge variant="outline" className="text-xs">{doc.status}</Badge>
                        {doc.draft_pdf_path && <span>Draft: {doc.draft_pdf_path.split('/').pop()}</span>}
                        {doc.signed_pdf_path && <span>Final: {doc.signed_pdf_path.split('/').pop()}</span>}
                      </li>
                    ))}
                  </ul>
                </div>
              )}

            </CardContent>
          </Card>

        </div>
      </div>
    </div>
  )
}
