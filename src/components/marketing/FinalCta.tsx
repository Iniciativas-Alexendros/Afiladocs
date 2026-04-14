import Link from 'next/link'
import { ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'

export function FinalCta() {
  return (
    <section className="py-20 bg-accent text-accent-foreground">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
          ¿Necesitas un documento legal claro?
        </h2>
        <p className="text-lg text-accent-foreground/80 mb-10 leading-relaxed">
          Precio cerrado desde el primer momento. Entrega garantizada en 48 horas.
          Revisión de abogado incluida.
        </p>
        <Button
          asChild
          size="lg"
          className="bg-primary text-primary-foreground hover:bg-primary/90 px-8 text-base font-semibold"
        >
          <Link href="/tienda">
            Ir al catálogo <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
        <p className="mt-6 text-sm text-accent-foreground/60">
          Sin permanencia &middot; Pago único &middot; Soporte incluido
        </p>
      </div>
    </section>
  )
}
