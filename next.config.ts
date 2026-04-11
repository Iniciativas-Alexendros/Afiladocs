import { withSentryConfig } from '@sentry/nextjs';
import type { NextConfig } from 'next'
import withBundleAnalyzer from '@next/bundle-analyzer'

const nextConfig: NextConfig = {
  // CRÍTICO: Vercel gestiona el build output internamente.
  // `output: 'standalone'` rompe el deployment en Vercel — eliminado.

  compress: true,
  poweredByHeader: false,

  // Logging de fetch requests visible en desarrollo (sin impacto en producción)
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

  typedRoutes: true,

  experimental: {
    optimizePackageImports: [
      'lucide-react',
      'framer-motion',
      '@radix-ui/react-accordion',
      '@radix-ui/react-dialog',
      '@radix-ui/react-popover',
      '@radix-ui/react-select',
    ],
  },

  // Vercel Image Optimization API — conservar patrones de Unsplash y Supabase Storage
  images: {
    formats: ['image/avif', 'image/webp'],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: '*.supabase.co',
      },
    ],
  },

  // Security headers aplicados a todas las rutas
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-DNS-Prefetch-Control', value: 'on' },
          {
            key: 'Strict-Transport-Security',
            // 2 años — requerido para HSTS preload list
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          // SAMEORIGIN (no DENY) para permitir iframes propios si se necesitan en el futuro
          { key: 'X-Frame-Options', value: 'SAMEORIGIN' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // unsafe-inline requerido por Tailwind v4 CSS-in-JS; unsafe-eval PROHIBIDO
              // browser.sentry-cdn.com para Sentry browser SDK
              "script-src 'self' 'unsafe-inline' https://js.stripe.com https://browser.sentry-cdn.com",
              // unsafe-inline requerido por Tailwind v4; fonts.googleapis.com para DM Sans
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // fonts.gstatic.com para archivos de fuente de Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // *.supabase.co cubre tanto imágenes como documentos almacenados en Supabase Storage
              "img-src 'self' data: blob: https: https://*.supabase.co",
              // api.stripe.com para Stripe API; *.supabase.co para Supabase API y Storage
              // vitals.vercel-insights.com para Vercel Speed Insights / Analytics
              // *.sentry.io y o*.ingest.sentry.io para Sentry error tracking
              "connect-src 'self' https://api.stripe.com https://*.supabase.co https://vitals.vercel-insights.com https://*.sentry.io https://o*.ingest.de.sentry.io",
              // js.stripe.com y hooks.stripe.com para Stripe Elements/Checkout
              "frame-src https://js.stripe.com https://hooks.stripe.com",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ]
  },

  // Redirect www → non-www (canonical domain: afiladocs.com)
  async redirects() {
    return [
      {
        source: '/(.*)',
        has: [{ type: 'host', value: 'www.afiladocs.com' }],
        destination: 'https://afiladocs.com/:path*',
        permanent: true,
      },
    ]
  },
}

const bundleAnalyzer = withBundleAnalyzer({
  enabled: process.env.ANALYZE === 'true',
})

export default withSentryConfig(bundleAnalyzer(nextConfig), {
  org: process.env.OBSERVABILITY_SENTRY_ORG ?? "alexendros-2h",
  project: process.env.OBSERVABILITY_SENTRY_PROJECT ?? "sentry-afiladocs",
  authToken: process.env.OBSERVABILITY_SENTRY_AUTH_TOKEN ?? process.env.SENTRY_AUTH_TOKEN,

  // Only print logs for uploading source maps in CI
  silent: !process.env.CI,

  // Upload a larger set of source maps for prettier stack traces (increases build time)
  widenClientFileUpload: true,

  // Route browser requests to Sentry through a Next.js rewrite to circumvent ad-blockers.
  tunnelRoute: "/monitoring",

  webpack: {
    // Automatic instrumentation of Vercel Cron Monitors
    automaticVercelMonitors: true,
    // Remove Sentry debug logging from production bundle
    treeshake: {
      removeDebugLogging: true,
    },
  },
});

