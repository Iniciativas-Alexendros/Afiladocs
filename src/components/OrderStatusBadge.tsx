import { Badge } from '@/components/ui/badge'
import { AlertCircle, Clock, FilePen, CheckCircle2 } from 'lucide-react'

const STATUS_CONFIG = {
  intake_pending: {
    label: 'Formulario pendiente',
    compactLabel: 'Pendiente',
    icon: AlertCircle,
    className: 'border-amber-300 bg-amber-50 text-amber-700',
  },
  processing: {
    label: 'En proceso',
    compactLabel: 'Proceso',
    icon: Clock,
    className: 'border-blue-300 bg-blue-50 text-blue-700',
  },
  draft_ready: {
    label: 'Borrador listo',
    compactLabel: 'Borrador',
    icon: FilePen,
    className: 'border-violet-300 bg-violet-50 text-violet-700',
  },
  completed: {
    label: 'Completado',
    compactLabel: 'Completado',
    icon: CheckCircle2,
    className: 'border-emerald-300 bg-emerald-50 text-emerald-700',
  },
} as const

interface OrderStatusBadgeProps {
  status: string
  compact?: boolean
}

export function OrderStatusBadge({ status, compact = false }: OrderStatusBadgeProps) {
  const config = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG]

  if (!config) {
    return (
      <Badge variant="outline" className="border-border text-muted-foreground">
        {status}
      </Badge>
    )
  }

  const Icon = config.icon

  return (
    <Badge variant="outline" className={config.className}>
      <Icon className="size-3" aria-hidden="true" />
      {compact ? config.compactLabel : config.label}
    </Badge>
  )
}
