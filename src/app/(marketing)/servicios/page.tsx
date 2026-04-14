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
  Check,
  Minus,
} from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Servicios legales | Afiladocs",
  description:
    "Compara plantillas de tienda, revisión experta y suscripción. Redacción, revisión de documentos, recursos y asesoramiento. Precio cerrado y plazos realistas.",
};

const COMPARISON = [
  {
    row: "Mejor para",
    tienda: "Documentos estándar",
    revision: "Tu contrato específico",
    suscripcion: "Necesidad recurrente",
  },
  {
    row: "Precio base",
    tienda: "Desde 9 €",
    revision: "Desde 60 €",
    suscripcion: "Desde 29 €/mes",
  },
  {
    row: "Plazo de entrega",
    tienda: "Inmediata / 48 h",
    revision: "72 h laborables",
    suscripcion: "Continuo",
  },
  {
    row: "Firma eIDAS",
    tienda: "SES / AES",
    revision: null,
    suscripcion: null,
  },
  {
    row: "Abogado incluido",
    tienda: false,
    revision: true,
    suscripcion: true,
  },
  {
    row: "Factura Verifactu",
    tienda: true,
    revision: true,
    suscripcion: true,
  },
]

function CellValue({ value }: { value: string | boolean | null }) {
  if (value === null) return <Minus className="size-4 text-muted-foreground/50 mx-auto" />
  if (value === true) return <Check className="size-4 text-primary mx-auto" />
  if (value === false) return <Minus className="size-4 text-muted-foreground/50 mx-auto" />
  return <span className="text-sm">{value}</span>
}

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
    <div className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Hero */}
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Servicios legales
          </h1>
          <p className="text-lg text-muted-foreground">
            Todos los servicios incluyen presupuesto cerrado, entrega en el
            plazo acordado y documentos redactados en lenguaje claro.
          </p>
        </div>

        {/* Comparison table */}
        <section className="mb-20">
          <h2 className="text-2xl font-bold text-foreground text-center mb-8">
            ¿Qué modalidad necesitas?
          </h2>

          <div className="overflow-x-auto rounded-2xl border border-border shadow-sm">
            <table className="w-full text-sm">
              <thead>
                <tr className="border-b border-border bg-muted/40">
                  <th className="text-left px-6 py-4 font-semibold text-foreground w-1/4"></th>
                  <th className="px-6 py-4 font-semibold text-center">
                    <Link href="/tienda" className="hover:text-primary transition-colors">
                      Tienda
                    </Link>
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">
                    <Link href="/revisiones" className="hover:text-primary transition-colors">
                      Revisión experta
                    </Link>
                  </th>
                  <th className="px-6 py-4 font-semibold text-center">
                    <Link href="/suscripciones" className="hover:text-primary transition-colors">
                      Suscripción
                    </Link>
                  </th>
                </tr>
              </thead>
              <tbody>
                {COMPARISON.map((item, idx) => (
                  <tr key={item.row} className={`border-b border-border last:border-0${idx % 2 === 0 ? '' : ' bg-muted/20'}`}>
                    <td className="px-6 py-3.5 font-medium text-foreground">{item.row}</td>
                    <td className="px-6 py-3.5 text-center text-muted-foreground">
                      <CellValue value={item.tienda} />
                    </td>
                    <td className="px-6 py-3.5 text-center text-muted-foreground">
                      <CellValue value={item.revision} />
                    </td>
                    <td className="px-6 py-3.5 text-center text-muted-foreground">
                      <CellValue value={item.suscripcion} />
                    </td>
                  </tr>
                ))}
                {/* CTA row */}
                <tr className="bg-muted/20">
                  <td className="px-6 py-4"></td>
                  <td className="px-6 py-4 text-center">
                    <Button asChild size="sm">
                      <Link href="/tienda">Ver tienda</Link>
                    </Button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button asChild size="sm">
                      <Link href="/revisiones">Ver revisiones</Link>
                    </Button>
                  </td>
                  <td className="px-6 py-4 text-center">
                    <Button asChild size="sm" variant="outline">
                      <Link href="/suscripciones">Ver planes</Link>
                    </Button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        {/* Services grid */}
        <section>
          <h2 className="text-2xl font-bold text-foreground text-center mb-10">
            Servicios a medida
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {services.map((service) => {
              const Icon = service.icon;
              return (
                <div
                  key={service.title}
                  className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:border-primary/30 transition-all duration-300"
                >
                  <Icon className="w-10 h-10 text-primary mb-4" />
                  <h3 className="text-xl font-bold text-foreground mb-3">
                    {service.title}
                  </h3>
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
        </section>

      </div>
    </div>
  );
}
