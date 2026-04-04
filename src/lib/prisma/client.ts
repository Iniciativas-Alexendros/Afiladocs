import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { serverEnv } from '@/lib/env'

// Prisma 7 usa el engine "client" (JS puro) por defecto — no requiere binario nativo.
// PrismaPg proporciona el driver adapter para conectar con PostgreSQL sin binario.
// Requerido tanto en Vercel (serverless) como en desarrollo local sin engines instalados.
const adapter = new PrismaPg({ connectionString: serverEnv.databaseUrl })

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === 'development' ? ['warn', 'error'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = prisma
