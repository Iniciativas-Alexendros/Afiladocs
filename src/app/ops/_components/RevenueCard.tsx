import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { formatCurrency } from '@/lib/format'
import { getRevenueMonthly, type KpiRange } from '@/lib/prisma/orders'
import { TrendingUp } from 'lucide-react'

const RANGE_LABEL: Record<KpiRange, string> = {
  '7d': 'últimos 7 días',
  '30d': 'últimos 30 días',
  '90d': 'últimos 90 días',
  mtd: 'mes actual',
}

export async function RevenueCard({ range }: { range: KpiRange }) {
  const rows = await getRevenueMonthly(range)
  const recent = rows.slice(-3)
  const max = recent.reduce((m, r) => (r.revenue_cents > m ? r.revenue_cents : m), 0)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Revenue ({RANGE_LABEL[range]})</CardTitle>
        <TrendingUp className="size-4 text-emerald-600" />
      </CardHeader>
      <CardContent>
        {recent.length === 0 ? (
          <p className="text-sm text-muted-foreground">Sin ingresos registrados en el rango.</p>
        ) : (
          <ul className="flex flex-col gap-3">
            {recent.map((r) => {
              const pct = max === 0 ? 0 : Math.round((r.revenue_cents / max) * 100)
              const monthLabel = new Date(r.month).toLocaleDateString('es-ES', {
                month: 'short',
                year: 'numeric',
              })
              return (
                <li key={r.month} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between">
                    <span className="text-xs text-muted-foreground capitalize">{monthLabel}</span>
                    <span className="text-sm font-bold text-foreground">
                      {formatCurrency(r.revenue_cents, 'eur')}
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-emerald-500 rounded-full"
                      style={{ width: `${pct}%` }}
                      aria-hidden="true"
                    />
                  </div>
                </li>
              )
            })}
          </ul>
        )}
      </CardContent>
    </Card>
  )
}

export default RevenueCard
