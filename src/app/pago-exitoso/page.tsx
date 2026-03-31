import type { Metadata } from "next";
import Link from "next/link";
import { CheckCircle, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/button";

export const metadata: Metadata = {
  title: "Pago exitoso",
  description: "Tu pago se ha procesado correctamente.",
};

export default function PagoExitosoPage() {
  return (
    <section className="py-32">
      <div className="max-w-lg mx-auto px-4 text-center">
        <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
        <h1 className="text-3xl font-bold text-foreground mb-4">
          ¡Pago completado!
        </h1>
        <p className="text-muted-foreground leading-relaxed mb-8">
          Tu pago se ha procesado correctamente. Recibirás un email con la
          confirmación y los documentos en breve.
        </p>
        <Button
          asChild
          className="bg-primary text-white hover:bg-primary/90"
        >
          <Link href="/">
            Volver al inicio <ArrowRight className="w-4 h-4 ml-2" />
          </Link>
        </Button>
      </div>
    </section>
  );
}
