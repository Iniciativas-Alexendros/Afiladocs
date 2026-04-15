import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { AlertFilters } from './query'

interface Props {
  filters: AlertFilters
  sources?: string[]
  children?: ReactNode
}

const STATUS_OPTIONS: Array<{ value: string; label: string }> = [
  { value: 'pending_review', label: 'Pendientes' },
  { value: 'reviewed', label: 'Revisadas' },
  { value: 'archived', label: 'Archivadas' },
  { value: 'dismissed', label: 'Descartadas' },
  { value: 'all', label: 'Todas' },
]

const DEFAULT_SOURCES = ['BOE', 'DOGV', 'AEPD', 'CGPJ']

export function AlertFiltersForm({ filters, sources, children }: Props) {
  const mergedSources = Array.from(
    new Set([...(sources ?? []), ...DEFAULT_SOURCES].filter(Boolean)),
  )

  return (
    <form method="get" className="grid gap-4 md:grid-cols-5">
      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          name="status"
          defaultValue={filters.status ?? 'pending_review'}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          {STATUS_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>
              {opt.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="urgency">Urgencia</Label>
        <select
          id="urgency"
          name="urgency"
          defaultValue={filters.urgency ?? ''}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas</option>
          <option value="alta">Alta</option>
          <option value="media">Media</option>
          <option value="baja">Baja</option>
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="source">Fuente</Label>
        <select
          id="source"
          name="source"
          defaultValue={filters.source ?? ''}
          className="h-9 rounded-md border border-input bg-background px-3 text-sm"
        >
          <option value="">Todas</option>
          {mergedSources.map((src) => (
            <option key={src} value={src}>
              {src}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="from">Desde</Label>
        <Input
          id="from"
          name="from"
          type="date"
          defaultValue={filters.from ?? ''}
        />
      </div>

      <div className="flex flex-col gap-2">
        <Label htmlFor="to">Hasta</Label>
        <Input id="to" name="to" type="date" defaultValue={filters.to ?? ''} />
      </div>

      <div className="md:col-span-5 flex items-center gap-3">
        <Button type="submit" size="sm">
          Aplicar filtros
        </Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href="/ops/alertas">Limpiar</Link>
        </Button>
        <div className="ml-auto">{children}</div>
      </div>
    </form>
  )
}
