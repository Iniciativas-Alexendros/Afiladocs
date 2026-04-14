import { Badge } from '@/components/ui/badge'
import { FileSignature, FileText, Download, UserCheck } from 'lucide-react'

const MAP: Record<string, { label: string; className: string; Icon: typeof FileSignature }> = {
  docuseal_fill_and_sign: { label: 'Rellenar y firmar', className: 'bg-blue-50 border-blue-300 text-blue-800', Icon: FileSignature },
  docuseal_fill_only: { label: 'Rellenar online', className: 'bg-cyan-50 border-cyan-300 text-cyan-800', Icon: FileText },
  download_after_payment: { label: 'Descarga inmediata', className: 'bg-green-50 border-green-300 text-green-800', Icon: Download },
  human_review: { label: 'Revisión experta', className: 'bg-amber-50 border-amber-300 text-amber-800', Icon: UserCheck },
}

export function DeliveryBadge({ mode }: { mode: string }) {
  const cfg = MAP[mode] ?? { label: mode, className: '', Icon: FileText }
  const { Icon } = cfg
  return (
    <Badge variant="outline" className={`gap-1 ${cfg.className}`}>
      <Icon className="size-3" /> {cfg.label}
    </Badge>
  )
}
