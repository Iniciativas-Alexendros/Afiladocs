import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ArrowLeft, ExternalLink, CheckCircle2, Clock } from 'lucide-react'
import { MarkReviewedButton } from './MarkReviewedButton'

export const dynamic = 'force-dynamic'

interface PageProps {
  params: Promise<{ id: string }>
}

export async function generateMetadata({ params }: PageProps) {
  const { id } = await params
  const alert = await prisma.monitor_alerts.findFirst({ where: { id } })
  return {
    title: alert ? `${alert.title} | Monitor Normativo` : 'Alerta | Afiladocs Ops',
  }
}

type MonitorAlert = NonNullable<Awaited<ReturnType<typeof prisma.monitor_alerts.findFirst>>>

function StatusBadge({ status }: { status: string }) {
  if (status === 'reviewed') {
    return (
      <span className="inline-flex items-center gap-1.5 text-sm text-emerald-600 font-medium flex-shrink-0">
        <CheckCircle2 className="h-4 w-4" /> Revisada
      </span>
    )
  }
  return (
    <span className="inline-flex items-center gap-1.5 text-sm text-amber-600 font-medium flex-shrink-0">
      <Clock className="h-4 w-4" /> Pendiente
    </span>
  )
}

function AlertCardContent({ alert }: { alert: MonitorAlert }) {
  return (
    <CardContent className="space-y-4 text-sm">
      <div className="grid grid-cols-2 gap-4">
        <div>
          <span className="text-slate-500">Fuente</span>
          <p className="font-medium text-slate-900 mt-0.5">{alert.source}</p>
        </div>
        <div>
          <span className="text-slate-500">Urgencia</span>
          <p className="font-medium text-slate-900 mt-0.5 capitalize">{alert.urgency ?? '—'}</p>
        </div>
        <div>
          <span className="text-slate-500">Áreas</span>
          <p className="font-medium text-slate-900 mt-0.5">
            {alert.areas.length > 0 ? alert.areas.join(', ') : '—'}
          </p>
        </div>
        <div>
          <span className="text-slate-500">Publicación</span>
          <p className="font-medium text-slate-900 mt-0.5">
            {alert.published_at ? new Date(alert.published_at).toLocaleDateString('es-ES') : '—'}
          </p>
        </div>
      </div>

      {alert.summary && (
        <div className="pt-2 border-t border-slate-100">
          <span className="text-slate-500">Resumen</span>
          <p className="mt-1 text-slate-700 leading-relaxed">{alert.summary}</p>
        </div>
      )}

      {alert.raw_url && (
        <div className="pt-2 border-t border-slate-100">
          <a href={alert.raw_url} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-1.5 text-blue-600 hover:underline text-sm">
            <ExternalLink className="h-4 w-4" /> Ver fuente original
          </a>
        </div>
      )}

      {alert.status === 'reviewed' && alert.reviewed_at && (
        <div className="pt-2 border-t border-slate-100 text-slate-400 text-xs">
          Revisada el {new Date(alert.reviewed_at).toLocaleString('es-ES')}
        </div>
      )}
    </CardContent>
  )
}

export default async function AlertDetailPage({ params }: PageProps) {
  await requireRole(['admin', 'ops'])
  const { id } = await params

  const alert = await prisma.monitor_alerts.findFirst({ where: { id } })
  if (!alert) notFound()

  return (
    <div className="max-w-3xl space-y-6">
      <div>
        <Link href="/ops/alertas" className="inline-flex items-center text-sm font-medium text-slate-500 hover:text-slate-700 mb-4 transition-colors">
          <ArrowLeft className="mr-1 h-4 w-4" /> Volver a alertas
        </Link>
        <div className="flex items-start justify-between gap-4">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900">{alert.title}</h1>
          <StatusBadge status={alert.status} />
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Detalles de la alerta</CardTitle>
        </CardHeader>
        <AlertCardContent alert={alert} />
      </Card>

      {alert.status !== 'reviewed' && (
        <div className="flex gap-3">
          <MarkReviewedButton alertId={alert.id} />
        </div>
      )}
    </div>
  )
}
