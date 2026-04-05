import { MetadataRoute } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

// SEO: dominio propio afiladocs.com configurado via NEXT_PUBLIC_SITE_URL.
// Preview deployments (.vercel.app) sin NEXT_PUBLIC_SITE_URL → Disallow: / (evita contenido duplicado).
const isVercelPreviewDomain = !process.env.NEXT_PUBLIC_SITE_URL

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        ...(isVercelPreviewDomain
          ? { disallow: '/' }
          : { allow: '/', disallow: ['/api/', '/pago-exitoso', '/_next/', '/portal/', '/ops/'] }),
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
    host: BASE_URL,
  }
}
