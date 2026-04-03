import { NextResponse } from 'next/server'
import { z } from 'zod'
import { serverEnv } from '@/lib/env'
import { checkoutRateLimit, getClientIp, applyRateLimit } from '@/lib/rate-limit'
import { getProductPriceMap } from '@/lib/stripe/client'
import { isAllowedOrigin } from '@/lib/csrf'

// Vercel Function: Node.js runtime requerido por Stripe SDK (crypto nativo de Node)
export const runtime = 'nodejs'
export const maxDuration = 30

const LineItemSchema = z.object({
  priceId: z.string().optional(),
  variantId: z.string().optional(),
  quantity: z.number().int().min(1).max(10),
})

const CheckoutBodySchema = z.object({
  items: z.array(LineItemSchema).min(1).max(20),
  successUrl: z.string().url(),
  cancelUrl: z.string().url(),
})

type LineItem = z.infer<typeof LineItemSchema>

async function buildStripeSession(
  items: LineItem[],
  successUrl: string,
  cancelUrl: string
) {
  if (!serverEnv.stripeSecretKey) return null

  const Stripe = (await import('stripe')).default
  // Instancia creada por invocación para aprovechar dynamic import.
  // La instancia de módulo es cacheada por Vercel en warm starts.
  const stripe = new Stripe(serverEnv.stripeSecretKey, {
    apiVersion: '2026-03-25.dahlia',
    timeout: 8000, // Vercel mata funciones a los maxDuration s — timeout explícito
  })

  return stripe.checkout.sessions.create({
    mode: 'payment',
    line_items: items.map((item) => ({
      price: item.priceId ?? item.variantId,
      quantity: item.quantity,
    })),
    success_url: successUrl,
    cancel_url: cancelUrl,
  })
}

async function processCheckout(request: Request): Promise<NextResponse> {
  const body = await request.json()
  const parsed = CheckoutBodySchema.safeParse(body)

  if (!parsed.success) {
    return NextResponse.json(
      { error: 'Parámetros inválidos', details: parsed.error.flatten().fieldErrors },
      { status: 400 }
    )
  }

  const { items, successUrl, cancelUrl } = parsed.data

  // Whitelist de priceIds válidos — previene que se pasen IDs arbitrarios de Stripe
  const allowedPriceIds = new Set(
    Object.values(getProductPriceMap()).filter((v): v is string => Boolean(v))
  )
  if (allowedPriceIds.size > 0) {
    for (const item of items) {
      const id = item.priceId ?? item.variantId
      if (id && !allowedPriceIds.has(id)) {
        return NextResponse.json({ error: 'Producto no reconocido' }, { status: 400 })
      }
    }
  }

  const session = await buildStripeSession(items, successUrl, cancelUrl)

  if (!session) {
    return NextResponse.json(
      { error: 'Stripe no está configurado. Añade STRIPE_SECRET_KEY al entorno.', url: null },
      { status: 503 }
    )
  }

  return NextResponse.json({ url: session.url })
}

export async function POST(request: Request) {
  if (!isAllowedOrigin(request)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
  }

  const ip = getClientIp(request)
  const { limited, retryAfter } = await applyRateLimit(checkoutRateLimit, ip)
  if (limited) {
    return NextResponse.json(
      { error: 'Demasiadas solicitudes de pago. Espera unos minutos.' },
      {
        status: 429,
        headers: { 'Retry-After': String(retryAfter ?? 60) },
      }
    )
  }

  try {
    return await processCheckout(request)
  } catch (error) {
    // Log interno estructurado — NO exponer detalles de Stripe al cliente
    console.error(JSON.stringify({
      event: 'checkout.error',
      message: error instanceof Error ? error.message : 'Unknown error',
      ts: new Date().toISOString(),
    }))
    return NextResponse.json({ error: 'Error al procesar el pago. Inténtalo de nuevo.' }, { status: 500 })
  }
}
