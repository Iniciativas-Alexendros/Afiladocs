import Link from 'next/link'
import { Shield, Key, FileCheck, ArrowRight, Scale } from 'lucide-react'
import { Button } from '@/components/ui/button'

const BADGES = [
  { icon: Shield, label: 'Conformidad RGPD' },
  { icon: Key, label: 'Firma eIDAS AES' },
  { icon: FileCheck, label: 'Verifactu' },
]

export function HeroSection() {
  return (
    <section className="relative flex items-center min-h-screen md:min-h-[80vh] overflow-hidden bg-gradient-to-br from-stone-50 via-amber-50/40 to-accent/5">
      {/* Fondo decorativo */}
      <div aria-hidden className="absolute inset-0 pointer-events-none">
        <div className="absolute -top-24 -right-24 w-96 h-96 rounded-full bg-amber-400/10 blur-3xl" />
        <div className="absolute bottom-0 -left-16 w-72 h-72 rounded-full bg-accent/8 blur-3xl" />
      </div>

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 w-full">
        <div className="max-w-3xl mx-auto text-center">
          {/* Eyebrow */}
          <div className="afd-fade-up">
            <div className="inline-flex items-center gap-2 bg-amber-50 border border-amber-200 text-amber-600 px-4 py-2 rounded-full text-sm font-medium mb-8">
              <Scale className="w-4 h-4 shrink-0" />
              <span>Documentos legales a precio cerrado</span>
            </div>
          </div>

          {/* Headline */}
          <h1
            className="afd-fade-up text-5xl lg:text-7xl font-bold tracking-tight text-foreground leading-[1.1] mb-6"
            style={{ ['--afd-delay' as string]: '80ms' }}
          >
            Tu documento legal,{' '}
            <span className="text-primary">listo en 48 horas</span>
          </h1>

          {/* Subtítulo */}
          <p
            className="afd-fade-up text-lg md:text-xl text-muted-foreground max-w-xl mx-auto mb-10 leading-relaxed"
            style={{ ['--afd-delay' as string]: '160ms' }}
          >
            Redacción y revisión de documentos jurídicos por abogados colegiados. Precio cerrado,
            100&nbsp;% online, sin letra pequeña.
          </p>

          {/* CTAs */}
          <div
            className="afd-fade-up flex flex-col sm:flex-row items-center justify-center gap-4 mb-12"
            style={{ ['--afd-delay' as string]: '240ms' }}
          >
            <Button asChild size="lg" className="px-8 text-base font-semibold">
              <Link href="/tienda">
                Ver catálogo <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
            <Button asChild size="lg" variant="outline" className="px-8 text-base">
              <Link href="/tienda?tipo=revision">
                Revisión 72h →
              </Link>
            </Button>
          </div>

          {/* Badges de confianza */}
          <div
            className="afd-fade-up flex flex-wrap items-center justify-center gap-3"
            style={{ ['--afd-delay' as string]: '320ms' }}
          >
            {BADGES.map(({ icon: Icon, label }) => (
              <span
                key={label}
                className="inline-flex items-center gap-1.5 bg-white/80 border border-border text-muted-foreground text-sm px-3 py-1.5 rounded-full shadow-sm"
              >
                <Icon className="w-3.5 h-3.5 text-primary" />
                {label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </section>
  )
}
