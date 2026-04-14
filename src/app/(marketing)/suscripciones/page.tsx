import type { Metadata } from 'next'
import Link from 'next/link'
import { Construction } from 'lucide-react'
import { Button } from '@/components/ui/button'

export const metadata: Metadata = {
  title: 'Suscripciones | Afiladocs',
  description: 'Monitor normativo y suscripciones — en construcción.',
  robots: { index: false, follow: true },
}

export default function SuscripcionesPlaceholder() {
  return (
    <section className="py-24 md:py-32">
      <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <div className="inline-flex items-center gap-2 bg-muted text-muted-foreground px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Construction className="w-4 h-4" /> En construcción
        </div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
          Suscripciones y monitor normativo
        </h1>
        <p className="text-lg text-muted-foreground mb-8">
          Estamos trabajando en la siguiente versión del monitor normativo y las suscripciones recurrentes.
          Mientras tanto, puedes comprar plantillas y revisiones expertas de pago único en la tienda.
        </p>
        <Button asChild size="lg">
          <Link href="/tienda">Ver tienda</Link>
        </Button>
      </div>
    </section>
  )
}
