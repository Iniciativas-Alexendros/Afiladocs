import { MetadataRoute } from 'next'

const BASE_URL =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

// ⚠️ SEO CRÍTICO — MIENTRAS NO HAYA DOMINIO PROPIO:
// El subdominio .vercel.app NO debe ser indexado por Google.
// Si lo fuera, al migrar al dominio real habría contenido duplicado indexado en dos URLs.
//
// CUANDO SE ADQUIERA EL DOMINIO:
//   1. Añadir NEXT_PUBLIC_SITE_URL=https://afiladocs.com en Vercel Dashboard > Env Vars
//   2. Redeploy → isVercelPreviewDomain pasa a false → Allow: '/' activado automáticamente
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
