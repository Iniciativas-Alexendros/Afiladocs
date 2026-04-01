import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, FileText, Scale, Search, BookOpen } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Informes Jurídicos",
  description:
    "Informes jurídicos claros y detallados. Análisis de viabilidad, dictámenes y opiniones legales redactadas en lenguaje comprensible.",
};

const reportTypes = [
  {
    icon: Search,
    title: "Informe de viabilidad",
    description: "Análisis previo de tu caso para evaluar posibilidades de éxito antes de iniciar un procedimiento.",
    price: "Desde 120 €",
  },
  {
    icon: FileText,
    title: "Dictamen jurídico",
    description: "Opinión jurídica fundamentada sobre una cuestión legal concreta, con análisis de normativa y jurisprudencia.",
    price: "Desde 200 €",
  },
  {
    icon: Scale,
    title: "Informe de riesgos contractuales",
    description: "Análisis completo de un contrato para identificar riesgos, cláusulas abusivas y posibles mejoras.",
    price: "Desde 150 €",
  },
  {
    icon: BookOpen,
    title: "Informe de cumplimiento",
    description: "Verificación del cumplimiento de normativa aplicable (RGPD, LSSI, laboral, fiscal).",
    price: "Desde 250 €",
  },
];

export default function InformesJuridicosPage() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Informes jurídicos
          </h1>
          <p className="text-lg text-muted-foreground">
            Análisis jurídicos claros, fundamentados y redactados para que los
            entiendas a la primera.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-16">
          {reportTypes.map((report) => {
            const Icon = report.icon;
            return (
              <div
                key={report.title}
                className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:border-primary/30 transition-all duration-300"
              >
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h2 className="text-xl font-bold text-foreground mb-3">
                  {report.title}
                </h2>
                <p className="text-muted-foreground leading-relaxed mb-4">
                  {report.description}
                </p>
                <div className="flex items-center justify-between">
                  <span className="text-primary font-bold text-lg">
                    {report.price}
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
