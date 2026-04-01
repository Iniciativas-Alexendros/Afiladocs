import Link from "next/link";
import {
  Scale,
  FileCheck,
  Shield,
  Clock,
  Award,
  BookOpen,
  Users,
  ArrowRight,
  Brain,
  Briefcase,
  Globe,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { ServiceCard } from "@/components/ServiceCard";
import { TrustBullet } from "@/components/TrustBullet";
import { ProcessStep } from "@/components/ProcessStep";
import { TestimonialCard } from "@/components/TestimonialCard";

export default function HomePage() {
  return (
    <>
      {/* Hero */}
      <section className="relative py-24 md:py-32 overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-transparent to-accent/5" />
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative">
          <div className="max-w-3xl mx-auto text-center">
            <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
              <Scale className="w-4 h-4" />
              <span>Documentos legales en lenguaje claro</span>
            </div>
            <h1 className="text-4xl md:text-6xl font-bold text-foreground leading-tight mb-6">
              Tus documentos legales,{" "}
              <span className="text-primary">claros y sin tecnicismos</span>
            </h1>
            <p className="text-lg text-muted-foreground max-w-xl mx-auto mb-8 leading-relaxed">
              Redacción y revisión de documentos legales que entiende todo el
              mundo. Precio cerrado, plazos realistas, trabajo 100% online desde
              Valencia.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Button
                asChild
                size="lg"
                className="bg-primary text-white hover:bg-primary/90 px-8"
              >
                <Link href="/contacto">
                  Pide presupuesto <ArrowRight className="w-4 h-4 ml-2" />
                </Link>
              </Button>
              <Button asChild variant="outline" size="lg">
                <Link href="/servicios">Ver servicios</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Trust Bullets */}
      <section className="py-16 bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-4 gap-4">
            <TrustBullet icon={Shield} text="Lenguaje claro, sin letra pequeña" />
            <TrustBullet icon={Clock} text="Plazos realistas y garantizados" />
            <TrustBullet icon={Award} text="Precio cerrado desde el inicio" />
            <TrustBullet icon={Globe} text="100% online desde Valencia" />
          </div>
        </div>
      </section>

      {/* Servicios */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Servicios principales
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Cada servicio incluye presupuesto cerrado y entrega en plazos
              realistas
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <ServiceCard
              icon={FileCheck}
              title="Redacción de documentos"
              description="Contratos, escritos y cualquier documento legal redactado en lenguaje claro."
              price="Desde 90 €"
              link="/servicios"
            />
            <ServiceCard
              icon={BookOpen}
              title="Revisión y corrección"
              description="Revisamos tus documentos,  detectamos riesgos y mejoramos la redacción."
              price="Desde 60 €"
              link="/servicios"
            />
            <ServiceCard
              icon={Briefcase}
              title="Informes jurídicos"
              description="Análisis jurídicos claros sobre cualquier cuestión legal que necesites resolver."
              price="Desde 120 €"
              link="/informes-juridicos"
            />
            <ServiceCard
              icon={Scale}
              title="Recursos y reclamaciones"
              description="Impugnaciones de sanciones, reclamaciones y recursos administrativos."
              price="Desde 150 €"
              link="/servicios"
            />
            <ServiceCard
              icon={Users}
              title="Asesoramiento legal"
              description="Consultas puntuales o asesoramiento continuado para empresas."
              price="Desde 45 €"
              link="/servicios"
            />
            <ServiceCard
              icon={Brain}
              title="LegalTech & IA"
              description="Herramientas de IA aplicadas a la revisión y análisis de documentos legales."
              price="Consultar"
              link="/legaltech-ia"
            />
          </div>
        </div>
      </section>

      {/* Proceso */}
      <section className="py-20 bg-card/50 border-y border-border">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              ¿Cómo funciona?
            </h2>
            <p className="text-muted-foreground max-w-lg mx-auto">
              Un proceso simple y transparente, de principio a fin
            </p>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <ProcessStep
              number={1}
              title="Cuéntame tu caso"
              description="Explícame qué necesitas por el formulario de contacto o WhatsApp."
            />
            <ProcessStep
              number={2}
              title="Presupuesto cerrado"
              description="Te envío un presupuesto fijo con el plazo de entrega garantizado."
            />
            <ProcessStep
              number={3}
              title="Trabajo y revisión"
              description="Redacto o reviso tu documento. Incluye una ronda de correcciones."
            />
            <ProcessStep
              number={4}
              title="Entrega final"
              description="Recibes tu documento listo para usar, en formato PDF y Word."
              isLast
            />
          </div>
        </div>
      </section>

      {/* Testimonios */}
      <section className="py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold text-foreground mb-4">
              Lo que dicen mis clientes
            </h2>
          </div>
          <div className="columns-1 md:columns-2 lg:columns-3 gap-6">
            <TestimonialCard
              name="Carlos M."
              city="Madrid"
              service="Contrato de arrendamiento"
              quote="Por fin un contrato que entiendo de principio a fin. Sin cláusulas oscuras ni letra pequeña."
            />
            <TestimonialCard
              name="Ana P."
              city="Barcelona"
              service="Recurso de sanción DGT"
              quote="Me quitaron la multa. Servicio rápido, claro y eficaz. Muy recomendable."
            />
            <TestimonialCard
              name="Sofía L."
              city="Valencia"
              service="Revisión de contrato laboral"
              quote="Me detectaron tres cláusulas abusivas que yo no había visto. Merece mucho la pena."
            />
          </div>
        </div>
      </section>

      {/* CTA Final */}
      <section className="py-20 bg-accent text-white">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            ¿Necesitas un documento legal claro?
          </h2>
          <p className="text-lg opacity-90 mb-8 leading-relaxed">
            Cuéntame tu caso y te envío un presupuesto cerrado en menos de 24
            horas.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-white hover:bg-primary/90 px-8"
          >
            <Link href="/contacto">
              Solicitar presupuesto <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </section>
    </>
  );
}
