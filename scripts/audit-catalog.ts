/**
 * Catalog audit · compara `catalog/manifest.json` contra BD Prisma, Stripe y (cuando se
 * amplie) DocuSeal + Supabase Storage. Uso:
 *
 *   npx tsx scripts/audit-catalog.ts --sku AFD-RGPD-CES-001
 *   npx tsx scripts/audit-catalog.ts --all
 *   npx tsx scripts/audit-catalog.ts --all --format md
 *
 * Implementacion inicial (v1): verifica BD + manifest + basic Stripe coherencia (cuando
 * STRIPE_SECRET_KEY este definido). Extensiones (DocuSeal, Storage SHA256) se anaden en
 * iteraciones posteriores siguiendo el mismo patron `Check`.
 *
 * No modifica ninguna fuente — solo lee.
 */
import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'

type Severity = 'ok' | 'warn' | 'critical' | 'skipped'

interface Check {
  name: string
  severity: Severity
  message: string
}

interface SkuAudit {
  sku: string
  verdict: 'ready' | 'warn' | 'block' | 'partial'
  checks: Check[]
}

interface ManifestProduct {
  sku: string
  version: string
  status: 'draft' | 'qa_legal' | 'template_ready' | 'live' | 'retired'
  stripe_price_id: string | null
  stripe_last_verified: string | null
  docuseal_template_id: string | null
  docuseal_last_verified: string | null
  storage_paths: string[]
  storage_sha256: Record<string, string>
  legal_sources: string[]
  legal_reviewed_by: string | null
  legal_reviewed_at: string | null
  changelog: Array<{ date: string; author: string; note: string }>
}

interface Manifest {
  version: number
  updated_at: string
  products: ManifestProduct[]
}

function loadManifest(): Manifest {
  const path = resolve(process.cwd(), 'catalog/manifest.json')
  return JSON.parse(readFileSync(path, 'utf-8')) as Manifest
}

function worstSeverity(checks: Check[]): Severity {
  if (checks.some((c) => c.severity === 'critical')) return 'critical'
  if (checks.some((c) => c.severity === 'warn')) return 'warn'
  if (checks.every((c) => c.severity === 'ok' || c.severity === 'skipped')) {
    return checks.some((c) => c.severity === 'skipped') ? 'skipped' : 'ok'
  }
  return 'ok'
}

function verdictFromSeverity(s: Severity): SkuAudit['verdict'] {
  switch (s) {
    case 'critical': return 'block'
    case 'warn': return 'warn'
    case 'skipped': return 'partial'
    case 'ok': return 'ready'
  }
}

async function checkBdConsistency(prisma: PrismaClient, mp: ManifestProduct): Promise<Check[]> {
  const row = await prisma.products.findUnique({ where: { sku: mp.sku } })
  if (!row) {
    return [{ name: 'bd.exists', severity: 'critical', message: `products.sku=${mp.sku} no existe en BD` }]
  }
  const checks: Check[] = [{ name: 'bd.exists', severity: 'ok', message: `products.sku=${mp.sku} presente` }]

  if ((row.stripe_price_id ?? null) !== mp.stripe_price_id) {
    checks.push({
      name: 'bd.stripe_price_id',
      severity: 'warn',
      message: `BD.stripe_price_id=${row.stripe_price_id} != manifest=${mp.stripe_price_id}`,
    })
  } else {
    checks.push({ name: 'bd.stripe_price_id', severity: 'ok', message: 'coincide con manifest' })
  }

  if ((row.docuseal_template_id ?? null) !== mp.docuseal_template_id) {
    checks.push({
      name: 'bd.docuseal_template_id',
      severity: 'warn',
      message: `BD.docuseal_template_id=${row.docuseal_template_id} != manifest=${mp.docuseal_template_id}`,
    })
  } else {
    checks.push({ name: 'bd.docuseal_template_id', severity: 'ok', message: 'coincide con manifest' })
  }

  const liveAndActive = mp.status === 'live' && row.is_active
  const nonLiveAndInactive = mp.status !== 'live' && !row.is_active
  if (!liveAndActive && !nonLiveAndInactive) {
    checks.push({
      name: 'bd.is_active_vs_status',
      severity: 'critical',
      message: `is_active=${row.is_active} incoherente con manifest.status=${mp.status}`,
    })
  } else {
    checks.push({ name: 'bd.is_active_vs_status', severity: 'ok', message: `status=${mp.status} coincide con is_active=${row.is_active}` })
  }

  return checks
}

