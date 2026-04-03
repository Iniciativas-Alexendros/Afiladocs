import { notFound } from 'next/navigation'
import type { Metadata } from 'next'
import Link from 'next/link'
import { ArrowLeft } from 'lucide-react'
import { posts } from '../data'

export function generateStaticParams() {
  return posts.map((p) => ({ slug: p.slug }))
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>
}): Promise<Metadata> {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) return { title: 'Post no encontrado | Blog afiladocs' }
  return {
    title: `${post.title} | Blog afiladocs`,
    description: post.excerpt,
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      publishedTime: post.date,
    },
  }
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>
}) {
  const { slug } = await params
  const post = posts.find((p) => p.slug === slug)
  if (!post) notFound()

  // Schema.org Article JSON-LD
  const articleSchema = {
    '@context': 'https://schema.org',
    '@type': 'Article',
    headline: post.title,
    description: post.excerpt,
    datePublished: post.date,
    author: {
      '@type': 'Person',
      name: 'Afiladocs',
    },
    publisher: {
      '@type': 'Organization',
      name: 'Afiladocs',
    },
  }

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(articleSchema) }}
      />
      <article className="py-20">
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8">
          <Link href="/blog" className="inline-flex items-center text-sm font-medium text-muted-foreground hover:text-foreground mb-8 transition-colors">
            <ArrowLeft className="mr-1 h-4 w-4" /> Volver al blog
          </Link>

          <header className="mb-10">
            <div className="flex items-center gap-3 text-sm text-muted-foreground mb-4">
              <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
                {post.category}
              </span>
              <span>{post.date}</span>
              <span>·</span>
              <span>{post.readTime}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-bold tracking-tight text-foreground mb-4">
              {post.title}
            </h1>
            <p className="text-lg text-muted-foreground leading-relaxed">{post.excerpt}</p>
          </header>

          <div className="prose prose-slate max-w-none">
            {post.content.split('\n\n').map((block, i) => {
              if (block.startsWith('## ')) {
                return <h2 key={i} className="text-xl font-bold text-foreground mt-8 mb-3">{block.replace('## ', '')}</h2>
              }
              if (block.startsWith('---')) {
                return <hr key={i} className="my-8 border-slate-200" />
              }
              if (block.includes('\n- ') || block.includes('\n1. ')) {
                const items = block.split('\n').filter(Boolean)
                const isOrdered = items[0]?.match(/^\d+\./)
                const Tag = isOrdered ? 'ol' : 'ul'
                return (
                  <Tag key={i} className={`my-4 pl-5 space-y-1.5 ${isOrdered ? 'list-decimal' : 'list-disc'}`}>
                    {items.map((item, j) => (
                      <li key={j} className="text-slate-600 leading-relaxed"
                          dangerouslySetInnerHTML={{ __html: item.replace(/(?:^\d+\.\s*)|-\s*/, '').replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                      />
                    ))}
                  </Tag>
                )
              }
              return (
                <p key={i} className="my-4 text-slate-600 leading-relaxed"
                   dangerouslySetInnerHTML={{ __html: block.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>') }}
                />
              )
            })}
          </div>

          <div className="mt-12 pt-8 border-t border-slate-200">
            <div className="rounded-xl bg-blue-50 border border-blue-100 p-6 text-center">
              <p className="text-sm font-medium text-blue-900 mb-1">¿Tienes un caso parecido?</p>
              <p className="text-sm text-blue-700 mb-4">Consulta con afiladocs. Primera valoración gratuita.</p>
              <Link href="/contacto" className="inline-flex items-center justify-center rounded-md bg-blue-600 px-5 py-2.5 text-sm font-semibold text-white shadow-sm hover:bg-blue-700 transition-colors">
                Contactar ahora
              </Link>
            </div>
          </div>
        </div>
      </article>
    </>
  )
}
