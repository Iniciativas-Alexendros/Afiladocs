import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { ArrowRight } from 'lucide-react'

export const metadata = {
  title: 'Gestión de Pedidos | Ops',
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'intake_pending':
      return <span className="inline-flex items-center rounded-full bg-amber-50 px-2.5 py-1 text-sm font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Esperando Intake</span>
    case 'processing':
      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10">Redactando</span>
    case 'completed':
      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-1 text-sm font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Finalizado</span>
    default:
      return <span className="inline-flex items-center rounded-full bg-slate-50 px-2.5 py-1 text-sm font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{status}</span>
  }
}

export default async function OpsOrdersPage() {
  await requireRole(['admin', 'ops'])

  const orders = await prisma.orders.findMany({
    include: {
      user: {
        select: { full_name: true }
      }
    },
    orderBy: { created_at: 'desc' },
    take: 50,
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Gestión de Pedidos</h1>
        <p className="text-slate-500 mt-2">Listado de todos los pedidos históricos y activos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos 50 pedidos</CardTitle>
          <CardDescription>Haz clic en un pedido para gestionarlo, subir documentos o ver su intake form.</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full text-sm text-left">
              <thead className="text-xs text-slate-500 uppercase bg-slate-50">
                <tr>
                  <th scope="col" className="px-6 py-3">ID Pedido</th>
                  <th scope="col" className="px-6 py-3">Cliente</th>
                  <th scope="col" className="px-6 py-3">Servicio</th>
                  <th scope="col" className="px-6 py-3">Estado</th>
                  <th scope="col" className="px-6 py-3">Importe</th>
                  <th scope="col" className="px-6 py-3 text-right">Acción</th>
                </tr>
              </thead>
              <tbody>
                {orders.map(order => (
                  <tr key={order.id} className="bg-white border-b hover:bg-slate-50">
                    <td className="px-6 py-4 font-mono text-xs">{order.id.slice(0,8)}</td>
                    <td className="px-6 py-4">
                      {order.user?.full_name ?? order.user_id.slice(0, 8)}
                    </td>
                    <td className="px-6 py-4 font-medium">{order.product_id}</td>
                    <td className="px-6 py-4">
                      {getStatusBadge(order.status)}
                    </td>
                    <td className="px-6 py-4">
                      {(order.amount_cents / 100).toLocaleString('es-ES', { style: 'currency', currency: order.currency.toUpperCase() })}
                    </td>
                    <td className="px-6 py-4 text-right">
                      <Link href={`/ops/pedido/${order.id}`} className="font-medium text-blue-600 hover:text-blue-800 flex justify-end items-center">
                        Gestionar <ArrowRight className="ml-1 h-4 w-4" />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
