import type { Metadata } from 'next'
import Link from 'next/link'
import { ShoppingBag } from 'lucide-react'
import { getActiveProducts } from '@/lib/catalog/query'
import type { ProductCategory } from '@/lib/catalog/query'
import { ProductCard } from '@/components/ProductCard'
import { CategoryFilter } from '@/components/CategoryFilter'
import { Button } from '@/components/ui/button'

export const revalidate = 3600

const VALID_CATS: readonly string[] = [
  'rgpd', 'arrendamiento', 'civil', 'mercantil', 'pack', 'reclamacion', 'review',
]

export const metadata: Metadata = {
  title: 'Tienda de documentos legales | Afiladocs',
  description: 'Plantillas rellenables, packs y revisiones expertas en lenguaje claro. Firma electrónica eIDAS y entrega inmediata tras el pago.',
  openGraph: {
    title: 'Tienda Afiladocs — plantillas legales rellenables',
    description: 'Plantillas rellenables, packs y revisiones expertas en lenguaje claro.',
    type: 'website',
  },
}

export default async function TiendaPage({
  searchParams,
}: {
  searchParams: Promise<{ cat?: string }>
}) {
  const { cat } = await searchParams
  const activeCategory = cat && VALID_CATS.includes(cat) ? (cat as ProductCategory) : null

  const allProducts = await getActiveProducts()
  const products = activeCategory
    ? allProducts.filter(p => p.category === activeCategory)
    : allProducts
  const categories = Array.from(new Set(allProducts.map(p => p.category))).sort((a, b) => a.localeCompare(b))

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <header className="max-w-3xl mx-auto text-center mb-10">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <ShoppingBag className="w-4 h-4" />
            <span>Tienda de documentos</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Plantillas legales listas para rellenar
          </h1>
          <p className="text-lg text-muted-foreground">
            Redactadas y revisadas por abogado. Rellena tus datos, firma online si procede, recibe el PDF en minutos.
          </p>
        </header>

        <div className="flex justify-center mb-10">
          <CategoryFilter active={activeCategory ?? 'all'} categories={categories} variant="query" />
        </div>

        {products.length === 0 ? (
          <EmptyState />
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <ProductCard key={p.sku} product={p} isPopular={p.sku === 'AFD-PCK-001'} />
            ))}
          </div>
        )}

        <aside className="mt-20 bg-accent text-white rounded-2xl p-10 md:p-12 text-center">
          <h2 className="text-2xl font-bold mb-3">¿Necesitas algo a medida?</h2>
          <p className="opacity-90 mb-6 max-w-xl mx-auto">
            Si las plantillas no cubren tu caso, puedo redactarte un documento personalizado o revisar el tuyo.
          </p>
          <Button asChild className="bg-primary text-white hover:bg-primary/90">
            <Link href="/contacto">Solicitar presupuesto</Link>
          </Button>
        </aside>
      </div>
    </section>
  )
}

function EmptyState() {
  return (
    <div className="bg-muted rounded-2xl p-12 text-center">
      <h2 className="text-xl font-semibold mb-2">Catálogo en preparación</h2>
      <p className="text-muted-foreground">Estamos terminando de publicar las primeras plantillas. Vuelve en unos días.</p>
    </div>
  )
}
