import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Brain, Cpu, FileSearch, Zap, Bot, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "LegalTech & IA",
  description:
    "Herramientas de inteligencia artificial aplicadas al derecho. Revisión automatizada de contratos, análisis de riesgos y más.",
};

const features = [
  {
    icon: FileSearch,
    title: "Revisión automatizada de contratos",
    description:
      "La IA analiza tus contratos para detectar cláusulas abusivas, riesgos y puntos de mejora en segundos.",
  },
  {
    icon: Cpu,
    title: "Análisis de jurisprudencia",
    description:
      "Búsqueda y análisis automatizado de sentencias relevantes para tu caso usando procesamiento de lenguaje natural.",
  },
  {
    icon: Bot,
    title: "Generación de borradores",
    description:
      "Primeros borradores generados por IA que luego reviso y ajusto manualmente para garantizar calidad y precisión.",
  },
  {
    icon: Zap,
    title: "Eficiencia y rapidez",
    description:
      "Las herramientas de IA permiten reducir tiempos de entrega sin sacrificar la calidad del servicio.",
  },
  {
    icon: Lock,
    title: "Privacidad y seguridad",
    description:
      "Tus datos se procesan de forma segura y confidencial. Cumplimiento estricto del RGPD.",
  },
  {
    icon: Brain,
    title: "Supervisión humana siempre",
    description:
      "La IA asiste, pero cada documento es revisado y aprobado por un profesional antes de la entrega.",
  },
];

export default function LegalTechPage() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <div className="inline-flex items-center gap-2 bg-primary/10 text-primary px-4 py-2 rounded-full text-sm font-medium mb-6">
            <Brain className="w-4 h-4" />
            <span>LegalTech & Inteligencia Artificial</span>
          </div>
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Derecho potenciado por IA
          </h1>
          <p className="text-lg text-muted-foreground">
            Combino herramientas de inteligencia artificial con mi expertise
            jurídica para ofrecerte un servicio más rápido, preciso y
            accesible.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-16">
          {features.map((feature) => {
            const Icon = feature.icon;
            return (
              <div
                key={feature.title}
                className="bg-card rounded-2xl p-8 shadow-sm border border-border hover:border-primary/30 transition-all duration-300"
              >
                <Icon className="w-10 h-10 text-primary mb-4" />
                <h3 className="text-lg font-bold text-foreground mb-2">
                  {feature.title}
                </h3>
                <p className="text-sm text-muted-foreground leading-relaxed">
                  {feature.description}
                </p>
              </div>
            );
          })}
        </div>

        <div className="bg-accent text-white rounded-2xl p-12 text-center">
          <h2 className="text-2xl md:text-3xl font-bold mb-4">
            ¿Quieres saber más sobre cómo uso la IA?
          </h2>
          <p className="text-lg opacity-90 mb-8 max-w-xl mx-auto">
            Explícame tu caso y te cuento cómo las herramientas de IA pueden
            agilizar tu proyecto legal.
          </p>
          <Button
            asChild
            size="lg"
            className="bg-primary text-white hover:bg-primary/90"
          >
            <Link href="/contacto">
              Contactar <ArrowRight className="w-4 h-4 ml-2" />
            </Link>
          </Button>
        </div>
      </div>
    </section>
  );
}
