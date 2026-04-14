import Link from 'next/link'
import { Card, CardContent, CardHeader, CardTitle, CardDescription, CardFooter } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DeliveryBadge } from './DeliveryBadge'
import { formatCurrency } from '@/lib/format'
import { ArrowRight, Star } from 'lucide-react'

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

export function ProductCard({ product, isPopular }: { product: ProductCardData; isPopular?: boolean }) {
  // Resumen: primer párrafo del markdown
  const summary = product.description_md.split('\n\n')[0].replace(/[*_#]/g, '').slice(0, 220)

  return (
    <div className="relative">
      {isPopular && (
        <div className="absolute -top-3 left-1/2 -translate-x-1/2 z-10">
          <Badge className="bg-primary text-primary-foreground text-[11px] font-semibold px-3 py-1 shadow-sm gap-1">
            <Star className="size-3 fill-current" /> Más popular
          </Badge>
        </div>
      )}
      <Card className={`flex flex-col h-full transition-all duration-200 hover:border-primary/40 hover:shadow-md${isPopular ? ' ring-2 ring-primary/30 border-primary/40' : ''}`}>
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
    </div>
  )
}
