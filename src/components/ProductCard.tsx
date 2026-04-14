import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeliveryBadge } from './DeliveryBadge'
import { formatCurrency } from '@/lib/format'
import { ArrowRight } from 'lucide-react'

export type ProductCardData = {
  sku: string
  slug: string
  title: string
  description_md: string
  category: string
  kind: string
  price_cents: number
  delivery_mode: string
  eidas_level: string
}

export function ProductCard({ product }: { product: ProductCardData }) {
  // Resumen: primer párrafo del markdown
  const summary = product.description_md.split('\n\n')[0].replace(/[*_#]/g, '').slice(0, 220)

  return (
    <Card className="flex flex-col h-full transition-all duration-200 hover:border-primary/40 hover:shadow-md">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between gap-2 mb-2">
          <DeliveryBadge mode={product.delivery_mode} />
          {product.eidas_level === 'AES' && (
            <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-800 text-[10px]">eIDAS AES</Badge>
          )}
        </div>
        <CardTitle className="text-lg leading-tight">{product.title}</CardTitle>
        <CardDescription className="line-clamp-3">{summary}</CardDescription>
      </CardHeader>
      <CardContent className="flex-1" />
      <CardFooter className="flex items-center justify-between border-t border-border pt-4">
        <span className="text-primary font-bold text-lg">{formatCurrency(product.price_cents, 'eur')}</span>
        <Button variant="outline" size="sm" asChild>
          <Link href={`/producto/${product.slug}`}>
            Ver detalle <ArrowRight className="size-3 ml-1" />
          </Link>
        </Button>
      </CardFooter>
    </Card>
  )
}
