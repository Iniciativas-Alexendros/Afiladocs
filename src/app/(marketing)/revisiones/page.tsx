import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ClipboardList, Clock, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { getProductsByCategory } from '@/lib/catalog/query'
import { ProductCard } from '@/components/ProductCard'

export const dynamic = 'force-dynamic'

export const metadata: Metadata = {
  title: 'Revisiones expertas de contratos | Afiladocs',
  description:
    'Un abogado revisa tu contrato en 72h laborables. Recibes informe con observaciones, riesgos y sugerencias de redacción. Pago único, sin suscripciones.',
  alternates: { canonical: '/revisiones' },
}

export default async function RevisionesPage() {
  const reviewProducts = await getProductsByCategory('review')

  return (
    <>
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <UserCheck className="w-4 h-4" /> Revisión humana
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5 tracking-tight">
            Un abogado revisa tu contrato en 72 horas
          </h1>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Envías el documento, un experto jurídico lo analiza y te devuelve informe con
            observaciones, riesgos detectados y sugerencias de redacción. Pago único, sin
            suscripciones.
          </p>
          <Button asChild size="lg">
            <Link href="#producto">Contratar revisión</Link>
          </Button>
        </div>
      </section>

      <section className="py-16 bg-muted/30">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-12">
            Cómo funciona
          </h2>
          <div className="grid md:grid-cols-3 gap-8">
            <Step
              icon={<ClipboardList className="w-6 h-6" />}
              n="1"
              title="Pagas y subes tu documento"
              text="Un pago único. Tras el cobro, recibes acceso a un portal donde subes el contrato (PDF o DOCX)."
            />
            <Step
              icon={<UserCheck className="w-6 h-6" />}
              n="2"
              title="Un abogado lo revisa"
              text="Un profesional con experiencia en la materia analiza el documento y anota observaciones cláusula por cláusula."
            />
            <Step
              icon={<CheckCircle2 className="w-6 h-6" />}
              n="3"
              title="Recibes el informe en 72h"
              text="Descargas el contrato anotado y una nota legal con riesgos identificados y propuestas de redacción."
            />
          </div>
        </div>
      </section>

      <section id="producto" className="py-20">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between mb-8">
            <h2 className="text-2xl md:text-3xl font-bold text-foreground">
              Revisiones disponibles
            </h2>
            <p className="text-sm text-muted-foreground inline-flex items-center gap-2">
              <Clock className="w-4 h-4" /> SLA 72h laborables
            </p>
          </div>

          {reviewProducts.length === 0 ? (
            <p className="text-muted-foreground">
              Abrimos nuevas plazas periódicamente. <Link href="/contacto" className="underline">Avísanos</Link> y te escribimos cuando haya disponibilidad.
            </p>
          ) : (
            <div className="grid sm:grid-cols-2 gap-6">
              {reviewProducts.map((p) => (
                <ProductCard key={p.sku} product={p} />
              ))}
            </div>
          )}
        </div>
      </section>
    </>
  )
}

function Step({ icon, n, title, text }: { icon: React.ReactNode; n: string; title: string; text: string }) {
  return (
    <div className="bg-card border rounded-lg p-6">
      <div className="flex items-center gap-3 mb-3">
        <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary">
          {icon}
        </div>
        <span className="text-sm font-semibold text-muted-foreground">Paso {n}</span>
      </div>
      <h3 className="text-lg font-semibold text-foreground mb-2">{title}</h3>
      <p className="text-muted-foreground leading-relaxed">{text}</p>
    </div>
  )
}
