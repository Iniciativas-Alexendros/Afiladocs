import Link from 'next/link'
import { requireRole } from '@/lib/auth'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/button'
import { ProductForm } from '../ProductForm'

export const metadata = {
  title: 'Nuevo producto | Ops',
  robots: { index: false, follow: false },
}

export default async function NewProductPage() {
  await requireRole(['admin', 'ops'])

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Breadcrumbs items={[
            { label: 'Ops', href: '/ops' },
            { label: 'Catálogo', href: '/ops/productos' },
            { label: 'Nuevo' },
          ]} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">Nuevo producto</h1>
        </div>
        <Button variant="outline" asChild>
          <Link href="/ops/productos">← Volver al listado</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Alta de producto</CardTitle>
          <CardDescription>Crea en `draft` (is_active=false); activa sólo cuando los IDs externos estén poblados.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm />
        </CardContent>
      </Card>
    </div>
  )
}
