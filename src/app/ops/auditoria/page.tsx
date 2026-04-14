import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import type { Route } from 'next'
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
  CardDescription,
} from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { ExportAuditLogButton } from './ExportAuditLogButton'
import { AuditLogFiltersForm } from './AuditLogFiltersForm'
import { AuditLogTable } from './AuditLogTable'
import { buildAuditLogWhere, type AuditLogFilters } from './query'

export const metadata = {
  title: 'Auditoría | Afiladocs Ops',
  robots: { index: false, follow: false },
}

const PAGE_SIZE = 50

interface SearchParams extends AuditLogFilters {
  cursor?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

function buildHref(params: SearchParams, cursor: string): Route<string> {
  const next = new URLSearchParams()
  for (const [k, v] of Object.entries({ ...params, cursor })) {
    if (v) next.set(k, String(v))
  }
  return `/ops/auditoria?${next.toString()}` as Route<string>
}

export default async function OpsAuditLogPage({ searchParams }: PageProps) {
  await requireRole(['admin', 'ops'])
  const params = await searchParams

  const rows = await prisma.audit_log.findMany({
    where: buildAuditLogWhere(params),
    orderBy: { created_at: 'desc' },
    take: PAGE_SIZE + 1,
    ...(params.cursor ? { cursor: { id: params.cursor }, skip: 1 } : {}),
  })

  const hasNext = rows.length > PAGE_SIZE
  const visible = hasNext ? rows.slice(0, PAGE_SIZE) : rows
  const nextCursor = hasNext ? visible[visible.length - 1].id : null

  const filters: AuditLogFilters = {
    event: params.event,
    user_id: params.user_id,
    from: params.from,
    to: params.to,
  }

  return (
    <div className="flex flex-col gap-8">
      <div>
        <Breadcrumbs items={[
          { label: 'Ops', href: '/ops' },
          { label: 'Auditoría' },
        ]} />
        <h1 className="text-2xl font-bold tracking-tight text-foreground">Auditoría</h1>
        <p className="text-muted-foreground mt-2">
          Registro de eventos del sistema (webhooks, server actions, exports). Paginación cursor-based.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
          <CardDescription>Filtros server-side vía query string.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogFiltersForm filters={filters}>
            <ExportAuditLogButton filters={filters} />
          </AuditLogFiltersForm>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Eventos ({visible.length}{hasNext ? '+' : ''})</CardTitle>
          <CardDescription>Ordenados por fecha descendente.</CardDescription>
        </CardHeader>
        <CardContent>
          <AuditLogTable rows={visible} />
          {hasNext && nextCursor && (
            <div className="mt-4 flex justify-end">
              <Button variant="outline" size="sm" asChild>
                <Link href={buildHref(params, nextCursor)}>
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
