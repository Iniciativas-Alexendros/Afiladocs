import { notFound } from 'next/navigation'
import { unstable_cache } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { FileText, Download, AlertCircle } from 'lucide-react'
import { DownloadSignedButton } from './DownloadSignedButton'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { formatCurrency } from '@/lib/format'

export const metadata = {
  title: 'Detalles del Pedido | Afiladocs',
}

interface PageProps {
  params: Promise<{ id: string }>
}

export default async function OrderDetailPage({ params }: PageProps) {
  const user = await requireAuth()
  const resolvedParams = await params
  const { id } = resolvedParams

  const getOrder = unstable_cache(
    () => prisma.orders.findFirst({
      where: {
        id: id,
        user_id: user.id
      },
      include: {
        documents: true,
      }
    }),
    [`portal-order-${id}-${user.id}`],
    { tags: ['orders', `orders-${user.id}`, `order-${id}`], revalidate: 60 },
  )

  const order = await getOrder()

  if (!order) {
    notFound()
  }

  const isIntakePending = order.status === 'intake_pending'

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Breadcrumbs items={[
          { label: 'Portal', href: '/portal' },
          { label: 'Mis Pedidos', href: '/portal/pedidos' },
          { label: `Pedido ${order.product_id}` },
        ]} />
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-foreground">
            Pedido {order.product_id}
          </h1>
          <div>
            <OrderStatusBadge status={order.status} />
          </div>
        </div>
        <p className="text-muted-foreground mt-2">
          Adquirido el {new Date(order.created_at).toLocaleDateString('es-ES', {
            year: 'numeric', month: 'long', day: 'numeric'
          })}
        </p>
      </div>

      <div className="grid gap-8 md:grid-cols-3">
        {/* Main Content Area */}
        <div className="md:col-span-2 flex flex-col gap-8">

          {isIntakePending && (
            <Card className="border-amber-200 bg-amber-50 shadow-sm">
              <CardHeader>
                <CardTitle className="text-amber-900 flex items-center">
                  <AlertCircle className="mr-2 size-5 text-amber-600" />
                  Acción requerida: Formulario de datos
                </CardTitle>
                <CardDescription className="text-amber-700">
                  Para comenzar a redactar tu informe o documento legal, necesitamos que completes el formulario de información base.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <Button asChild className="bg-amber-600 hover:bg-amber-700 text-white font-medium">
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
                <div className="rounded-md border border-dashed border-border bg-muted/50 p-6 text-center">
                  <FileText className="mx-auto size-8 text-muted-foreground" />
                  <p className="mt-2 text-sm text-muted-foreground">
                    Aún no hay documentos generados. En cuanto estén listos, aparecerán aquí.
                  </p>
                </div>
              ) : (
                <ul role="list" className="divide-y divide-border border rounded-md">
                  {order.documents.map((doc) => {
                    const docStatusMap: Record<string, string> = { draft: 'Borrador', final: 'Versión final' }
                    const docStatusLabel = docStatusMap[doc.status] ?? doc.status
                    return (
                    <li key={doc.id} className="flex items-center justify-between p-4 hover:bg-muted/50 transition-colors">
                      <div className="flex items-center gap-x-3">
                        <FileText className="size-5 text-primary" />
                        <div>
                          <p className="text-sm font-medium text-foreground">Documento v{doc.version}</p>
                          <p className="text-xs text-muted-foreground">{docStatusLabel}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {doc.draft_pdf_path && doc.status !== 'final' && (
                          <Button variant="outline" size="sm" asChild>
                            <a href={doc.draft_pdf_path} target="_blank" rel="noopener noreferrer">
                              <Download className="mr-2 size-4" /> Borrador
                            </a>
                          </Button>
                        )}
                        {doc.status === 'final' && doc.signed_pdf_path && (
                          <DownloadSignedButton documentId={doc.id} />
                        )}
                        {doc.status === 'pending_signature' && (
                          <Button size="sm">
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
        <div className="flex flex-col gap-8">
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Resumen del pedido</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 text-sm text-muted-foreground">
              <div className="flex justify-between py-1 border-b border-border">
                <span className="font-medium text-foreground">ID Referencia</span>
                <span className="font-mono">{order.id.slice(0, 8)}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="font-medium text-foreground">Servicio</span>
                <span>{order.product_id}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-border">
                <span className="font-medium text-foreground">Importe</span>
                <span>{formatCurrency(order.amount_cents, order.currency)}</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="font-medium text-foreground">Nivel eIDAS</span>
                <span className="uppercase">{order.eidas_level}</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
