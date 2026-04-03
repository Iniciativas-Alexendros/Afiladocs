import path from 'node:path'
import { fileURLToPath } from 'node:url'
import { defineConfig } from 'prisma/config'

// __dirname is undefined in ESM context — initialize explicitly
const __dirname = fileURLToPath(new URL('.', import.meta.url)).slice(0, -1)

export default defineConfig({
  schema: path.join(__dirname, 'prisma', 'schema.prisma'),
})
