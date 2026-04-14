'use client'

import { useTransition } from 'react'
import { Button } from '@/components/ui/button'
import { toast } from 'sonner'
import { Download } from 'lucide-react'
import { exportAuditLogCsv, type AuditLogFilters } from './actions'

export function ExportAuditLogButton({ filters }: { filters: AuditLogFilters }) {
  const [pending, startTransition] = useTransition()

  const onClick = () => {
    startTransition(async () => {
      try {
        const { filename, csv, rowCount } = await exportAuditLogCsv(filters)
        const blob = new Blob([csv], { type: 'text/csv;charset=utf-8' })
        const url = URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = filename
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
        URL.revokeObjectURL(url)
        toast.success(`CSV exportado (${rowCount} filas)`)
      } catch (err) {
        console.error(err)
        toast.error('No se pudo exportar el CSV')
      }
    })
  }

  return (
    <Button variant="outline" size="sm" onClick={onClick} disabled={pending}>
      <Download className="mr-2 size-4" />
      {pending ? 'Exportando…' : 'Exportar CSV'}
    </Button>
  )
}
