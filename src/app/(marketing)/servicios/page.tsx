import type { Metadata } from "next";
import Link from "next/link";
import {
  FileCheck,
  BookOpen,
  Scale,
  Users,
  Shield,
  PenTool,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Servicios",
  description:
    "Redacción, revisión de documentos legales, informes jurídicos, recursos y reclamaciones. Precio cerrado y plazos realistas.",
};

const services = [
  {
    icon: FileCheck,
    title: "Redacción de documentos",
    description:
      "Contratos, escritos judiciales, acuerdos, estatutos y cualquier documento legal redactado en lenguaje claro y sin tecnicismos innecesarios.",
    includes: [
      "Redacción completa del documento",
      "Una ronda de revisiones incluida",
      "Entrega en PDF y Word",
      "Plazo de entrega garantizado",
    ],
    price: "Desde 90 €",
  },
  {
    icon: BookOpen,
    title: "Revisión y corrección",
    description:
      "Revisamos tus documentos legales para detectar cláusulas abusivas, errores y posibles riesgos. Te lo devolvemos con mejoras concretas.",
    includes: [
      "Detección de cláusulas abusivas",
      "Análisis de riesgos contractuales",
      "Propuesta de mejoras",
      "Informe escrito de hallazgos",
    ],
    price: "Desde 60 €",
  },
  {
    icon: Scale,
    title: "Recursos y reclamaciones",
    description:
      "Impugnaciones de sanciones de tráfico, reclamaciones administrativas, recursos en materia laboral, fiscal o administrativa.",
    includes: [
      "Estudio previo de viabilidad",
      "Redacción del recurso",
      "Seguimiento del expediente",
      "Notificación del resultado",
    ],
    price: "Desde 150 €",
  },
  {
    icon: Users,
    title: "Asesoramiento legal",
    description:
      "Consultas puntuales o asesoramiento continuado para autónomos y empresas. Resuelve tus dudas legales con una opinión profesional clara.",
    includes: [
      "Consulta por videollamada o escrito",
      "Respuesta en lenguaje claro",
      "Recomendaciones accionables",
      "Seguimiento si fuera necesario",
    ],
    price: "Desde 45 €",
  },
  {
    icon: PenTool,
    title: "Contratos a medida",
    description:
      "Contratos personalizados para tu negocio: prestación de servicios, compraventa, confidencialidad, sociedades, y más.",
    includes: [
      "Análisis previo de necesidades",
      "Contrato redactado a medida",
      "Negociación de cláusulas",
      "Revisiones incluidas",
    ],
    price: "Desde 120 €",
  },
  {
    icon: Shield,
    title: "Protección de datos (RGPD)",
    description:
      "Adaptación al RGPD y LOPDGDD para tu web, app o negocio. Políticas de privacidad, cookies, contratos de encargado de tratamiento.",
    includes: [
      "Auditoría de cumplimiento RGPD",
      "Redacción de políticas legales",
      "Contrato con encargados de tratamiento",
      "Registro de actividades de tratamiento",
    ],
    price: "Desde 180 €",
  },
];

export default function ServiciosPage() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Servicios legales
          </h1>
          <p className="text-lg text-muted-foreground">
            Todos los servicios incluyen presupuesto cerrado, entrega en el
            plazo acordado y documentos redactados en lenguaje claro.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {services.map((service) => {
            const Icon = service.icon;
            return (
              <div
                key={service.title}
                className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:border-primary/30 transition-all duration-300"
              >
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-3">
                  {service.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {service.description}
                </p>
                <ul className="space-y-2 mb-6">
                  {service.includes.map((item) => (
                    <li
                      key={item}
                      className="flex items-start gap-2 text-sm text-muted-foreground"
                    >
                      <span className="text-primary mt-0.5">✓</span>
                      {item}
                    </li>
                  ))}
                </ul>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-lg">
                    {service.price}
                  </span>
                  <Button asChild variant="outline" size="sm">
                    <Link href="/contacto">
                      Solicitar <ArrowRight className="w-3 h-3 ml-1" />
                    </Link>
                  </Button>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </section>
  );
}
