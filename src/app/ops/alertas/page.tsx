import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import type { Route } from 'next'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { AlertTriangle, CheckCircle2, Clock, ArrowRight } from 'lucide-react'

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
  return status === 'reviewed'
    ? <span className="inline-flex items-center gap-1 text-xs text-emerald-600"><CheckCircle2 className="h-3.5 w-3.5" /> Revisada</span>
    : <span className="inline-flex items-center gap-1 text-xs text-amber-600"><Clock className="h-3.5 w-3.5" /> Pendiente</span>
}

interface SearchParams {
  urgency?: string
  status?: string
}

interface PageProps {
  searchParams: Promise<SearchParams>
}

export default async function AlertasPage({ searchParams }: PageProps) {
  await requireRole(['admin', 'ops'])

  const params = await searchParams
  const urgencyFilter = params.urgency
  const statusFilter = params.status ?? 'pending_review'

  const alerts = await prisma.monitor_alerts.findMany({
    where: {
      ...(urgencyFilter ? { urgency: urgencyFilter } : {}),
      ...(statusFilter !== 'all' ? { status: statusFilter } : {}),
    },
    orderBy: [{ urgency: 'asc' }, { created_at: 'desc' }],
    take: 50,
  })

  const pendingCount = await prisma.monitor_alerts.count({ where: { status: 'pending_review' } })

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
        <p className="text-sm text-slate-500">Alertas legales y regulatorias. Revisa y marca cada alerta como procesada.</p>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-2">
        {[
          { label: 'Pendientes', href: '/ops/alertas?status=pending_review', active: statusFilter === 'pending_review' },
          { label: 'Revisadas', href: '/ops/alertas?status=reviewed', active: statusFilter === 'reviewed' },
          { label: 'Todas', href: '/ops/alertas?status=all', active: statusFilter === 'all' },
        ].map((f) => (
          <Link
            key={f.href}
            href={f.href as Route<string>}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
              f.active
                ? 'bg-slate-900 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {f.label}
          </Link>
        ))}
        <div className="w-px bg-slate-200 mx-1" />
        {['alta', 'media', 'baja'].map((u) => (
          <Link
            key={u}
            href={`/ops/alertas?status=${statusFilter}&urgency=${u}`}
            className={`rounded-full px-3 py-1 text-xs font-medium transition-colors capitalize ${
              urgencyFilter === u
                ? 'bg-amber-600 text-white'
                : 'bg-slate-100 text-slate-600 hover:bg-slate-200'
            }`}
          >
            {u}
          </Link>
        ))}
        {urgencyFilter && (
          <Link href={`/ops/alertas?status=${statusFilter}`} className="rounded-full px-3 py-1 text-xs font-medium bg-slate-100 text-slate-600 hover:bg-slate-200">
            × Limpiar filtro
          </Link>
        )}
      </div>

      {/* Alerts list */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Alertas ({alerts.length})</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {alerts.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-slate-500">
              <CheckCircle2 className="h-10 w-10 text-emerald-400 mb-3" />
              <p className="text-sm">No hay alertas con este filtro.</p>
            </div>
          ) : (
            <ul className="divide-y divide-slate-100">
              {alerts.map((alert) => (
                <li key={alert.id}>
                  <Link
                    href={`/ops/alertas/${alert.id}`}
                    className="flex items-start justify-between gap-4 p-4 hover:bg-slate-50 transition-colors group"
                  >
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-2 mb-1">
                        {urgencyBadge(alert.urgency)}
                        {statusBadge(alert.status)}
                        {alert.areas.length > 0 && (
                          <span className="text-xs text-slate-400">{alert.areas.join(', ')}</span>
                        )}
                      </div>
                      <p className="text-sm font-medium text-slate-900 truncate">{alert.title}</p>
                      {alert.summary && (
                        <p className="text-xs text-slate-500 mt-0.5 line-clamp-2">{alert.summary}</p>
                      )}
                      <p className="text-xs text-slate-400 mt-1">
                        {alert.source} — {new Date(alert.created_at).toLocaleDateString('es-ES')}
                      </p>
                    </div>
                    <ArrowRight className="h-4 w-4 text-slate-300 group-hover:text-slate-500 mt-1 flex-shrink-0 transition-colors" />
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
