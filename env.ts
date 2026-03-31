import { z } from 'zod'

const envSchema = z.object({
  // ─── Supabase ───────────────────────────────────────────
  NEXT_PUBLIC_SUPABASE_URL:       z.string().url(),
  NEXT_PUBLIC_SUPABASE_ANON_KEY:  z.string().min(1),
  SUPABASE_SERVICE_ROLE_KEY:      z.string().min(1),

  // ─── Database (Prisma + Supavisor) ─────────────────────
  DATABASE_URL:                   z.string().url(),
  DIRECT_URL:                     z.string().url(),

  // ─── Stripe ─────────────────────────────────────────────
  NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY: z.string().startsWith('pk_'),
  STRIPE_SECRET_KEY:              z.string().startsWith('sk_'),
  STRIPE_WEBHOOK_SECRET:          z.string().startsWith('whsec_'),

  // ─── Stripe Price IDs ──────────────────────────────────
  STRIPE_PRICE_LTK_001:          z.string().startsWith('price_').optional(),
  STRIPE_PRICE_PCK_001:          z.string().startsWith('price_').optional(),
  STRIPE_PRICE_REV_001:          z.string().startsWith('price_').optional(),
  STRIPE_PRICE_INF_001:          z.string().startsWith('price_').optional(),
  STRIPE_PRICE_CON_001:          z.string().startsWith('price_').optional(),

  // ─── Documenso (activar cuando self-hosted esté listo) ─
  DOCUMENSO_API_URL:              z.string().url().optional(),
  DOCUMENSO_API_KEY:              z.string().min(1).optional(),
  DOCUMENSO_WEBHOOK_SECRET:       z.string().min(1).optional(),

  // ─── Resend ─────────────────────────────────────────────
  RESEND_API_KEY:                 z.string().startsWith('re_').optional(),
  RESEND_FROM_EMAIL:              z.string().email().optional(),

  // ─── EasyVerifactu (activar en julio 2025) ─────────────
  EASYVERIFACTU_API_KEY:          z.string().min(1).optional(),
  EASYVERIFACTU_API_URL:          z.string().url().optional(),

  // ─── n8n ────────────────────────────────────────────────
  N8N_INTERNAL_WEBHOOK_SECRET:    z.string().min(32).optional(),
  N8N_CONTACT_WEBHOOK_URL:        z.string().url().optional(),

  // ─── App ────────────────────────────────────────────────
  NEXT_PUBLIC_APP_URL:            z.string().url(),
  NODE_ENV:                       z.enum(['development', 'production', 'test']).default('development'),
})

export type Env = z.infer<typeof envSchema>

export const env = envSchema.parse(process.env)
