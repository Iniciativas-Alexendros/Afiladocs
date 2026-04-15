import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import {
  DEFAULT_PAGE_SIZE,
  buildCursorArgs,
  buildPagedHref,
  paginateCursor,
} from '@/app/ops/_lib/cursor'
import { ExportOrdersButton } from './ExportOrdersButton'
import { OrderFiltersForm } from './OrderFiltersForm'
import { OrdersTable } from './OrdersTable'
import {
  buildOrderOrderBy,
  buildOrderWhere,
  type OrderFilters,
} from './query'

export const metadata = {
  title: 'Gestión de Pedidos | Ops',
  robots: { index: false, follow: false },
}

interface SearchParams extends OrderFilters {
  cursor?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function OpsOrdersPage({ searchParams }: PageProps) {
  await requireRole(['admin', 'ops'])
  const params = await searchParams

  const filters: OrderFilters = {
    status: params.status,
    product_sku: params.product_sku,
    eidas_level: params.eidas_level,
    from: params.from,
    to: params.to,
    q: params.q,
    sort: params.sort,
    dir: params.dir,
  }

  const orders = await prisma.orders.findMany({
    where: buildOrderWhere(filters),
    include: {
      user: { select: { full_name: true } },
      product: { select: { sku: true } },
    },
    orderBy: buildOrderOrderBy(filters),
    take: DEFAULT_PAGE_SIZE + 1,
    ...buildCursorArgs(params.cursor),
  })

  const { rows, hasNext, nextCursor } = paginateCursor(orders, DEFAULT_PAGE_SIZE)

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Breadcrumbs items={[
          { label: 'Ops', href: '/ops' },
          { label: 'Gestión de Pedidos' },
        ]} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Gestión de Pedidos</h1>
        <p className="text-muted-foreground mt-2">
          Listado filtrable de pedidos con paginación cursor-based y exportación CSV.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtros server-side vía query string.</CardDescription>
        </CardHeader>
        <CardContent>
          <OrderFiltersForm filters={filters}>
            <ExportOrdersButton filters={filters} />
          </OrderFiltersForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Pedidos ({rows.length}{hasNext ? '+' : ''})</CardTitle>
          <CardDescription>
            Haz clic en un pedido para gestionarlo, subir documentos o revisar su intake.
          </CardDescription>
        </CardHeader>
        <CardContent>
          <OrdersTable rows={rows} />
          {hasNext && nextCursor && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={buildPagedHref('/ops/pedidos', params, { cursor: nextCursor })}>
                  Siguiente página →
                </Link>
              </Button>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
