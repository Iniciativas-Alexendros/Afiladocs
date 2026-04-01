import type { Metadata } from "next";
import { ContactForm } from "@/components/ContactForm";
import { Mail, MapPin, MessageCircle } from "lucide-react";

export const metadata: Metadata = {
  title: "Contacto",
  description:
    "Contacta conmigo para consultar tu caso legal. Respuesta en menos de 24 horas hábiles.",
};

export default function ContactoPage() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Hablemos de tu caso
          </h1>
          <p className="text-lg text-muted-foreground">
            Cuéntame qué necesitas y te envío un presupuesto cerrado en menos de
            24 horas hábiles.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
          <div className="md:col-span-2">
            <div className="bg-card rounded-2xl p-8 shadow-sm border border-border">
              <ContactForm />
            </div>
          </div>

          <div className="space-y-6">
            <div className="bg-card rounded-2xl p-6 shadow-sm border border-border">
              <h3 className="font-semibold text-foreground mb-3">
                Datos de contacto
              </h3>
              <ul className="space-y-3 text-sm">
                <li className="flex items-start gap-2">
                  <MapPin className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                  <span className="text-muted-foreground">
                    Valencia, España
                  </span>
                </li>
                <li className="flex items-start gap-2">
                  <Mail className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                  <a
                    href="mailto:contacto@afilodocs.com"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    contacto@afilodocs.com
                  </a>
                </li>
                <li className="flex items-start gap-2">
                  <MessageCircle className="w-4 h-4 mt-1 text-primary flex-shrink-0" />
                  <a
                    href="https://wa.me/34600000000"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-muted-foreground hover:text-primary transition-colors"
                  >
                    WhatsApp
                  </a>
                </li>
              </ul>
            </div>

            <div className="bg-primary/5 rounded-2xl p-6 border border-primary/20">
              <h3 className="font-semibold text-foreground mb-2">
                ¿Cuánto tarda la respuesta?
              </h3>
              <p className="text-sm text-muted-foreground leading-relaxed">
                Menos de 24 horas en días hábiles. Si es urgente, escríbeme por
                WhatsApp.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
