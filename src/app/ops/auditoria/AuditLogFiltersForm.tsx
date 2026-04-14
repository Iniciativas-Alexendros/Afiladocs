import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AuditLogFilters } from './query'

interface Props {
  filters: AuditLogFilters
  children?: ReactNode
}

export function AuditLogFiltersForm({ filters, children }: Props) {
  return (
    <form method="get" className="grid gap-4 md:grid-cols-4">
      <div className="flex flex-col gap-2">
        <Label htmlFor="event">Evento</Label>
        <Input id="event" name="event" placeholder="report.exported" defaultValue={filters.event ?? ''} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="user_id">User ID</Label>
        <Input id="user_id" name="user_id" placeholder="UUID" defaultValue={filters.user_id ?? ''} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="from">Desde</Label>
        <Input id="from" name="from" type="datetime-local" defaultValue={filters.from ?? ''} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="to">Hasta</Label>
        <Input id="to" name="to" type="datetime-local" defaultValue={filters.to ?? ''} />
      </div>
      <div className="md:col-span-4 flex items-center gap-3">
        <Button type="submit" size="sm">Aplicar filtros</Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href="/ops/auditoria">Limpiar</Link>
        </Button>
        <div className="ml-auto">{children}</div>
      </div>
    </form>
  )
}
