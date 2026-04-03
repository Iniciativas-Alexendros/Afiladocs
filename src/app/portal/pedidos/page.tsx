import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { FileText, ArrowRight, AlertCircle, Clock, CheckCircle2, FilePen } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata = {
  title: 'Mis Pedidos | Afiladocs',
}

function getStatusBadge(status: string) {
  switch (status) {
    case 'intake_pending':
      return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-1 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20"><AlertCircle className="mr-1 h-3 w-3" /> Formulario pendiente</span>
    case 'processing':
      return <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"><Clock className="mr-1 h-3 w-3" /> En proceso</span>
    case 'draft_ready':
      return <span className="inline-flex items-center rounded-full bg-violet-50 px-2 py-1 text-xs font-medium text-violet-700 ring-1 ring-inset ring-violet-700/10"><FilePen className="mr-1 h-3 w-3" /> Borrador listo</span>
    case 'completed':
      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20"><CheckCircle2 className="mr-1 h-3 w-3" /> Completado</span>
    default:
      return <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-1 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{status}</span>
  }
}

export default async function PedidosPage() {
  const user = await requireAuth()

  const orders = await prisma.orders.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
  })

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-slate-900">Mis Pedidos</h1>
        <p className="text-slate-500 mt-2">Historial completo de tus informes y análisis jurídicos.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-slate-300 bg-slate-50 p-8 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100">
            <FileText className="h-6 w-6 text-slate-400" />
          </div>
          <h3 className="mt-4 font-semibold text-slate-900">Aún no hay pedidos</h3>
          <p className="mt-2 text-sm text-slate-500 max-w-sm mx-auto">
            Tus documentos e informes legales aparecerán aquí una vez que realices una solicitud.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/servicios">Explorar servicios</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-slate-200 bg-white overflow-hidden shadow-sm">
          <ul role="list" className="divide-y divide-slate-100">
            {orders.map((order) => (
              <li
                key={order.id}
                className="relative flex items-center justify-between gap-x-6 px-4 py-5 hover:bg-slate-50 sm:px-6 transition-colors"
              >
                <div className="flex min-w-0 gap-x-4 items-center">
                  <div className="h-10 w-10 flex-shrink-0 rounded-full bg-blue-50 flex items-center justify-center">
                    <FileText className="h-5 w-5 text-blue-600" />
                  </div>
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-slate-900">
                      <Link href={`/portal/pedido/${order.id}`}>
                        <span className="absolute inset-x-0 -top-px bottom-0" />
                        Pedido {order.product_id}
                      </Link>
                    </p>
                    <p className="mt-1 text-xs leading-5 text-slate-500">
                      {new Date(order.created_at).toLocaleDateString('es-ES', {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                      })}
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
  )
}
