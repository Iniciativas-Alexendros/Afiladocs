import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ArrowRight, AlertCircle, Clock, Users } from 'lucide-react'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'

export const metadata = {
  title: 'Ops Dashboard | Afiladocs',
}

export default async function OpsDashboardPage() {
  await requireRole(['admin', 'ops'])

  // Fetch pending action orders
  const pendingOrders = await prisma.orders.findMany({
    where: {
      status: { in: ['intake_pending', 'processing'] }
    },
    include: {
      user: {
        select: { full_name: true }
      }
    },
    orderBy: { created_at: 'desc' },
    take: 10,
  })

  // Global counts for fast metrics
  const totalProcessing = pendingOrders.filter(o => o.status === 'processing').length
  const totalPendingIntake = pendingOrders.filter(o => o.status === 'intake_pending').length

  const totalActiveSubscriptions = await prisma.subscriptions.count({
    where: { status: 'active' }
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Panel de Operaciones</h1>
        <p className="text-muted-foreground mt-2">Visión global accionable de los pedidos y clientes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-blue-200 shadow-sm bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Para Redactar (Processing)</CardTitle>
            <Clock className="size-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalProcessing}</div>
            <p className="text-xs text-muted-foreground">Pedidos listos para intervención legal</p>
          </CardContent>
        </Card>

        <Card className="border-amber-200 shadow-sm bg-amber-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Esperando Cliente</CardTitle>
            <AlertCircle className="size-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalPendingIntake}</div>
            <p className="text-xs text-muted-foreground">Falta rellenar el formulario (Intake)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones Activas</CardTitle>
            <Users className="size-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{totalActiveSubscriptions}</div>
            <p className="text-xs text-muted-foreground">Subscripciones en vigor actualmente</p>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Pedidos que requieren atención</h2>
          <Link href="/ops/pedidos" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center transition-colors">
            Ver todos los pedidos <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-border bg-card p-8 text-center">
            <h3 className="mt-4 font-semibold text-foreground">Todo al día</h3>
            <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
              No hay pedidos pendientes de procesamiento activo actualmente.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-border bg-card shadow-sm overflow-hidden">
            <ul role="list" className="divide-y divide-border">
              {pendingOrders.map((order) => (
                <li key={order.id} className="relative flex items-center justify-between gap-x-6 px-4 py-5 hover:bg-muted/50 sm:px-6 transition-colors">
                  <div className="flex min-w-0 gap-x-4 items-center">
                    <div className="size-10 shrink-0 rounded-full bg-muted flex items-center justify-center">
                      <FileText className="size-5 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-foreground">
                        <Link href={`/ops/pedido/${order.id}`}>
                          <span className="absolute inset-x-0 -top-px bottom-0" />
                          {order.product_id}
                        </Link>
                      </p>
                      <p className="mt-1 flex text-xs leading-5 text-muted-foreground line-clamp-1">
                        Cliente: {order.user?.full_name ?? order.user_id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <div className="flex sm:hidden">
                      <OrderStatusBadge status={order.status} compact />
                    </div>
                    <ArrowRight className="size-5 flex-none text-muted-foreground" aria-hidden="true" />
                  </div>
                </li>
              ))}
            </ul>
          </div>
        )}
      </div>
    </div>
  )
}
