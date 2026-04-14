import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

interface AuditLogRow {
  id: string
  created_at: Date
  event: string
  user_id: string | null
  order_id: string | null
  metadata: unknown
}

function truncate(value: unknown, max = 120): string {
  if (value === null || value === undefined) return ''
  const str = typeof value === 'string' ? value : JSON.stringify(value)
  return str.length > max ? `${str.slice(0, max)}…` : str
}

function shortId(id: string | null): string {
  return id ? id.slice(0, 8) : '—'
}

export function AuditLogTable({ rows }: { rows: AuditLogRow[] }) {
  return (
    <Table>
      <TableHeader>
        <TableRow>
          <TableHead>Fecha</TableHead>
          <TableHead>Evento</TableHead>
          <TableHead>User</TableHead>
          <TableHead>Pedido</TableHead>
          <TableHead>Metadata</TableHead>
        </TableRow>
      </TableHeader>
      <TableBody>
        {rows.length === 0 ? (
          <TableRow>
            <TableCell colSpan={5} className="text-center text-muted-foreground py-8">
              No hay eventos que coincidan con los filtros.
            </TableCell>
          </TableRow>
        ) : rows.map((row) => (
          <TableRow key={row.id}>
            <TableCell className="font-mono text-xs whitespace-nowrap">
              {row.created_at.toISOString().replace('T', ' ').slice(0, 19)}
            </TableCell>
            <TableCell className="font-medium">{row.event}</TableCell>
            <TableCell className="font-mono text-xs">{shortId(row.user_id)}</TableCell>
            <TableCell className="font-mono text-xs">{shortId(row.order_id)}</TableCell>
            <TableCell className="text-xs text-muted-foreground max-w-md">
              {truncate(row.metadata)}
            </TableCell>
          </TableRow>
        ))}
      </TableBody>
    </Table>
  )
}
