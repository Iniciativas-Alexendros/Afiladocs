import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { config as loadDotenv } from 'dotenv'
import { defineConfig } from 'prisma/config'

// __dirname is undefined in ESM context — initialize explicitly
const __dirname = fileURLToPath(new URL('.', import.meta.url)).slice(0, -1)

// Prisma 7 no carga .env automáticamente; lo hacemos aquí para migrate dev/deploy.
loadDotenv({ path: path.join(__dirname, '.env.local') })
loadDotenv({ path: path.join(__dirname, '.env') })

const url = process.env.DIRECT_URL || process.env.DATABASE_URL
if (!url) {
  throw new Error(
    'prisma.config.ts: define DIRECT_URL (preferido para migraciones) o DATABASE_URL en .env.local',
  )
}

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
  datasource: { url },
})
