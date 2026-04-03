import { notFound } from 'next/navigation'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, ArrowLeft, Download, CheckCircle2, AlertCircle, Clock } from 'lucide-react'

export const metadata = {
  title: 'Detalles del Pedido | Afiladocs',
}

interface PageProps {
  params: Promise<{ id: string }>
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'intake_pending':
      return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"><AlertCircle className="mr-1.5 h-4 w-4" /> Formulario pendiente</span>
    case 'processing':
      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"><Clock className="mr-1.5 h-4 w-4" /> En proceso de redacción</span>
    case 'completed':
      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><CheckCircle2 className="mr-1.5 h-4 w-4" /> Completado</span>
    default:
      return <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{status}</span>
  }
}

export default async function OrderDetailPage({ params }: PageProps) {
  const user = await requireAuth()
  const resolvedParams = await params
  const { id } = resolvedParams

  const order = await prisma.orders.findFirst({
    where: { 
      id: id,
      user_id: user.id 
    },
    include: {
      documents: true,
    }
  })

  if (!order) {
    notFound()
  }

  const isIntakePending = order.status === 'intake_pending'

  return (
    <div className="space-y-8">
      <div>
        <Link href="/portal" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver al panel
        </Link>
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">
            Pedido {order.product_id}
          </h1>
          <div>
            {getStatusBadge(order.status)}
          </div>
        </div>
        <p className="text-slate-500 mt-2">
          Adquirido el {new Date(order.created_at).toLocaleDateString('es-ES', { 
            year: 'numeric', month: 'long', day: 'numeric' 
          })}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content Area */}
        <div className="md:col-span-2 space-y-8">
          
          {isIntakePending && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center">
                  <AlertCircle className="mr-2 h-5 w-5 text-amber-600" /> 
                  Acción requerida: Formulario de datos
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Para comenzar a redactar tu informe o documento legal, necesitamos que completes el formulario de información base.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white font-medium">
                  {/* Redirecting to a specific intake form inside the portal */}
                  <Link href={`/portal/pedido/${order.id}/intake`}>
                    Completar Formulario
                  </Link>
                </Button>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Documentos entregados</CardTitle>
              <CardDescription>
                Historial de versiones y borradores entregables asociados a este pedido.
              </CardDescription>
            </CardHeader>
            <CardContent>
              {order.documents.length === 0 ? (
                <div className="rounded-md border border-dashed border-slate-300 bg-slate-50 p-6 text-center">
                  <FileText className="mx-auto h-8 w-8 text-slate-400" />
                  <p className="mt-2 text-sm text-slate-600">
                    Aún no hay documentos generados. En cuanto estén listos, aparecerán aquí.
                  </p>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-slate-100 border rounded-md">
                  {order.documents.map((doc) => {
                    const docStatusMap: Record<string, string> = { draft: 'Borrador', final: 'Versión final' }
                    const docStatusLabel = docStatusMap[doc.status] ?? doc.status
                    return (
                    <li key={doc.id} className="flex items-center justify-between p-4 hover:bg-slate-50 transition-colors">
                      <div className="flex items-center gap-x-3">
                        <FileText className="h-5 w-5 text-blue-600" />
                        <div>
                          <p className="text-sm font-medium text-slate-900">Documento v{doc.version}</p>
                          <p className="text-xs text-slate-500">{docStatusLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.draft_pdf_path && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.draft_pdf_path} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 h-4 w-4" /> PDF
                            </a>
                          </Button>
                        )}
                        {doc.status === 'pending_signature' && (
                          <Button size="sm" className="bg-blue-600 hover:bg-blue-700">
                            Firmar documento
                          </Button>
                        )}
                      </div>
                    </li>
                  )})}
                </ul>
              )}
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-sm text-slate-600">
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-900">ID Referencia</span>
                <span className="font-mono">{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-900">Servicio</span>
                <span>{order.product_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-slate-100">
                <span className="font-medium text-slate-900">Importe</span>
                <span>{(order.amount_cents / 100).toLocaleString('es-ES', { style: 'currency', currency: order.currency.toUpperCase() })}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-slate-900">Nivel EIDEAS</span>
                <span className="uppercase">{order.eideas_level}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
