import Link from 'next/link'
import { UserCheck, Clock, CheckCircle, ArrowRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'

const FEATURES = [
  'Revisión de validez jurídica y cláusulas abusivas',
  'Informe detallado con recomendaciones de mejora',
  'Identificación de riesgos y errores formales',
  'Una ronda de consultas incluida sin coste adicional',
]

export function ReviewSection() {
  return (
    <section className="py-20 bg-accent text-accent-foreground">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
          {/* Texto */}
          <div>
            <Badge className="mb-6 bg-primary text-primary-foreground border-0 text-sm px-3 py-1">
              <Clock className="w-3.5 h-3.5 mr-1.5" />
              Entrega en 72 horas
            </Badge>
            <h2 className="text-3xl md:text-4xl font-bold mb-4 text-balance">
              Revisión humana por abogados colegiados
            </h2>
            <p className="text-accent-foreground/80 mb-8 leading-relaxed max-w-md">
              ¿Tienes un contrato, cláusula o documento que no entiendes del todo?
              Nuestros abogados lo revisan, detectan riesgos y te entregan un informe
              claro en menos de 72 horas.
            </p>
            <ul className="space-y-3 mb-8">
              {FEATURES.map((f) => (
                <li key={f} className="flex items-start gap-3 text-sm text-accent-foreground/90">
                  <CheckCircle className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  {f}
                </li>
              ))}
            </ul>
            <Button asChild size="lg" className="bg-primary text-primary-foreground hover:bg-primary/90 px-8">
              <Link href="/tienda?tipo=revision">
                Ver servicio de revisión <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          {/* Icono decorativo */}
          <div className="flex items-center justify-center lg:justify-end" aria-hidden>
            <div className="w-48 h-48 rounded-full bg-white/5 border border-white/10 flex items-center justify-center">
              <UserCheck className="w-24 h-24 text-primary/70" />
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
