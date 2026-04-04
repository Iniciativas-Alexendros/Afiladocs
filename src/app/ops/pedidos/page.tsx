import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { formatCurrency } from '@/lib/format'

export const metadata = {
  title: 'Gestión de Pedidos | Ops',
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
    <div className="flex flex-col gap-8">
      <div>
        <Breadcrumbs items={[
          { label: 'Ops', href: '/ops' },
          { label: 'Gestión de Pedidos' },
        ]} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Pedidos</h1>
        <p className="text-muted-foreground mt-2">Listado de todos los pedidos históricos y activos.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Últimos 50 pedidos</CardTitle>
          <CardDescription>Haz clic en un pedido para gestionarlo, subir documentos o ver su intake form.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>ID Pedido</TableHead>
                <TableHead>Cliente</TableHead>
                <TableHead>Servicio</TableHead>
                <TableHead>Estado</TableHead>
                <TableHead>Importe</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {orders.map(order => (
                <TableRow key={order.id}>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {order.user?.full_name ?? order.user_id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium">{order.product_id}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.amount_cents, order.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/ops/pedido/${order.id}`}>
                        Gestionar
                      </Link>
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