function checkLegalReview(mp: ManifestProduct): Check[] {
  if (mp.status !== 'live') {
    return [{ name: 'legal.review_age', severity: 'skipped', message: `status=${mp.status}; no aplica revision anual` }]
  }
  if (!mp.legal_reviewed_at) {
    return [{ name: 'legal.review_age', severity: 'critical', message: 'status=live pero legal_reviewed_at=null' }]
  }
  const reviewed = new Date(mp.legal_reviewed_at).getTime()
  const ageMonths = (Date.now() - reviewed) / (1000 * 60 * 60 * 24 * 30.44)
  if (ageMonths > 12) {
    return [{ name: 'legal.review_age', severity: 'critical', message: `ultima revision hace ${ageMonths.toFixed(1)} meses (> 12m)` }]
  }
  if (ageMonths > 9) {
    return [{ name: 'legal.review_age', severity: 'warn', message: `ultima revision hace ${ageMonths.toFixed(1)} meses (> 9m)` }]
  }
  return [{ name: 'legal.review_age', severity: 'ok', message: `ultima revision hace ${ageMonths.toFixed(1)} meses` }]
}

async function checkStripe(mp: ManifestProduct): Promise<Check[]> {
  if (!mp.stripe_price_id) {
    return [{ name: 'stripe.price', severity: 'skipped', message: 'sin stripe_price_id en manifest' }]
  }
  const key = process.env.STRIPE_SECRET_KEY
  if (!key) {
    return [{ name: 'stripe.price', severity: 'skipped', message: 'STRIPE_SECRET_KEY no definido' }]
  }
  const checks: Check[] = []
  try {
    const res = await fetch(`https://api.stripe.com/v1/prices/${mp.stripe_price_id}`, {
      headers: { Authorization: `Bearer ${key}` },
    })
    if (!res.ok) {
      checks.push({ name: 'stripe.price', severity: 'critical', message: `Stripe ${res.status}: price ${mp.stripe_price_id} no accesible` })
      return checks
    }
    const price = (await res.json()) as { active: boolean; currency: string; unit_amount: number; recurring: unknown; metadata: Record<string, string> }
    if (!price.active) {
      checks.push({ name: 'stripe.price.active', severity: 'critical', message: 'price no activo' })
    } else {
      checks.push({ name: 'stripe.price.active', severity: 'ok', message: 'price activo' })
    }
    if (price.currency !== 'eur') {
      checks.push({ name: 'stripe.price.currency', severity: 'warn', message: `currency=${price.currency} (esperado eur)` })
    }
    if (price.recurring) {
      checks.push({ name: 'stripe.price.recurring', severity: 'critical', message: 'price es recurring (se esperaba one-time)' })
    }
    if (price.metadata?.sku && price.metadata.sku !== mp.sku) {
      checks.push({ name: 'stripe.price.metadata', severity: 'warn', message: `metadata.sku=${price.metadata.sku} != manifest.sku` })
    }
  } catch (err) {
    checks.push({ name: 'stripe.price', severity: 'warn', message: `fetch error: ${err instanceof Error ? err.message : 'unknown'}` })
  }
  return checks
}

