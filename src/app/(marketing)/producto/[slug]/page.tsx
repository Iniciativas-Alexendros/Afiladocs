import type { Metadata } from 'next'
import Link from 'next/link'
import { notFound } from 'next/navigation'
import { ArrowLeft, Check, ShieldCheck } from 'lucide-react'
import { getProductBySlug } from '@/lib/catalog/query'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { DeliveryBadge } from '@/components/DeliveryBadge'
import { BuyButton } from '@/components/BuyButton'
import { formatCurrency } from '@/lib/format'
import { publicEnv } from '@/lib/env'

export const dynamic = 'force-dynamic'

const DELIVERY_DESCRIPTION: Record<string, string> = {
  docuseal_fill_and_sign: 'Rellenas los campos online, firmas con validez eIDAS y recibes el PDF firmado en tu email.',
  docuseal_fill_only: 'Rellenas los datos online y recibes el documento listo (sin firma).',
  download_after_payment: 'Descarga inmediata del documento tras el pago, con enlace válido 7 días (renovable).',
  human_review: 'Subes tu documento y un profesional lo revisa con notas legales. Entrega en 72h laborables.',
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) return { title: 'Producto no encontrado' }
  return {
    title: `${product.title} | Afiladocs`,
    description: product.description_md.split('\n\n')[0].replace(/[*_#]/g, '').slice(0, 160),
    openGraph: {
      title: product.title,
      description: product.description_md.split('\n\n')[0].replace(/[*_#]/g, '').slice(0, 200),
      type: 'website',
    },
  }
}

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const product = await getProductBySlug(slug)
  if (!product) notFound()

  const deliveryDescription = DELIVERY_DESCRIPTION[product.delivery_mode] ?? ''
  const canBuy = Boolean(product.stripe_price_id)

  const schema = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    sku: product.sku,
    name: product.title,
    description: product.description_md.split('\n\n')[0].replace(/[*_#]/g, '').slice(0, 400),
    url: `${publicEnv.siteUrl}/producto/${product.slug}`,
    brand: { '@type': 'Brand', name: 'Afiladocs' },
    offers: {
      '@type': 'Offer',
      priceCurrency: 'EUR',
      price: (product.price_cents / 100).toFixed(2),
      availability: canBuy ? 'https://schema.org/InStock' : 'https://schema.org/PreOrder',
      url: `${publicEnv.siteUrl}/producto/${product.slug}`,
    },
  }

  return (
    <section className="py-12 md:py-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/tienda" className="inline-flex items-center text-sm text-muted-foreground hover:text-foreground mb-6">
          <ArrowLeft className="size-4 mr-1" /> Volver a la tienda
        </Link>

        <div className="flex flex-wrap gap-2 mb-4">
          <DeliveryBadge mode={product.delivery_mode} />
          <Badge variant="outline">{product.category}</Badge>
          {product.eidas_level === 'AES' && (
            <Badge variant="outline" className="bg-purple-50 border-purple-300 text-purple-800">eIDAS AES</Badge>
          )}
        </div>

        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">{product.title}</h1>

        <div className="prose prose-slate max-w-none mb-8 text-muted-foreground">
          {product.description_md.split('\n\n').map((para, i) => (
            <p key={i} className="mb-3 whitespace-pre-wrap">{para}</p>
          ))}
        </div>

        <Card className="mb-8">
          <CardContent className="pt-6 flex flex-col md:flex-row md:items-center gap-6">
            <div className="flex-1">
              <p className="text-3xl font-bold text-primary">{formatCurrency(product.price_cents, 'eur')}</p>
              <p className="text-sm text-muted-foreground mt-1">IVA {product.vat_mode === 'included' ? 'incluido' : 'no incluido'}</p>
            </div>
            <div className="flex flex-col sm:flex-row gap-3">
              {canBuy ? (
                <BuyButton sku={product.sku} />
              ) : (
                <Badge variant="outline" className="bg-amber-50 border-amber-300 text-amber-800 py-2 px-3">Próximamente</Badge>
              )}
            </div>
          </CardContent>
        </Card>

        {deliveryDescription && (
          <div className="bg-muted rounded-xl p-5 mb-8 flex items-start gap-3">
            <ShieldCheck className="size-5 text-primary shrink-0 mt-0.5" />
            <p className="text-sm text-foreground">{deliveryDescription}</p>
          </div>
        )}

        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-sm">
          <Feature label="Redactado por abogado" />
          <Feature label="Lenguaje claro" />
          <Feature label="Factura Verifactu" />
        </div>

        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(schema) }} />
      </div>
    </section>
  )
}

function Feature({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-2 bg-card border border-border rounded-lg p-3">
      <Check className="size-4 text-primary" />
      <span>{label}</span>
    </div>
  )
}
