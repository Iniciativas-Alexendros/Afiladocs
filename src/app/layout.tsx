import type { Metadata } from 'next'
import { DM_Sans } from 'next/font/google'
import './globals.css'
import { Toaster } from '@/components/ui/sonner'
import { Analytics } from '@vercel/analytics/next'
import { SpeedInsights } from '@vercel/speed-insights/next'
import { PreviewBanner } from '@/components/PreviewBanner'

const dmSans = DM_Sans({
  subsets: ['latin', 'latin-ext'],
  variable: '--font-sans',
  // Preload de los weights más usados para evitar FOUT y mejorar LCP
  weight: ['400', '500', '600', '700'],
  display: 'swap',
})

// Resolución dinámica de metadataBase:
//   1. NEXT_PUBLIC_SITE_URL=https://afiladocs.com — dominio propio (producción)
//   2. VERCEL_URL — subdominio preview inyectado por Vercel en build time
//   3. localhost:3000 — desarrollo local
const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : 'http://localhost:3000')

// Dominio propio: NEXT_PUBLIC_SITE_URL=https://afiladocs.com → index: true.
// Preview deployments sin NEXT_PUBLIC_SITE_URL → noindex (evita contenido duplicado).
const hasDomain = Boolean(process.env.NEXT_PUBLIC_SITE_URL)

export const metadata: Metadata = {
  title: {
    default: 'afiladocs – Documentos legales claros, sin tecnicismos',
    template: '%s | afiladocs',
  },
  description:
    'Redacción y revisión de documentos legales en lenguaje claro. Precio cerrado, plazos realistas, trabajo 100% online desde Valencia.',
  metadataBase: new URL(siteUrl),
  robots: hasDomain
    ? { index: true, follow: true }
    : { index: false, follow: false },
  openGraph: {
    type: 'website',
    locale: 'es_ES',
    siteName: 'afiladocs',
  },
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="es" className={dmSans.variable}>
      <body className="font-sans antialiased">
        {children}
        <Toaster />
        <Analytics />
        <SpeedInsights />
        <PreviewBanner />
      </body>
    </html>
  )
}
