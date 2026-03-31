import type { Metadata } from "next";
import Link from "next/link";
import { ArrowRight, Scale, Brain, Globe, Award } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Sobre mí",
  description:
    "Jurista especializada en redacción de documentos legales claros. Trabajo 100% online desde Valencia.",
};

export default function SobreMiPage() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 items-center mb-16">
          <div>
            <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-6">
              Hola, soy afilodocs
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed mb-4">
              Jurista y redactora especializada en documentos legales en lenguaje
              claro. Mi objetivo es que entiendas tus documentos sin necesidad
              de un diccionario jurídico.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-4">
              Trabajo 100% online desde Valencia, combinando formación jurídica
              con herramientas de IA para ofrecer un servicio ágil, preciso y
              accesible.
            </p>
            <p className="text-muted-foreground leading-relaxed mb-8">
              Creo que el derecho debe estar al alcance de todos. Por eso
              redacto documentos que entiende cualquier persona, sin perder
              rigor técnico ni validez legal.
            </p>
            <Button
              asChild
              size="lg"
              className="bg-primary text-white hover:bg-primary/90"
            >
              <Link href="/contacto">
                Hablemos <ArrowRight className="w-4 h-4 ml-2" />
              </Link>
            </Button>
          </div>

          <div className="bg-gradient-to-br from-primary/10 to-accent/10 rounded-2xl p-12 flex items-center justify-center">
            <Scale className="w-32 h-32 text-primary/40" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
            <Brain className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              IA aplicada al derecho
            </h3>
            <p className="text-sm text-muted-foreground">
              Uso herramientas de inteligencia artificial para ser más eficiente
              y precisa en mi trabajo.
            </p>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
            <Globe className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              100% online
            </h3>
            <p className="text-sm text-muted-foreground">
              Trabajo desde Valencia con clientes de toda España. Sin reuniones
              presenciales innecesarias.
            </p>
          </div>
          <div className="bg-card rounded-2xl p-8 shadow-sm border border-border text-center">
            <Award className="w-10 h-10 text-primary mx-auto mb-4" />
            <h3 className="text-lg font-bold text-foreground mb-2">
              Lenguaje claro
            </h3>
            <p className="text-sm text-muted-foreground">
              Todos mis documentos están redactados para que los entienda
              cualquier persona.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
