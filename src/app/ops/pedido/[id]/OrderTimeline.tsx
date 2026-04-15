import { prisma } from '@/lib/prisma/client'
import { DEFAULT_EVENT_ICON, EVENT_ICONS } from './event-icons'

type TimelineRow = {
  id: string
  event: string
  metadata: unknown
  created_at: Date
}

export async function OrderTimeline({ orderId }: { orderId: string }) {
  const rows = (await prisma.audit_log.findMany({
    where: { order_id: orderId },
    orderBy: { created_at: 'asc' },
  })) as unknown as TimelineRow[]

  if (rows.length === 0) {
    return (
      <p className="text-sm text-muted-foreground">
        Sin eventos registrados para este pedido.
      </p>
    )
  }

  return (
    <ol role="list" aria-label="Timeline del pedido" className="flex flex-col gap-0">
      {rows.map((row, idx) => {
        const cfg = EVENT_ICONS[row.event] ?? DEFAULT_EVENT_ICON
        const Icon = cfg.icon
        const isLast = idx === rows.length - 1
        const metadata =
          row.metadata && typeof row.metadata === 'object'
            ? (row.metadata as Record<string, unknown>)
            : {}

        return (
          <li key={row.id} className="relative flex gap-4 pb-6 last:pb-0">
            {!isLast && (
              <span
                aria-hidden="true"
                className="absolute left-4 top-8 -ml-px h-full w-0.5 bg-border"
              />
            )}
            <div
              className={`relative z-10 flex size-8 shrink-0 items-center justify-center rounded-full border border-border bg-background ${cfg.color}`}
            >
              <Icon className="size-4" aria-hidden="true" />
            </div>
            <div className="flex flex-1 flex-col gap-1 min-w-0">
              <div className="flex flex-wrap items-baseline gap-x-2 gap-y-0.5">
                <p className="text-sm font-medium text-foreground">{cfg.label}</p>
                <code className="text-[10px] font-mono text-muted-foreground">
                  {row.event}
                </code>
              </div>
              <time
                dateTime={row.created_at.toISOString()}
                className="text-xs text-muted-foreground"
              >
                {row.created_at.toLocaleString('es-ES')}
              </time>
              <details className="mt-1 group">
                <summary className="cursor-pointer text-xs text-muted-foreground hover:text-foreground transition-colors">
                  Ver payload
                </summary>
                <pre className="mt-2 overflow-x-auto rounded-md bg-muted p-3 text-xs">
                  {JSON.stringify(metadata, null, 2)}
                </pre>
              </details>
            </div>
          </li>
        )
      })}
    </ol>
  )
}
