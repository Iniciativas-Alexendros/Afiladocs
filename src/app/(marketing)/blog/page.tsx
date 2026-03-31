import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos sobre derecho, lenguaje claro, LegalTech y consejos legales prácticos.",
};

const posts = [
  {
    slug: "que-es-el-lenguaje-claro-juridico",
    title: "¿Qué es el lenguaje claro jurídico?",
    excerpt:
      "El lenguaje claro jurídico es una forma de redactar documentos legales para que cualquier persona pueda entenderlos sin necesidad de un abogado.",
    date: "15 marzo 2025",
    readTime: "5 min lectura",
    category: "Lenguaje claro",
  },
  {
    slug: "como-recurrir-una-multa-de-trafico",
    title: "Cómo recurrir una multa de tráfico paso a paso",
    excerpt:
      "Guía práctica para impugnar sanciones de tráfico: plazos, motivos y documentación necesaria.",
    date: "8 marzo 2025",
    readTime: "7 min lectura",
    category: "Recursos",
  },
  {
    slug: "ia-y-derecho-como-cambia-la-profesion",
    title: "IA y Derecho: cómo está cambiando la profesión",
    excerpt:
      "La inteligencia artificial está transformando la práctica jurídica. Te cuento cómo la uso en mi día a día.",
    date: "1 marzo 2025",
    readTime: "6 min lectura",
    category: "LegalTech",
  },
  {
    slug: "clausulas-abusivas-contratos-alquiler",
    title: "Las 5 cláusulas abusivas más comunes en contratos de alquiler",
    excerpt:
      "Aprende a detectar las cláusulas ilegales más frecuentes en tu contrato de arrendamiento.",
    date: "22 febrero 2025",
    readTime: "8 min lectura",
    category: "Contratos",
  },
];

export default function BlogPage() {
  return (
    <section className="py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h1 className="text-4xl md:text-5xl font-bold text-foreground mb-4">
            Blog
          </h1>
          <p className="text-lg text-muted-foreground">
            Artículos sobre derecho en lenguaje claro, LegalTech y consejos
            legales prácticos.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {posts.map((post) => (
            <BlogCard key={post.slug} {...post} />
          ))}
        </div>
      </div>
    </section>
  );
}
