import type { NextConfig } from 'next'

const nextConfig: NextConfig = {
  // CRÍTICO: Vercel gestiona el build output internamente.
  // `output: 'standalone'` rompe el deployment en Vercel — eliminado.

  // typedRoutes desactivado: muchas rutas son dinámicas o aún en construcción.
  // Reactivar con: experimental: { typedRoutes: true } cuando el router esté completo.
  compress: true,
  poweredByHeader: false,

  // Logging de fetch requests visible en desarrollo (sin impacto en producción)
  logging: {
    fetches: {
      fullUrl: true,
    },
  },

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
              "script-src 'self' 'unsafe-inline' https://js.stripe.com",
              // unsafe-inline requerido por Tailwind v4; fonts.googleapis.com para DM Sans
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              // fonts.gstatic.com para archivos de fuente de Google Fonts
              "font-src 'self' https://fonts.gstatic.com",
              // *.supabase.co cubre tanto imágenes como documentos almacenados en Supabase Storage
              "img-src 'self' data: blob: https: https://*.supabase.co",
              // api.stripe.com para Stripe API; *.supabase.co para Supabase API y Storage
              // vitals.vercel-insights.com para Vercel Speed Insights / Analytics
              "connect-src 'self' https://api.stripe.com https://*.supabase.co https://vitals.vercel-insights.com",
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

  // Redirects — sin dominio propio todavía, lista vacía.
  // Cuando se adquiera el dominio, añadir redirect www → non-www aquí:
  // { source: '/(.*)', has: [{ type: 'host', value: 'www.afiladocs.com' }],
  //   destination: 'https://afiladocs.com/:path*', permanent: true }
  async redirects() {
    return []
  },
}

export default nextConfig
