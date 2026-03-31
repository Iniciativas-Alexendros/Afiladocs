import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Privacidad",
  description: "Política de privacidad y protección de datos de afilodocs.com",
};

export default function PrivacidadPage() {
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Política de Privacidad
        </h1>
        <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            1. Responsable del tratamiento
          </h2>
          <p>
            Afilodocs es responsable de los datos personales recogidos a través
            de este sitio web. Contacto: contacto@afilodocs.com.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            2. Datos que recogemos
          </h2>
          <p>
            Recogemos los datos que nos proporcionas voluntariamente a través
            del formulario de contacto: nombre, email y el mensaje que nos
            envíes. También recogemos datos de navegación mediante cookies.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            3. Finalidad del tratamiento
          </h2>
          <p>
            Los datos son tratados para responder a tus consultas, enviarte
            presupuestos y, si lo autorizas, comunicaciones comerciales sobre
            nuestros servicios.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            4. Base legal
          </h2>
          <p>
            El tratamiento de datos se basa en tu consentimiento expreso
            (artículo 6.1.a del RGPD) al enviar el formulario de contacto.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            5. Derechos del interesado
          </h2>
          <p>
            Puedes ejercer tus derechos de acceso, rectificación, supresión,
            portabilidad, limitación y oposición escribiendo a
            contacto@afilodocs.com. Tienes derecho a presentar una reclamación
            ante la Agencia Española de Protección de Datos (AEPD).
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            6. Conservación de datos
          </h2>
          <p>
            Conservamos tus datos durante el tiempo necesario para la finalidad
            para la que fueron recogidos y, en cualquier caso, durante los
            plazos legales aplicables.
          </p>
        </div>
      </div>
    </section>
  );
}
