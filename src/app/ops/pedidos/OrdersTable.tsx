'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { Button } from '@/components/ui/button'
import { Checkbox } from '@/components/ui/checkbox'
import { OrderStatusBadge } from '@/components/OrderStatusBadge'
import { formatCurrency } from '@/lib/format'
import { BatchActionsBar } from './BatchActionsBar'

export interface OrderRow {
  id: string
  created_at: Date
  status: string
  product_id: string
  product_sku: string | null
  amount_cents: number
  currency: string
  eidas_level: string
  user: { full_name: string | null } | null
  user_id: string
}

export function OrdersTable({ rows }: { rows: OrderRow[] }) {
  const [selected, setSelected] = useState<Set<string>>(new Set())
  const allIds = useMemo(() => rows.map((r) => r.id), [rows])
  const allSelected = rows.length > 0 && selected.size === rows.length

  const toggleAll = (checked: boolean) => {
    setSelected(checked ? new Set(allIds) : new Set())
  }

  const toggleOne = (id: string, checked: boolean) => {
    setSelected((prev) => {
      const next = new Set(prev)
      if (checked) next.add(id)
      else next.delete(id)
      return next
    })
  }

  const clearSelection = () => setSelected(new Set())

  return (
    <div className="flex flex-col gap-4">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="w-10">
              <Checkbox
                checked={allSelected}
                onCheckedChange={(c) => toggleAll(c === true)}
                aria-label="Seleccionar todos los pedidos"
                disabled={rows.length === 0}
              />
            </TableHead>
            <TableHead>ID Pedido</TableHead>
            <TableHead>Cliente</TableHead>
            <TableHead>Servicio</TableHead>
            <TableHead>eIDAS</TableHead>
            <TableHead>Estado</TableHead>
            <TableHead>Importe</TableHead>
            <TableHead className="text-right">Acción</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
          {rows.length === 0 ? (
            <TableRow>
              <TableCell colSpan={8} className="text-center text-muted-foreground py-8">
                No hay pedidos que coincidan con los filtros.
              </TableCell>
            </TableRow>
          ) : (
            rows.map((order) => {
              const checked = selected.has(order.id)
              return (
                <TableRow key={order.id} data-selected={checked || undefined}>
                  <TableCell>
                    <Checkbox
                      checked={checked}
                      onCheckedChange={(c) => toggleOne(order.id, c === true)}
                      aria-label={`Seleccionar pedido ${order.id.slice(0, 8)}`}
                    />
                  </TableCell>
                  <TableCell className="font-mono text-xs">{order.id.slice(0, 8)}</TableCell>
                  <TableCell>
                    {order.user?.full_name ?? order.user_id.slice(0, 8)}
                  </TableCell>
                  <TableCell className="font-medium">
                    {order.product_sku ?? order.product_id}
                  </TableCell>
                  <TableCell className="text-xs">{order.eidas_level}</TableCell>
                  <TableCell>
                    <OrderStatusBadge status={order.status} />
                  </TableCell>
                  <TableCell>
                    {formatCurrency(order.amount_cents, order.currency)}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button variant="ghost" size="sm" asChild>
                      <Link href={`/ops/pedido/${order.id}`}>Gestionar</Link>
                    </Button>
                  </TableCell>
                </TableRow>
              )
            })
          )}
        </TableBody>
      </Table>
      {selected.size > 0 && (
        <BatchActionsBar
          selectedIds={Array.from(selected)}
          onComplete={clearSelection}
        />
      )}
    </div>
  )
}
