import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { ProductCard, type ProductCardData } from '@/components/ProductCard'

interface CatalogSectionProps {
  products: ProductCardData[]
}

export function CatalogSection({ products }: CatalogSectionProps) {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Catálogo destacado
          </h2>
          <p className="text-muted-foreground max-w-lg mx-auto">
            Documentos redactados por abogados colegiados, listos para usar y
            adaptados a tu situación
          </p>
        </div>

        {products.length === 0 ? (
          <p className="text-center text-muted-foreground py-12">
            Catálogo en preparación. Vuelve pronto.
          </p>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-10">
            {products.map((p) => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        )}

        <div className="text-center">
          <Button asChild variant="outline" size="lg">
            <Link href="/tienda">
              Ver catálogo completo <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  )
}
