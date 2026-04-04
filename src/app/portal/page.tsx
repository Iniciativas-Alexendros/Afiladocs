import { requireAuth } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { FileText, ShieldCheck, ArrowRight } from 'lucide-react'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'

export const metadata = {
  title: 'Dashboard | Afiladocs',
}

export default async function DashboardPage() {
  const user = await requireAuth()

  // Fetch recent orders
  const recentOrders = await prisma.orders.findMany({
    where: { user_id: user.id },
    orderBy: { created_at: 'desc' },
    take: 5,
  })

  // Fetch active subscriptions
  const activeSubscriptions = await prisma.subscriptions.findMany({
    where: { user_id: user.id, status: 'active' },
  })

  return (
    <div className="flex flex-col gap-8">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Bienvenido a tu panel</h1>
        <p className="text-muted-foreground mt-2">Aquí puedes gestionar tus informes jurídicos, suscripciones y documentos legales.</p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Suscripciones activas</CardTitle>
            <ShieldCheck className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{activeSubscriptions.length}</div>
            <p className="text-xs text-muted-foreground">Plan de actualización continua</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pedidos totales</CardTitle>
            <FileText className="size-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{recentOrders.length}</div>
            <p className="text-xs text-muted-foreground">Informes y análisis adquiridos</p>
          </CardContent>
        </Card>

        <Card className="bg-accent text-accent-foreground border-none shadow-md">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg font-bold">¿Necesitas un nuevo informe?</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm opacity-80 mb-4">
              Impulsa tu compliance legal con nuestros análisis e informes basados en IA.
            </p>
            <Button asChild variant="secondary" className="w-full font-semibold">
              <Link href="/servicios">Ver catálogo</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      <div className="flex flex-col gap-4">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold tracking-tight">Actividad reciente</h2>
          <Link href="/portal/pedidos" className="text-sm font-medium text-primary hover:text-primary/80 flex items-center transition-colors">
            Ver todos <ArrowRight className="ml-1 size-4" />
          </Link>
        </div>

        {recentOrders.length === 0 ? (
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
              {recentOrders.map((order) => (
                <li key={order.id} className="relative flex items-center justify-between gap-x-6 px-4 py-5 hover:bg-muted/50 sm:px-6 transition-colors">
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
                      <p className="mt-1 flex text-xs leading-5 text-muted-foreground">
                        {new Date(order.created_at).toLocaleDateString('es-ES', { year: 'numeric', month: 'long', day: 'numeric' })}
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
