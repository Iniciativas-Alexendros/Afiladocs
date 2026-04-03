import type { Metadata } from "next";
import { BlogCard } from "@/components/BlogCard";
import { posts } from "./data";

export const metadata: Metadata = {
  title: "Blog",
  description:
    "Artículos sobre derecho, lenguaje claro, LegalTech y consejos legales prácticos.",
};

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
