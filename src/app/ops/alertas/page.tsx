import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { AlertTriangle, CheckCircle2, Clock, Archive, XCircle, ArrowRight } from 'lucide-react'
import {
  DEFAULT_PAGE_SIZE,
  buildCursorArgs,
  buildPagedHref,
  paginateCursor,
} from '@/app/ops/_lib/cursor'
import { AlertFiltersForm } from './AlertFiltersForm'
import { AlertRowActions } from './AlertRowActions'
import { buildAlertsWhere, type AlertFilters } from './query'

export const metadata = {
  title: 'Monitor Normativo | Afiladocs Ops',
}

type Urgency = 'alta' | 'media' | 'baja' | string

function urgencyBadge(urgency: Urgency | null) {
  switch (urgency?.toLowerCase()) {
    case 'alta':
      return <span className="inline-flex items-center rounded-full bg-red-50 px-2 py-0.5 text-xs font-medium text-red-700 ring-1 ring-inset ring-red-600/20">Alta</span>
    case 'media':
      return <span className="inline-flex items-center rounded-full bg-amber-50 px-2 py-0.5 text-xs font-medium text-amber-700 ring-1 ring-inset ring-amber-600/20">Media</span>
    case 'baja':
      return <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700 ring-1 ring-inset ring-emerald-600/20">Baja</span>
    default:
      return <span className="inline-flex items-center rounded-full bg-slate-50 px-2 py-0.5 text-xs font-medium text-slate-600 ring-1 ring-inset ring-slate-500/10">{urgency ?? '—'}</span>
  }
}

function statusBadge(status: string) {
  switch (status) {
    case 'reviewed':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-emerald-600">
          <CheckCircle2 className="h-3.5 w-3.5" /> Revisada
        </span>
      )
    case 'archived':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-600">
          <Archive className="h-3.5 w-3.5" /> Archivada
        </span>
      )
    case 'dismissed':
      return (
        <span className="inline-flex items-center gap-1 text-xs text-slate-400">
          <XCircle className="h-3.5 w-3.5" /> Descartada
        </span>
      )
    case 'pending_review':
    default:
      return (
        <span className="inline-flex items-center gap-1 text-xs text-amber-600">
          <Clock className="h-3.5 w-3.5" /> Pendiente
        </span>
      )
  }
}

interface SearchParams extends AlertFilters {
  cursor?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function AlertasPage({ searchParams }: PageProps) {
  await requireRole(['admin', 'ops'])

  const params = await searchParams
  const statusFilter = params.status ?? 'pending_review'

  const effectiveFilters: AlertFilters = {
    status: statusFilter,
    urgency: params.urgency,
    source: params.source,
    from: params.from,
    to: params.to,
  }

  const rows = await prisma.monitor_alerts.findMany({
    where: buildAlertsWhere(effectiveFilters),
    orderBy: [{ urgency: 'asc' }, { created_at: 'desc' }],
    take: DEFAULT_PAGE_SIZE + 1,
    ...buildCursorArgs(params.cursor),
  })

  const { rows: visible, hasNext, nextCursor } = paginateCursor(rows)

  const pendingCount = await prisma.monitor_alerts.count({
    where: { status: 'pending_review' },
  })

  const hrefParams: Record<string, string | undefined> = {
    status: statusFilter,
    urgency: params.urgency,
    source: params.source,
    from: params.from,
    to: params.to,
  }

  return (
    <div className="space-y-8">
      <div>
        <div className="flex items-center gap-2 mb-1">
          <AlertTriangle className="h-5 w-5 text-amber-500" />
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">Monitor Normativo</h1>
          {pendingCount > 0 && (
            <span className="ml-2 inline-flex items-center rounded-full bg-red-100 px-2.5 py-0.5 text-xs font-semibold text-red-700">
              {pendingCount} pendientes
            </span>
          )}
        </div>
        <p className="text-sm text-slate-500">
          Alertas legales y regulatorias. Revisa, archiva o descarta cada alerta.
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <AlertFiltersForm filters={effectiveFilters} />
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">
            Alertas ({visible.length}
            {hasNext ? '+' : ''})
          </CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {visible.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" />
              <p className="text-sm">No hay alertas con este filtro.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {visible.map((alert) => (
                <li key={alert.id} className="flex items-start justify-between gap-4 p-4 hover:bg-slate-50 transition-colors">
                  <Link
                    href={`/ops/alertas/${alert.id}`}
                    className="flex-1 min-w-0 group"
                  >
                    <div className="flex items-center gap-2 mb-1">
                      {urgencyBadge(alert.urgency)}
                      {statusBadge(alert.status)}
                      {alert.areas.length > 0 && (
                        <span className="text-xs text-slate-400">{alert.areas.join(', ')}</span>
                      )}
                    </div>
                    <p className="text-sm font-medium text-slate-900 truncate group-hover:underline">
                      {alert.title}
                    </p>
                    {alert.summary && (
                      <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alert.summary}</p>
                    )}
                    <p className="text-xs text-slate-400 mt-1 inline-flex items-center gap-1">
                      {alert.source} — {new Date(alert.created_at).toLocaleDateString('es-ES')}
                      <ArrowRight className="h-3 w-3 text-slate-300 group-hover:text-slate-500 transition-colors" />
                    </p>
                  </Link>
                  <AlertRowActions alertId={alert.id} status={alert.status} />
                </li>
              ))}
            </ul>
          )}
          {hasNext && nextCursor && (
            <div className="flex justify-end p-4 border-t border-slate-100">
              <Button variant="outline" size="sm" asChild>
                <Link href={buildPagedHref('/ops/alertas', hrefParams, { cursor: nextCursor })}>
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
