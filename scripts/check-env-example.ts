#!/usr/bin/env tsx
// Verifica que cada variable de entorno consumida por src/lib/env.ts esté
// documentada en .env.example. Evita que un PR introduzca una env nueva sin
// dejar rastro. Se ejecuta en CI y como parte de `npm run ci:local`.

import { readFileSync } from 'node:fs'
import { resolve } from 'node:path'

const ROOT = resolve(__dirname, '..')
const ENV_TS = resolve(ROOT, 'src/lib/env.ts')
const ENV_EXAMPLE = resolve(ROOT, '.env.example')

// Claves que el script NO tiene que verificar (inyectadas por Vercel, Next.js
// runtime, o internas de Node). No forman parte del contrato documentado.
const IGNORED = new Set([
  'NODE_ENV',
  'VERCEL_URL',
  'NEXT_PUBLIC_VERCEL_ENV',
  'NEXT_PUBLIC_VERCEL_GIT_COMMIT_REF',
  'NEXT_PUBLIC_VERCEL_GIT_COMMIT_SHA',
])

const envTs = readFileSync(ENV_TS, 'utf8')
const envExample = readFileSync(ENV_EXAMPLE, 'utf8')

const referenced = new Set<string>()
const patterns = [
  /getEnvVar\(\s*['"]([A-Z0-9_]+)['"]/g,
  /process\.env\.([A-Z0-9_]+)/g,
  /process\.env\[\s*['"]([A-Z0-9_]+)['"]\s*\]/g,
]
for (const re of patterns) {
  for (const m of envTs.matchAll(re)) referenced.add(m[1])
}

const documented = new Set(
  envExample
    .split('\n')
    .map((l) => l.trim())
    .filter((l) => l && !l.startsWith('#'))
    .map((l) => l.split('=')[0].trim())
    .filter(Boolean),
)

const missing = [...referenced]
  .filter((k) => !IGNORED.has(k))
  .filter((k) => !documented.has(k))
  .sort()

if (missing.length) {
  console.error('❌ Variables referenciadas en src/lib/env.ts pero ausentes en .env.example:')
  for (const k of missing) console.error(`   - ${k}`)
  console.error('\nAñádelas a .env.example con un valor de ejemplo antes de hacer merge.')
  process.exit(1)
}

console.log(`✅ .env.example cubre las ${referenced.size - IGNORED.size} variables de src/lib/env.ts`)
