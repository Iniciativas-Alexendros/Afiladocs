import { Ratelimit } from '@upstash/ratelimit'
import { Redis } from '@upstash/redis'
import { serverEnv } from '@/lib/env'

// Detecta si Upstash está configurado en el entorno.
// En desarrollo local sin Redis: todos los limiters son null → sin rate limiting.
// En Vercel producción: configurar UPSTASH_REDIS_REST_URL y UPSTASH_REDIS_REST_TOKEN
// en Dashboard > Storage > Create Database > Upstash KV (tier gratuito disponible).
const hasUpstash = Boolean(serverEnv.upstashRedisUrl && serverEnv.upstashRedisToken)

// Rate limiter para /api/checkout: 10 requests por minuto por IP (sliding window)
export const checkoutRateLimit: Ratelimit | null = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(10, '1 m'),
      analytics: false,
      prefix: 'rl:checkout',
    })
  : null

// Rate limiter para /api/contact: 5 requests por 10 minutos por IP (sliding window)
export const contactRateLimit: Ratelimit | null = hasUpstash
  ? new Ratelimit({
      redis: Redis.fromEnv(),
      limiter: Ratelimit.slidingWindow(5, '10 m'),
      analytics: false,
      prefix: 'rl:contact',
    })
  : null

// Extrae IP del request con soporte para Cloudflare, Vercel y Nginx proxy
export function getClientIp(request: Request): string {
  return (
    request.headers.get('cf-connecting-ip') ??       // Cloudflare
    request.headers.get('x-real-ip') ??              // Nginx proxy
    request.headers.get('x-forwarded-for')?.split(',')[0]?.trim() ?? // Vercel / proxies genéricos
    '127.0.0.1'
  )
}

// Aplica el rate limiter y devuelve si el request está limitado
// y cuántos segundos esperar antes de reintentar
export async function applyRateLimit(
  limiter: Ratelimit | null,
  identifier: string
): Promise<{ limited: boolean; retryAfter?: number }> {
  if (!limiter) return { limited: false }

  const { success, reset } = await limiter.limit(identifier)
  if (!success) {
    const retryAfter = Math.ceil((reset - Date.now()) / 1000)
    return { limited: true, retryAfter }
  }
  return { limited: false }
}
