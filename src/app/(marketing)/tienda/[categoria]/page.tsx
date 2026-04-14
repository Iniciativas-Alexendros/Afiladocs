import type { Metadata } from 'next'
import { notFound } from 'next/navigation'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { getActiveProducts, getProductsByCategory, type ProductCategory } from '@/lib/catalog/query'
import { ProductCard } from '@/components/ProductCard'
import { CategoryFilter } from '@/components/CategoryFilter'
import { publicEnv } from '@/lib/env'

const VALID: readonly ProductCategory[] = ['rgpd', 'arrendamiento', 'civil', 'mercantil', 'pack', 'reclamacion', 'review']

const LABELS: Record<ProductCategory, { title: string; description: string }> = {
  rgpd: { title: 'Documentos RGPD', description: 'Cumplimiento LOPDGDD: registros, cláusulas, políticas y avisos.' },
  arrendamiento: { title: 'Arrendamientos', description: 'Contratos de vivienda, local y habitación con cláusulas actualizadas.' },
  civil: { title: 'Derecho civil', description: 'Contratos y acuerdos civiles en lenguaje claro.' },
  mercantil: { title: 'Derecho mercantil', description: 'Contratos de prestación de servicios, NDAs, acuerdos comerciales.' },
  pack: { title: 'Packs', description: 'Paquetes de documentos combinados con descuento.' },
  reclamacion: { title: 'Reclamaciones', description: 'Modelos de reclamación para consumidor y administraciones.' },
  review: { title: 'Revisiones expertas', description: 'Revisa tu contrato o documento con un profesional.' },
}

function isValid(c: string): c is ProductCategory {
  return (VALID as readonly string[]).includes(c)
}

export async function generateMetadata({ params }: { params: Promise<{ categoria: string }> }): Promise<Metadata> {
  const { categoria } = await params
  if (!isValid(categoria)) return { title: 'Categoría no encontrada' }
  const cfg = LABELS[categoria]
  return {
    title: `${cfg.title} | Tienda Afiladocs`,
    description: cfg.description,
  }
}

export const dynamic = 'force-dynamic'

export default async function CategoriaPage({ params }: { params: Promise<{ categoria: string }> }) {
  const { categoria } = await params
  if (!isValid(categoria)) notFound()

  const cfg = LABELS[categoria]
  const [products, all] = await Promise.all([
    getProductsByCategory(categoria),
    getActiveProducts(),
  ])
  const categories = Array.from(new Set(all.map(p => p.category))).sort((a, b) => a.localeCompare(b))

  return (
    <section className="py-16 md:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/tienda" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4 mr-1" /> Toda la tienda
        </Link>

        <header className="max-w-3xl mb-10">
          <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-3">{cfg.title}</h1>
          <p className="text-lg text-muted-foreground">{cfg.description}</p>
        </header>

        <div className="mb-10">
          <CategoryFilter active={categoria} categories={categories} />
        </div>

        {products.length === 0 ? (
          <div className="bg-muted rounded-2xl p-10 text-center">
            <p className="text-muted-foreground">Todavía no hay productos en esta categoría.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {products.map(p => (
              <ProductCard key={p.sku} product={p} />
            ))}
          </div>
        )}

        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'BreadcrumbList',
              itemListElement: [
                { '@type': 'ListItem', position: 1, name: 'Inicio', item: publicEnv.siteUrl },
                { '@type': 'ListItem', position: 2, name: 'Tienda', item: `${publicEnv.siteUrl}/tienda` },
                { '@type': 'ListItem', position: 3, name: cfg.title, item: `${publicEnv.siteUrl}/tienda/${categoria}` },
              ],
            }),
          }}
        />
      </div>
    </section>
  )
}
