import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Aviso Legal",
  description: "Aviso legal de afilodocs.com",
};

export default function AvisoLegalPage() {
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">Aviso Legal</h1>
        <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">1. Titular del sitio web</h2>
          <p>
            El presente sitio web, accesible desde afilodocs.com, es propiedad
            y está operado por afilodocs. Domicilio social: Valencia, España.
            Contacto: contacto@afilodocs.com.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            2. Objeto y ámbito de aplicación
          </h2>
          <p>
            El presente aviso legal regula el uso del sitio web afilodocs.com y
            de todos los servicios ofrecidos a través del mismo. El acceso al
            sitio web implica la aceptación de estas condiciones.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            3. Propiedad intelectual
          </h2>
          <p>
            Todos los contenidos del sitio web (textos, imágenes, logotipos,
            diseño) están protegidos por derechos de propiedad intelectual.
            Queda prohibida su reproducción sin autorización expresa.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            4. Responsabilidad
          </h2>
          <p>
            Afilodocs no se responsabiliza de los daños o perjuicios derivados
            del uso del sitio web, ni de la información contenida en otros
            sitios enlazados.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            5. Legislación aplicable y jurisdicción
          </h2>
          <p>
            El presente aviso legal se rige por la legislación española. Para la
            resolución de cualquier controversia serán competentes los juzgados
            y tribunales de Valencia.
          </p>
        </div>
      </div>
    </section>
  );
}
