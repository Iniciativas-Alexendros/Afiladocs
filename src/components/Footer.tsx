import Link from "next/link";
import { FileText, Mail, MapPin, MessageCircle } from "lucide-react";

export function Footer() {
  return (
    <footer className="bg-accent text-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-8">
          <div>
            <div className="flex items-center gap-2 mb-4">
              <FileText className="w-6 h-6 text-primary" />
              <span className="text-xl font-bold">afiladocs</span>
            </div>
            <p className="text-sm leading-relaxed opacity-90">
              Documentos legales claros, sin tecnicismos vacíos. Trabajo 100%
              online desde Valencia.
            </p>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Legal</h3>
            <ul className="space-y-2 text-sm">
              <li>
                <Link
                  href="/legal/aviso-legal"
                  className="opacity-90 hover:opacity-100 hover:text-primary transition-all duration-200"
                >
                  Aviso Legal
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/privacidad"
                  className="opacity-90 hover:opacity-100 hover:text-primary transition-all duration-200"
                >
                  Política de Privacidad
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/cookies"
                  className="opacity-90 hover:opacity-100 hover:text-primary transition-all duration-200"
                >
                  Política de Cookies
                </Link>
              </li>
              <li>
                <Link
                  href="/legal/condiciones-generales"
                  className="opacity-90 hover:opacity-100 hover:text-primary transition-all duration-200"
                >
                  Condiciones Generales
                </Link>
              </li>
            </ul>
          </div>

          <div>
            <h3 className="font-semibold mb-4">Contacto</h3>
            <ul className="space-y-3 text-sm">
              <li className="flex items-start gap-2">
                <MapPin className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <span className="opacity-90">Valencia, España</span>
              </li>
              <li className="flex items-start gap-2">
                <Mail className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <a
                  href="mailto:contacto@afiladocs.com"
                  className="opacity-90 hover:opacity-100 hover:text-primary transition-all duration-200"
                >
                  contacto@afiladocs.com
                </a>
              </li>
              <li className="flex items-start gap-2">
                <MessageCircle className="w-4 h-4 mt-1 flex-shrink-0 text-primary" />
                <a
                  href="https://wa.me/34600000000"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="opacity-90 hover:opacity-100 hover:text-primary transition-all duration-200"
                >
                  WhatsApp
                </a>
              </li>
            </ul>
          </div>
        </div>

        <div className="pt-8 border-t border-white/10 text-center text-sm opacity-75">
          <p>
            &copy; {new Date().getFullYear()} afiladocs. Todos los derechos
            reservados.
          </p>
        </div>
      </div>
    </footer>
  );
}
