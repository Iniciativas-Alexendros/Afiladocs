import { Separator } from '@/components/ui/separator'

interface IntakeDataViewerProps {
  data: Record<string, unknown>
}

export function IntakeDataViewer({ data }: IntakeDataViewerProps) {
  const entries = Object.entries(data)

  if (entries.length === 0) {
    return <p className="text-sm text-muted-foreground">Sin datos de intake.</p>
  }

  return (
    <dl className="flex flex-col gap-3">
      {entries.map(([key, value], i) => (
        <div key={key}>
          <dt className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            {key.replace(/_/g, ' ')}
          </dt>
          <dd className="mt-1 text-sm text-foreground">{String(value)}</dd>
          {i < entries.length - 1 && <Separator className="mt-3" />}
        </div>
      ))}
    </dl>
  )
}
