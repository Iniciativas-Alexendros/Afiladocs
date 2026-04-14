import type { Metadata } from 'next'
import Link from 'next/link'
import { Check, Minus, Star, Bell, FileText, UserCheck } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

export const metadata: Metadata = {
  title: 'Suscripciones legales | Afiladocs',
  description:
    'Monitor normativo continuo y documentos legales ilimitados. Planes mensuales para autónomos, pymes y despachos. Cancela cuando quieras.',
}

const PLANS = [
  {
    id: 'basico',
    name: 'Básico',
    price: '29',
    period: 'mes',
    description: 'Para autónomos y pequeñas empresas que quieren estar al día sin complicaciones.',
    popular: false,
    features: [
      { label: 'Monitor normativo (RGPD, AEPD, BOE)', included: true },
      { label: 'Alertas por email', included: true },
      { label: '2 documentos al mes', included: true },
      { label: 'Acceso a plantillas base', included: true },
      { label: 'Revisiones expertas', included: false },
      { label: 'Soporte prioritario', included: false },
    ],
    cta: 'Reservar plaza',
    href: '/contacto?plan=basico',
  },
  {
    id: 'profesional',
    name: 'Profesional',
    price: '79',
    period: 'mes',
    description: 'Para empresas en crecimiento que necesitan documentación recurrente y asesoramiento.',
    popular: true,
    features: [
      { label: 'Monitor normativo (RGPD, AEPD, BOE)', included: true },
      { label: 'Alertas por email + resumen semanal', included: true },
      { label: '5 documentos al mes', included: true },
      { label: 'Acceso a todas las plantillas', included: true },
      { label: '1 revisión experta al mes', included: true },
      { label: 'Soporte prioritario', included: false },
    ],
    cta: 'Reservar plaza',
    href: '/contacto?plan=profesional',
  },
  {
    id: 'empresa',
    name: 'Empresa',
    price: '149',
    period: 'mes',
    description: 'Para despachos y empresas con alta demanda documental y requerimientos legales complejos.',
    popular: false,
    features: [
      { label: 'Monitor normativo (RGPD, AEPD, BOE)', included: true },
      { label: 'Alertas por email + briefing diario', included: true },
      { label: 'Documentos ilimitados', included: true },
      { label: 'Acceso a todas las plantillas', included: true },
      { label: '3 revisiones expertas al mes', included: true },
      { label: 'Soporte prioritario 24h', included: true },
    ],
    cta: 'Contactar',
    href: '/contacto?plan=empresa',
  },
] as const

const BENEFITS = [
  { icon: Bell, title: 'Alertas normativas', text: 'Monitorizamos el BOE, AEPD y DOGV por ti. Recibes solo lo relevante para tu actividad.' },
  { icon: FileText, title: 'Documentos recurrentes', text: 'Genera contratos, políticas y formularios cada mes sin pagar por separado cada vez.' },
  { icon: UserCheck, title: 'Revisión humana', text: 'Un abogado revisa tus documentos y resuelve dudas. Incluido según plan.' },
]

export default function SuscripcionesPage() {
  return (
    <div className="py-16 md:py-20">
      {/* Hero */}
      <section className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center mb-16">
        <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
          <Bell className="w-4 h-4" />
          <span>Suscripciones y monitor normativo</span>
        </div>
        <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4 tracking-tight">
          Cumplimiento legal continuo, sin sorpresas
        </h1>
        <p className="text-lg text-muted-foreground mb-4">
          Monitorización normativa automática, documentos recurrentes y revisión experta.
          Todo en un plan mensual que puedes cancelar cuando quieras.
        </p>
        <p className="inline-flex items-center gap-1.5 text-sm bg-amber-50 border border-amber-200 text-amber-800 px-3 py-1.5 rounded-md">
          <Star className="size-3.5 fill-amber-500 text-amber-500" />
          Plazas limitadas — reserva la tuya ahora y te avisamos al lanzar
        </p>
      </section>

      {/* Benefits */}
      <section className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {BENEFITS.map(({ icon: Icon, title, text }) => (
            <div key={title} className="bg-card border border-border rounded-xl p-6">
              <div className="inline-flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mb-4">
                <Icon className="w-5 h-5" />
              </div>
              <h3 className="font-semibold text-foreground mb-2">{title}</h3>
              <p className="text-sm text-muted-foreground leading-relaxed">{text}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Plans */}
      <section className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 mb-16">
        <h2 className="text-2xl md:text-3xl font-bold text-foreground text-center mb-10">
          Elige tu plan
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-start">
          {PLANS.map((plan) => (
            <div
              key={plan.id}
              className={`relative bg-card border rounded-2xl p-8 flex flex-col${plan.popular ? ' ring-2 ring-primary border-primary/50 shadow-md' : ' border-border'}`}
            >
              {plan.popular && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <Badge className="bg-primary text-primary-foreground px-3 py-1 text-xs font-semibold gap-1">
                    <Star className="size-3 fill-current" /> Más popular
                  </Badge>
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-bold text-foreground mb-1">{plan.name}</h3>
                <p className="text-sm text-muted-foreground mb-4 leading-relaxed">{plan.description}</p>
                <div className="flex items-end gap-1">
                  <span className="text-4xl font-bold text-foreground">{plan.price}€</span>
                  <span className="text-muted-foreground pb-1">/{plan.period}</span>
                </div>
              </div>

              <ul className="space-y-3 mb-8 flex-1">
                {plan.features.map((f) => (
                  <li key={f.label} className="flex items-start gap-2.5 text-sm">
                    {f.included ? (
                      <Check className="size-4 shrink-0 mt-0.5 text-primary" />
                    ) : (
                      <Minus className="size-4 shrink-0 mt-0.5 text-muted-foreground/50" />
                    )}
                    <span className={f.included ? 'text-foreground' : 'text-muted-foreground'}>
                      {f.label}
                    </span>
                  </li>
                ))}
              </ul>

              <Button
                asChild
                variant={plan.popular ? 'default' : 'outline'}
                className="w-full"
              >
                <Link href={plan.href}>{plan.cta}</Link>
              </Button>
            </div>
          ))}
        </div>

        <p className="text-center text-sm text-muted-foreground mt-6">
          Sin permanencia. Cancela en cualquier momento. IVA no incluido.
        </p>
      </section>

      {/* FAQ stub */}
      <section className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <p className="text-muted-foreground mb-4">
          ¿Tienes dudas sobre qué plan se adapta mejor a ti?
        </p>
        <Button asChild variant="outline">
          <Link href="/contacto">Habla con nosotros</Link>
        </Button>
      </section>
    </div>
  )
}
