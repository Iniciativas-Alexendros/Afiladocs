import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { getSlaPercentiles } from '@/lib/prisma/orders'
import { Timer } from 'lucide-react'

function fmtDays(v: number | null): string {
  if (v === null) return '—'
  return `${Math.round(v * 10) / 10} d`
}

export async function SlaCard() {
  const { p50, p90, p99, sample_size } = await getSlaPercentiles(30)

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">SLA intake → firmado (30d)</CardTitle>
        <Timer className="size-4 text-indigo-600" />
      </CardHeader>
      <CardContent>
        {sample_size === 0 ? (
          <p className="text-sm text-muted-foreground">Sin datos suficientes.</p>
        ) : (
          <div className="flex flex-col gap-2">
            <div className="grid grid-cols-3 gap-2 text-center">
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">P50</p>
                <p className="text-lg font-bold text-foreground">{fmtDays(p50)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">P90</p>
                <p className="text-lg font-bold text-foreground">{fmtDays(p90)}</p>
              </div>
              <div>
                <p className="text-[10px] uppercase tracking-wide text-muted-foreground">P99</p>
                <p className="text-lg font-bold text-foreground">{fmtDays(p99)}</p>
              </div>
            </div>
            <p className="text-xs text-muted-foreground text-center">
              n = {sample_size} documentos firmados
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

export default SlaCard
