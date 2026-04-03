import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { FileText, ArrowRight, AlertCircle, Clock, Users } from 'lucide-react'

export const metadata = {
  title: 'Ops Dashboard | Afiladocs',
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'intake_pending':
      return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Esperando cliente</span>
    case 'processing':
      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Para redactar</span>
    default:
      return <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{status}</span>
  }
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
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Panel de Operaciones</h1>
        <p className="text-slate-500 mt-2">Visión global accionable de los pedidos y clientes.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card className="border-blue-200 shadow-sm bg-blue-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Para Redactar (Processing)</CardTitle>
            <Clock className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalProcessing}</div>
            <p className="text-xs text-slate-500">Pedidos listos para intervención legal</p>
          </CardContent>
        </Card>
        
        <Card className="border-amber-200 shadow-sm bg-amber-50/50">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Esperando Cliente</CardTitle>
            <AlertCircle className="h-4 w-4 text-amber-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalPendingIntake}</div>
            <p className="text-xs text-slate-500">Falta rellenar el formulario (Intake)</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-slate-800">Suscripciones Activas</CardTitle>
            <Users className="h-4 w-4 text-emerald-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-slate-900">{totalActiveSubscriptions}</div>
            <p className="text-xs text-slate-500">Subscripciones en vigor actualmente</p>
          </CardContent>
        </Card>
      </div>

      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Pedidos que requieren atención</h2>
          <Link href="/ops/pedidos" className="text-sm font-medium text-blue-600 hover:text-blue-500 flex items-center">
            Ver todos los pedidos <ArrowRight className="ml-1 h-4 w-4" />
          </Link>
        </div>

        {pendingOrders.length === 0 ? (
          <div className="rounded-xl border border-dashed border-slate-300 bg-white p-8 text-center">
            <h3 className="mt-4 font-semibold text-slate-900">Todo al día</h3>
            <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
              No hay pedidos pendientes de procesamiento activo actualmente.
            </p>
          </div>
        ) : (
          <div className="rounded-xl border border-slate-200 bg-white shadow-sm overflow-hidden">
            <ul role="list" className="divide-y divide-slate-100">
              {pendingOrders.map((order) => (
                <li key={order.id} className="relative flex items-center justify-between gap-x-6 px-4 py-5 hover:bg-slate-50 sm:px-6 transition-colors">
                  <div className="flex min-w-0 gap-x-4 items-center">
                    <div className="h-10 w-10 flex-shrink-0 rounded-full bg-slate-100 flex items-center justify-center">
                      <FileText className="h-5 w-5 text-slate-600" />
                    </div>
                    <div className="min-w-0 flex-auto">
                      <p className="text-sm font-semibold leading-6 text-slate-900">
                        <Link href={`/ops/pedido/${order.id}`}>
                          <span className="absolute inset-x-0 -top-px bottom-0" />
                          {order.product_id}
                        </Link>
                      </p>
                      <p className="mt-1 flex text-xs leading-5 text-slate-500 line-clamp-1">
                        Cliente: {order.user?.full_name ?? order.user_id.slice(0, 8)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-x-4">
                    <div className="hidden sm:flex sm:flex-col sm:items-end">
                      {getStatusBadge(order.status)}
                    </div>
                    <ArrowRight className="h-5 w-5 flex-none text-slate-400" aria-hidden="true" />
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
