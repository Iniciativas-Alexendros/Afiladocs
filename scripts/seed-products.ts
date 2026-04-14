import { readFileSync } from 'node:fs'
import { join } from 'node:path'
import { config as loadDotenv } from 'dotenv'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

// tsx no carga .env automáticamente — replicamos el orden de Next.js.
loadDotenv({ path: join(process.cwd(), '.env.local') })
loadDotenv({ path: join(process.cwd(), '.env') })

const SEED_PATH = join(process.cwd(), 'prisma', 'seeds', 'products.json')

type SeedProduct = {
  sku: string
  slug: string
  title: string
  description_md: string
  category: string
  kind: 'template' | 'review' | 'pack'
  price_cents: number
  vat_mode: 'included' | 'excluded'
  stripe_price_id: string | null
  docuseal_template_id: string | null
  storage_path: string | null
  delivery_mode:
    | 'docuseal_fill_and_sign'
    | 'docuseal_fill_only'
    | 'download_after_payment'
    | 'human_review'
  eidas_level: 'SES' | 'AES'
  is_active: boolean
  display_order: number
}

async function main() {
  const connectionString = process.env.DIRECT_URL || process.env.DATABASE_URL
  if (!connectionString) {
    throw new Error('DIRECT_URL (preferred) o DATABASE_URL requeridos para seed.')
  }

  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })

  const raw = readFileSync(SEED_PATH, 'utf8')
  const products = JSON.parse(raw) as SeedProduct[]

  let upserts = 0
  for (const p of products) {
    await prisma.products.upsert({
      where: { sku: p.sku },
      create: p,
      update: {
        slug: p.slug,
        title: p.title,
        description_md: p.description_md,
        category: p.category,
        kind: p.kind,
        price_cents: p.price_cents,
        vat_mode: p.vat_mode,
        stripe_price_id: p.stripe_price_id,
        docuseal_template_id: p.docuseal_template_id,
        storage_path: p.storage_path,
        delivery_mode: p.delivery_mode,
        eidas_level: p.eidas_level,
        is_active: p.is_active,
        display_order: p.display_order,
      },
    })
    upserts++
  }

  console.log(JSON.stringify({ event: 'seed_products_done', upserts, ts: new Date().toISOString() }))
  await prisma.$disconnect()
}

main().catch((err) => {
  console.error(JSON.stringify({ event: 'seed_products_error', error: String(err) }))
  process.exit(1)
})
