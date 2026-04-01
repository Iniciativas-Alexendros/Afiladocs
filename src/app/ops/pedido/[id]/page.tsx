import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, User, Briefcase, FileText } from 'lucide-react'
import { ChangeStatusForm, UploadDocumentForm } from './OpsForms'

export const metadata = {
  title: 'Detalle de Pedido | Ops',
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

  const intakeDataStr = order.intake_data ? JSON.stringify(order.intake_data, null, 2) : 'No se han rellenado los datos.'

  return (
    <div className="space-y-8 max-w-5xl mx-auto">
      <div>
        <Link href="/ops/pedidos" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver a pedidos
        </Link>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900 flex items-center gap-3">
          Pedido <span className="text-slate-400 font-mono text-lg font-normal">#{order.id.split('-')[0]}</span>
        </h1>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Info lateral */}
        <div className="space-y-6 md:col-span-1">
          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <User className="h-5 w-5 text-slate-400" />
                Cliente
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 text-sm">
                <p><span className="text-slate-500">Email:</span> {order.user?.email}</p>
                <p><span className="text-slate-500">Nombre:</span> {order.user?.full_name}</p>
                <p><span className="text-slate-500">Registro:</span> {order.user?.created_at?.toLocaleDateString('es-ES')}</p>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-4">
              <CardTitle className="text-lg flex items-center gap-2">
                <Briefcase className="h-5 w-5 text-slate-400" />
                Pedido
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-sm">
                <div>
                  <p className="text-slate-500 mb-1">Producto</p>
                  <p className="font-medium text-slate-900">{order.product_id}</p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Importe pagado</p>
                  <p className="font-medium text-slate-900">
                    {(order.amount_cents / 100).toLocaleString('es-ES', { style: 'currency', currency: order.currency.toUpperCase() })}
                  </p>
                </div>
                <div>
                  <p className="text-slate-500 mb-1">Estado actual</p>
                  <p className="font-mono text-xs bg-slate-100 px-2 py-1 rounded w-fit">{order.status}</p>
                  
                  <div className="mt-4 border-t pt-4">
                    <p className="text-xs font-semibold text-slate-700 uppercase mb-2">Cambiar estado manualmente</p>
                    <ChangeStatusForm orderId={order.id} currentStatus={order.status} />
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Zona principal */}
        <div className="space-y-6 md:col-span-2">
          
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Intake Data (Formulario de cliente)</CardTitle>
            </CardHeader>
            <CardContent>
              {order.status === 'intake_pending' && !order.intake_data ? (
                <div className="rounded-md bg-amber-50 p-4 border border-amber-200">
                  <p className="text-sm text-amber-700">El cliente aún no ha rellenado el formulario de datos. No se debería comenzar la redacción.</p>
                </div>
              ) : (
                <pre className="bg-slate-900 text-slate-50 p-4 rounded-md text-xs overflow-x-auto font-mono">
                  {intakeDataStr}
                </pre>
              )}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <FileText className="h-5 w-5 text-slate-400" />
                Gestión Documental
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-8">
              
              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">1. Subir Borrador / Documento para aprobación</h3>
                <p className="text-sm text-slate-500">Sube aquí el PDF generado. Esto cambiará el estado a `draft_ready` y avisará al cliente.</p>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <UploadDocumentForm orderId={order.id} type="draft" />
                </div>
              </div>

              <div className="space-y-4">
                <h3 className="text-sm font-semibold text-slate-800 border-b pb-2">2. Subir Documento Final Firmado</h3>
                <p className="text-sm text-slate-500">Sube aquí el PDF validado o finalizado (si no se usa la API de Documenso). Cambiará a `completed`.</p>
                <div className="p-4 bg-slate-50 rounded-lg border border-slate-200">
                  <UploadDocumentForm orderId={order.id} type="signed" />
                </div>
              </div>

              {order.documents.length > 0 && (
                <div className="mt-8">
                  <h4 className="text-xs font-semibold uppercase text-slate-500 mb-3">Documentos adjuntos al pedido</h4>
                  <ul className="text-sm space-y-2">
                    {order.documents.map(doc => (
                      <li key={doc.id} className="flex items-center gap-2 font-mono text-xs">
                        <span className="bg-slate-100 px-2 py-1 rounded">{doc.status}</span>
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