async function checkDocuseal(mp: ManifestProduct): Promise<Check[]> {
  if (!mp.docuseal_template_id) {
    return [{ name: 'docuseal.template', severity: 'skipped', message: 'sin docuseal_template_id en manifest' }]
  }
  const apiUrl = process.env.DOCUSEAL_API_URL
  const apiKey = process.env.DOCUSEAL_API_KEY
  if (!apiUrl || !apiKey) {
    return [{ name: 'docuseal.template', severity: 'skipped', message: 'DOCUSEAL_API_URL/KEY no definidos' }]
  }
  try {
    const res = await fetch(`${apiUrl}/templates/${mp.docuseal_template_id}`, {
      headers: { 'X-Auth-Token': apiKey },
    })
    if (!res.ok) {
      return [{ name: 'docuseal.template', severity: 'critical', message: `DocuSeal ${res.status}: template ${mp.docuseal_template_id} no accesible` }]
    }
    return [{ name: 'docuseal.template', severity: 'ok', message: `template ${mp.docuseal_template_id} existe` }]
  } catch (err) {
    return [{ name: 'docuseal.template', severity: 'warn', message: `fetch error: ${err instanceof Error ? err.message : 'unknown'}` }]
  }
}

async function auditSku(prisma: PrismaClient, mp: ManifestProduct): Promise<SkuAudit> {
  const checks: Check[] = []
  checks.push(...(await checkBdConsistency(prisma, mp)))
  checks.push(...checkLegalReview(mp))
  checks.push(...(await checkStripe(mp)))
  checks.push(...(await checkDocuseal(mp)))
  return { sku: mp.sku, verdict: verdictFromSeverity(worstSeverity(checks)), checks }
}

const SEVERITY_MARK: Record<Severity, string> = {
  ok: '✓',
  warn: '!',
  critical: '✗',
  skipped: '·',
}

function severityMark(severity: Severity): string {
  return SEVERITY_MARK[severity]
}

function formatText(audits: SkuAudit[]): string {
  const lines: string[] = []
  const emoji = { ready: '✅', warn: '🟡', block: '❌', partial: '⏭️ ' } as const
  lines.push(`# Auditoria catalogo Afiladocs · ${new Date().toISOString()}`)
  const counts = { ready: 0, warn: 0, block: 0, partial: 0 }
  for (const a of audits) counts[a.verdict]++
  lines.push('')
  lines.push(`**Verdict:** ✅ ${counts.ready}/${audits.length} · 🟡 ${counts.warn} · ❌ ${counts.block} · ⏭️  ${counts.partial}`)
  lines.push('')
  for (const a of audits) {
    lines.push(`## ${a.sku} ${emoji[a.verdict]} ${a.verdict.toUpperCase()}`)
    for (const c of a.checks) {
      lines.push(`- ${severityMark(c.severity)} \`${c.name}\`: ${c.message}`)
    }
    lines.push('')
  }
  return lines.join('\n')
}

async function main(): Promise<void> {
  const args = process.argv.slice(2)
  const all = args.includes('--all')
  const skuArg = args.indexOf('--sku')
  const sku = skuArg >= 0 ? args[skuArg + 1] : null
  const format = args.includes('--format') ? args[args.indexOf('--format') + 1] : 'md'

  if (!all && !sku) {
    console.error('Usage: audit-catalog.ts --all | --sku <SKU> [--format md]')
    process.exit(2)
  }

  const manifest = loadManifest()
  const targets = all ? manifest.products : manifest.products.filter((p) => p.sku === sku)
  if (targets.length === 0) {
    console.error(`SKU ${sku} no encontrado en manifest`)
    process.exit(2)
  }

  const connectionString = process.env.DATABASE_URL
  if (!connectionString) {
    console.error('audit-catalog: DATABASE_URL no definida en entorno')
    process.exit(2)
  }
  const adapter = new PrismaPg({ connectionString })
  const prisma = new PrismaClient({ adapter })
  try {
    const audits: SkuAudit[] = []
    for (const mp of targets) {
      audits.push(await auditSku(prisma, mp))
    }
    if (format === 'json') {
      console.log(JSON.stringify(audits, null, 2))
    } else {
      console.log(formatText(audits))
    }
    const hasBlock = audits.some((a) => a.verdict === 'block')
    process.exit(hasBlock ? 1 : 0)
  } finally {
    await prisma.$disconnect()
  }
}

main().catch((err) => {
  console.error('audit-catalog failed:', err)
  process.exit(2)
})
