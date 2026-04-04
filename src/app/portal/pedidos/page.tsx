import { unstable_cache } from 'next/cache'
import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { FileText, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Breadcrumbs } from '@/components/Breadcrumbs'

export const metadata = {
  title: 'Mis Pedidos | Afiladocs',
}

export default async function PedidosPage() {
  const user = await requireAuth()

  const getOrders = unstable_cache(
    () => prisma.orders.findMany({
      where: { user_id: user.id },
      orderBy: { created_at: 'desc' },
    }),
    [`portal-orders-${user.id}`],
    { tags: ['orders', `orders-${user.id}`], revalidate: 60 },
  )

  const orders = await getOrders()

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Breadcrumbs items={[
          { label: 'Portal', href: '/portal' },
          { label: 'Mis Pedidos' },
        ]} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Mis Pedidos</h1>
        <p className="text-muted-foreground mt-2">Historial completo de tus informes y análisis jurídicos.</p>
      </div>

      {orders.length === 0 ? (
        <div className="rounded-xl border border-dashed border-border bg-muted/50 p-8 text-center">
          <div className="mx-auto flex size-12 items-center justify-center rounded-full bg-muted">
            <FileText className="size-6 text-muted-foreground" />
          </div>
          <h3 className="mt-4 font-semibold text-foreground">Aún no hay pedidos</h3>
          <p className="mt-2 text-sm text-muted-foreground max-w-sm mx-auto">
            Tus documentos e informes legales aparecerán aquí una vez que realices una solicitud.
          </p>
          <div className="mt-6">
            <Button asChild>
              <Link href="/servicios">Explorar servicios</Link>
            </Button>
          </div>
        </div>
      ) : (
        <div className="rounded-xl border border-border bg-card overflow-hidden shadow-sm">
          <ul role="list" className="divide-y divide-border">
            {orders.map((order) => (
              <li
                key={order.id}
                className="relative flex items-center justify-between gap-x-6 px-4 py-5 hover:bg-muted/50 sm:px-6 transition-colors"
              >
                <div className="flex min-w-0 gap-x-4 items-center">
                  <div className="size-10 shrink-0 rounded-full bg-primary/10 flex items-center justify-center">
                    <FileText className="size-5 text-primary" />
                  </div>
                  <div className="min-w-0 flex-auto">
                    <p className="text-sm font-semibold leading-6 text-foreground">
                      <Link href={`/portal/pedido/${order.id}`}>
                        <span className="absolute inset-x-0 -top-px bottom-0" />
                        Pedido {order.product_id}
                      </Link>
                    </p>
                    <p className="mt-1 text-xs leading-5 text-muted-foreground">
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
  )
}
