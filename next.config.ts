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
          // NOTA: Content-Security-Policy se emite desde middleware.ts con nonce por request.
          // Aquí solo quedan headers estáticos que no dependen del nonce.
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

