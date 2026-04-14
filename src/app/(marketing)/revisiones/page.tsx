import type { Metadata } from 'next'
import Link from 'next/link'
import { CheckCircle2, ClipboardList, Clock, UserCheck, CreditCard } from 'lucide-react'
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

  const howToSchema = {
    '@context': 'https://schema.org',
    '@type': 'HowTo',
    name: 'Cómo funciona la revisión de contratos en afiladocs',
    totalTime: 'PT72H',
    step: [
      {
        '@type': 'HowToStep',
        position: 1,
        name: 'Pagas y subes tu documento',
        text: 'Un pago único. Tras el cobro, recibes acceso a un portal donde subes el contrato (PDF o DOCX).',
      },
      {
        '@type': 'HowToStep',
        position: 2,
        name: 'Un abogado lo revisa',
        text: 'Un profesional con experiencia en la materia analiza el documento y anota observaciones cláusula por cláusula.',
      },
      {
        '@type': 'HowToStep',
        position: 3,
        name: 'Recibes el informe en 72h',
        text: 'Descargas el contrato anotado y una nota legal con riesgos identificados y propuestas de redacción.',
      },
    ],
  }

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: '¿Qué incluye la revisión de documentos?',
        acceptedAnswer: { '@type': 'Answer', text: 'La revisión cubre la validez jurídica, cláusulas abusivas o perjudiciales, errores formales y recomendaciones de mejora. Recibes un informe detallado en menos de 72 horas.' },
      },
      {
        '@type': 'Question',
        name: '¿Cuánto tarda la revisión?',
        acceptedAnswer: { '@type': 'Answer', text: 'El plazo habitual es de 72 horas laborables desde que subes el documento.' },
      },
      {
        '@type': 'Question',
        name: '¿Puedo solicitar una consulta antes de comprar?',
        acceptedAnswer: { '@type': 'Answer', text: 'Sí. Ofrecemos una primera valoración gratuita a través de nuestro formulario de contacto.' },
      },
    ],
  }

  return (
    <>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(howToSchema) }} />
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }} />
      <section className="py-20 md:py-28">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <UserCheck className="w-4 h-4" /> Revisión humana
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-5 tracking-tight">
            Un abogado revisa tu contrato en 72 horas
          </h1>
          <div className="flex flex-wrap justify-center gap-3 mb-6">
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
              <Clock className="w-4 h-4" /> 72h laborables
            </span>
            <span className="inline-flex items-center gap-1.5 bg-primary/10 text-primary px-3 py-1.5 rounded-full text-sm font-medium">
              <CreditCard className="w-4 h-4" /> Pago único
            </span>
          </div>
          <p className="text-lg md:text-xl text-muted-foreground mb-8 leading-relaxed">
            Envías el documento, un experto jurídico lo analiza y te devuelve informe con
            observaciones, riesgos detectados y sugerencias de redacción. Sin suscripciones.
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
