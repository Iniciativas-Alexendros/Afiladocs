import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getFunnelCounts, type KpiRange } from '@/lib/prisma/orders'
import { Filter } from 'lucide-react'

export async function FunnelCard({ range }: { range: KpiRange }) {
  const counts = await getFunnelCounts(range)
  const stages: Array<{ key: keyof typeof counts; label: string }> = [
    { key: 'created', label: 'Creados' },
    { key: 'paid', label: 'Pagados' },
    { key: 'intake_complete', label: 'Intake' },
    { key: 'signed', label: 'Firmados' },
  ]

  const base = counts.created

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">Funnel de conversión</CardTitle>
        <Filter className="size-4 text-blue-600" />
      </CardHeader>
      <CardContent>
        {base === 0 ? (
          <p className="text-sm text-muted-foreground">Sin pedidos en el rango.</p>
        ) : (
          <ul className="flex flex-col gap-2">
            {stages.map((s) => {
              const n = counts[s.key]
              const pct = base === 0 ? 0 : Math.round((n / base) * 100)
              return (
                <li key={s.key} className="flex flex-col gap-1">
                  <div className="flex items-baseline justify-between text-xs">
                    <span className="text-muted-foreground">{s.label}</span>
                    <span className="font-mono text-foreground">
                      {n} <span className="text-muted-foreground">({pct}%)</span>
                    </span>
                  </div>
                  <div className="h-1.5 w-full rounded-full bg-muted overflow-hidden">
                    <div
                      className="h-full bg-blue-500 rounded-full"
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

export default FunnelCard
