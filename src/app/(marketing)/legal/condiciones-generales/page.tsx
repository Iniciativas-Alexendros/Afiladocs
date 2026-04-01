import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Condiciones Generales de Contratación",
  description:
    "Condiciones generales de contratación de los servicios de afilodocs.com",
};

export default function CondicionesGeneralesPage() {
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Condiciones Generales de Contratación
        </h1>
        <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            1. Objeto
          </h2>
          <p>
            Las presentes condiciones generales regulan la contratación de los
            servicios y productos ofrecidos a través del sitio web
            afilodocs.com.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            2. Proceso de contratación
          </h2>
          <p>
            La contratación de un servicio requiere el envío de una consulta a
            través del formulario de contacto o la compra de un producto en la
            tienda. En ambos casos, recibirás una confirmación por email.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            3. Precios y forma de pago
          </h2>
          <p>
            Los precios indicados en el sitio web incluyen IVA. El pago se
            realiza a través de Stripe, una pasarela de pago segura. Se
            aceptan tarjetas de crédito y débito.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            4. Plazo de entrega
          </h2>
          <p>
            El plazo de entrega de los servicios se acuerda individualmente en
            cada presupuesto. Los productos digitales se entregan de forma
            inmediata tras el pago.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            5. Derecho de desistimiento
          </h2>
          <p>
            Dispones de 14 días naturales desde la contratación para ejercer
            tu derecho de desistimiento, siempre que el servicio no haya
            comenzado a ejecutarse con tu consentimiento expreso.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            6. Reclamaciones
          </h2>
          <p>
            Puedes dirigir tus reclamaciones a contacto@afilodocs.com.
            Resolveremos tu incidencia en un plazo máximo de 30 días.
          </p>
        </div>
      </div>
    </section>
  );
}
