import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { formatCurrency } from '@/lib/format'
import { Plus, AlertTriangle } from 'lucide-react'

function StripeCell({ value, needs }: { value: string | null; needs: boolean }) {
  if (value) {
    return <Badge variant="outline" className="bg-green-50 border-green-300 text-green-800 font-mono text-[10px]">{value.slice(0, 12)}…</Badge>
  }
  if (needs) {
    return <Badge variant="outline" className="bg-red-50 border-red-300 text-red-800">pendiente</Badge>
  }
  return <span className="text-muted-foreground text-xs">—</span>
}

function DocusealCell({ value, needs }: { value: string | null; needs: boolean }) {
  if (value) {
    return <Badge variant="outline" className="bg-green-50 border-green-300 text-green-800">{value}</Badge>
  }
  if (needs) {
    return <Badge variant="outline" className="bg-red-50 border-red-300 text-red-800">pendiente</Badge>
  }
  return <span className="text-muted-foreground text-xs">—</span>
}

export const metadata = {
  title: 'Catálogo de productos | Ops',
  robots: { index: false, follow: false },
}

export default async function OpsProductsPage() {
  await requireRole(['admin', 'ops'])

  const products = await prisma.products.findMany({
    orderBy: [{ category: 'asc' }, { display_order: 'asc' }, { title: 'asc' }],
  })

  const missingStripe = products.filter(p => p.kind !== 'review' && !p.stripe_price_id).length
  const missingDocuseal = products.filter(
    p => (p.delivery_mode === 'docuseal_fill_and_sign' || p.delivery_mode === 'docuseal_fill_only') && !p.docuseal_template_id,
  ).length

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Breadcrumbs items={[{ label: 'Ops', href: '/ops' }, { label: 'Catálogo' }]} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Catálogo de productos</h1>
          <p className="text-muted-foreground mt-2">
            Gestión de productos para tienda. Marca <code>is_active</code> sólo cuando `stripe_price_id` y, si aplica, `docuseal_template_id` estén poblados.
          </p>
        </div>
        <Button asChild>
          <Link href="/ops/productos/nuevo">
            <Plus className="size-4" /> Nuevo
          </Link>
        </Button>
      </div>

      {(missingStripe > 0 || missingDocuseal > 0) && (
        <Card className="border-amber-300 bg-amber-50">
          <CardHeader className="flex flex-row items-center gap-3 pb-3">
            <AlertTriangle className="size-5 text-amber-600" />
            <CardTitle className="text-base text-amber-900">Productos incompletos</CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-amber-900">
            {missingStripe > 0 && <div>{missingStripe} productos sin <code>stripe_price_id</code>.</div>}
            {missingDocuseal > 0 && <div>{missingDocuseal} plantillas DocuSeal sin <code>docuseal_template_id</code>.</div>}
          </CardContent>
        </Card>
      )}

      <Card>
        <CardHeader>
          <CardTitle>{products.length} productos</CardTitle>
          <CardDescription>Ordenados por categoría y display_order.</CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>SKU</TableHead>
                <TableHead>Título</TableHead>
                <TableHead>Categoría</TableHead>
                <TableHead>Kind</TableHead>
                <TableHead>Entrega</TableHead>
                <TableHead>Precio</TableHead>
                <TableHead>Stripe</TableHead>
                <TableHead>DocuSeal</TableHead>
                <TableHead>Activo</TableHead>
                <TableHead className="text-right">Acción</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {products.map(p => {
                const needsStripe = p.kind !== 'review' && !p.stripe_price_id
                const needsDocuseal =
                  (p.delivery_mode === 'docuseal_fill_and_sign' || p.delivery_mode === 'docuseal_fill_only') &&
                  !p.docuseal_template_id
                return (
                  <TableRow key={p.sku}>
                    <TableCell className="font-mono text-xs">{p.sku}</TableCell>
                    <TableCell className="font-medium">{p.title}</TableCell>
                    <TableCell><Badge variant="outline">{p.category}</Badge></TableCell>
                    <TableCell><Badge variant="secondary">{p.kind}</Badge></TableCell>
                    <TableCell className="text-xs text-muted-foreground">{p.delivery_mode}</TableCell>
                    <TableCell>{formatCurrency(p.price_cents, 'eur')}</TableCell>
                    <TableCell><StripeCell value={p.stripe_price_id} needs={needsStripe} /></TableCell>
                    <TableCell><DocusealCell value={p.docuseal_template_id} needs={needsDocuseal} /></TableCell>
                    <TableCell>
                      {p.is_active ? (
                        <Badge className="bg-green-600">live</Badge>
                      ) : (
                        <Badge variant="secondary">draft</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <Button variant="ghost" size="sm" asChild>
                        <Link href={`/ops/productos/${p.sku}`}>Editar</Link>
                      </Button>
                    </TableCell>
                  </TableRow>
                )
              })}
            </TableBody>
          </Table>
        </CardContent>
      </Card>
    </div>
  )
}
