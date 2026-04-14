import { Shield, Key, FileCheck, Quote } from 'lucide-react'

const TRUST_ITEMS = [
  {
    icon: Shield,
    title: 'Conformidad RGPD',
    description: 'Tratamiento de datos conforme al Reglamento General de Protección de Datos.',
  },
  {
    icon: Key,
    title: 'Firma eIDAS AES',
    description: 'Firmas electrónicas avanzadas con plena validez jurídica en la Unión Europea.',
  },
  {
    icon: FileCheck,
    title: 'Facturación Verifactu',
    description: 'Sistema de facturación verificable conforme a la normativa tributaria española.',
  },
]

const TESTIMONIALS = [
  {
    name: 'Carlos M.',
    city: 'Madrid',
    service: 'Contrato de arrendamiento',
    quote: 'Por fin un contrato que entiendo de principio a fin. Sin cláusulas oscuras ni letra pequeña.',
  },
  {
    name: 'Ana P.',
    city: 'Barcelona',
    service: 'Recurso de sanción DGT',
    quote: 'Me quitaron la multa. Servicio rápido, claro y eficaz. Muy recomendable.',
  },
  {
    name: 'Sofía L.',
    city: 'Valencia',
    service: 'Revisión de contrato laboral',
    quote: 'Me detectaron tres cláusulas abusivas que yo no había visto. Merece mucho la pena.',
  },
]

export function SocialProof() {
  return (
    <section className="py-20 bg-stone-50 border-y border-border">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Confianza */}
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-3">
            Transparencia y confianza
          </h2>
          <p className="text-muted-foreground max-w-md mx-auto">
            Operamos con los más altos estándares de seguridad y cumplimiento normativo
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-20">
          {TRUST_ITEMS.map(({ icon: Icon, title, description }) => (
            <div
              key={title}
              className="bg-card rounded-xl border border-border p-6 shadow-sm text-center"
            >
              <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-4">
                <Icon className="w-6 h-6 text-primary" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">{description}</p>
            </div>
          ))}
        </div>

        {/* Testimonios */}
        <div className="text-center mb-10">
          <h2 className="text-2xl md:text-3xl font-bold text-foreground">
            Lo que dicen nuestros clientes
          </h2>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {TESTIMONIALS.map(({ name, city, service, quote }) => (
            <figure
              key={name}
              className="bg-card rounded-xl border border-border p-6 shadow-sm flex flex-col gap-4"
            >
              <Quote className="w-6 h-6 text-primary/40 shrink-0" aria-hidden />
              <blockquote className="text-foreground/90 italic leading-relaxed flex-1">
                &ldquo;{quote}&rdquo;
              </blockquote>
              <figcaption className="text-sm text-muted-foreground">
                <span className="font-semibold text-foreground">{name}</span>{' '}
                &middot; {city} &middot; {service}
              </figcaption>
            </figure>
          ))}
        </div>
      </div>
    </section>
  )
}
