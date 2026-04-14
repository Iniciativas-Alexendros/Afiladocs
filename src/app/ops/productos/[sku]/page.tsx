import Link from 'next/link'
import { notFound } from 'next/navigation'
import { requireRole } from '@/lib/auth'
import { prisma } from '@/lib/prisma/client'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Breadcrumbs } from '@/components/Breadcrumbs'
import { Button } from '@/components/ui/button'
import { ProductForm } from '../ProductForm'

export const metadata = {
  title: 'Editar producto | Ops',
  robots: { index: false, follow: false },
}

export default async function EditProductPage({ params }: { params: Promise<{ sku: string }> }) {
  await requireRole(['admin', 'ops'])
  const { sku } = await params
  const product = await prisma.products.findUnique({ where: { sku } })
  if (!product) notFound()

  return (
    <div className="flex flex-col gap-8">
      <div className="flex items-start justify-between gap-4">
        <div>
          <Breadcrumbs items={[
            { label: 'Ops', href: '/ops' },
            { label: 'Catálogo', href: '/ops/productos' },
            { label: product.sku },
          ]} />
          <h1 className="text-2xl font-bold tracking-tight text-foreground">{product.title}</h1>
          <p className="text-muted-foreground mt-2 font-mono text-sm">{product.sku}</p>
        </div>
        <Button variant="outline" asChild>
          <Link href="/ops/productos">← Volver al listado</Link>
        </Button>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Datos del producto</CardTitle>
          <CardDescription>SKU inmutable tras creación. Campos requeridos por el checkout: `stripe_price_id` y (si aplica) `docuseal_template_id`.</CardDescription>
        </CardHeader>
        <CardContent>
          <ProductForm product={product} />
        </CardContent>
      </Card>
    </div>
  )
}
