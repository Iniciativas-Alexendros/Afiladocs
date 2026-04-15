import type { ReactNode } from 'react'
import Link from 'next/link'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import type { OrderFilters } from './query'

interface Props {
  filters: OrderFilters
  children?: ReactNode
}

export function OrderFiltersForm({ filters, children }: Props) {
  return (
    <form method="get" className="grid gap-4 md:grid-cols-3">
      <div className="flex flex-col gap-2">
        <Label htmlFor="status">Estado</Label>
        <select
          id="status"
          name="status"
          defaultValue={filters.status ?? ''}
          className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <option value="">Todos</option>
          <option value="intake_pending">intake_pending</option>
          <option value="processing">processing</option>
          <option value="draft_ready">draft_ready</option>
          <option value="completed">completed</option>
          <option value="cancelled">cancelled</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="product_sku">Producto (SKU)</Label>
        <Input
          id="product_sku"
          name="product_sku"
          placeholder="p.ej. rgpd-empresa"
          defaultValue={filters.product_sku ?? ''}
        />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="eidas_level">Nivel eIDAS</Label>
        <select
          id="eidas_level"
          name="eidas_level"
          defaultValue={filters.eidas_level ?? ''}
          className="border-input bg-background focus-visible:ring-ring flex h-9 w-full rounded-md border px-3 py-1 text-sm shadow-xs transition-colors focus-visible:ring-1 focus-visible:outline-none"
        >
          <option value="">Todos</option>
          <option value="SES">SES</option>
          <option value="AES">AES</option>
        </select>
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="from">Desde</Label>
        <Input id="from" name="from" type="datetime-local" defaultValue={filters.from ?? ''} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="to">Hasta</Label>
        <Input id="to" name="to" type="datetime-local" defaultValue={filters.to ?? ''} />
      </div>
      <div className="flex flex-col gap-2">
        <Label htmlFor="q">Búsqueda</Label>
        <Input
          id="q"
          name="q"
          placeholder="Email, NIF, ID pedido"
          defaultValue={filters.q ?? ''}
        />
      </div>
      <div className="md:col-span-3 flex items-center gap-3">
        <Button type="submit" size="sm">Aplicar filtros</Button>
        <Button type="button" variant="ghost" size="sm" asChild>
          <Link href="/ops/pedidos">Limpiar</Link>
        </Button>
        <div className="ml-auto">{children}</div>
      </div>
    </form>
  )
}
