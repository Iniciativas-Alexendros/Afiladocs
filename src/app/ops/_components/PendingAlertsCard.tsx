import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { prisma } from '@/lib/prisma/client'
import { AlertTriangle, ArrowRight } from 'lucide-react'

export async function PendingAlertsCard() {
  const count = await prisma.monitor_alerts.count({
    where: { status: 'pending_review' },
  })

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Alertas normativas pendientes</CardTitle>
        <AlertTriangle className="size-4 text-amber-600" />
      </CardHeader>
      <CardContent>
        <div className="flex items-end justify-between gap-2">
          <div className="text-3xl font-bold tabular-nums text-foreground">{count}</div>
          <Link
            href="/ops/alertas?status=pending_review"
            className="text-xs font-medium text-primary hover:text-primary/80 flex items-center gap-1 transition-colors"
          >
            Revisar
            <ArrowRight className="size-3" aria-hidden="true" />
          </Link>
        </div>
        <p className="text-xs text-muted-foreground mt-1">Sin revisar por el equipo ops</p>
      </CardContent>
    </Card>
  )
}

export default PendingAlertsCard
