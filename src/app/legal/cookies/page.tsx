import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Política de Cookies",
  description: "Información sobre el uso de cookies en afilodocs.com",
};

export default function CookiesPage() {
  return (
    <section className="py-20">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="text-3xl font-bold text-foreground mb-8">
          Política de Cookies
        </h1>
        <div className="prose prose-neutral max-w-none space-y-6 text-muted-foreground leading-relaxed">
          <h2 className="text-xl font-semibold text-foreground">
            1. ¿Qué son las cookies?
          </h2>
          <p>
            Las cookies son pequeños archivos de texto que se almacenan en tu
            dispositivo cuando visitas un sitio web. Permiten recordar tus
            preferencias y mejorar la experiencia de navegación.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            2. Cookies que utilizamos
          </h2>
          <p>
            <strong>Cookies técnicas:</strong> necesarias para el funcionamiento
            del sitio web (carrito de compra, sesión).
          </p>
          <p>
            <strong>Cookies analíticas:</strong> nos permiten medir el tráfico
            del sitio web de forma anónima para mejorar nuestro servicio.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            3. ¿Cómo desactivar las cookies?
          </h2>
          <p>
            Puedes configurar tu navegador para rechazar todas las cookies o
            para que te avise cuando se envía una cookie. Ten en cuenta que
            algunas funciones del sitio web podrían no funcionar correctamente
            sin cookies.
          </p>

          <h2 className="text-xl font-semibold text-foreground">
            4. Actualización
          </h2>
          <p>
            Esta política de cookies puede actualizarse periódicamente. Te
            recomendamos revisarla con frecuencia.
          </p>
        </div>
      </div>
    </section>
  );
}
