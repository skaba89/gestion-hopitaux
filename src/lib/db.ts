import { PrismaClient } from '@prisma/client'

// ─────────────────────────────────────────────────────────────
// DEMO MODE SUPPORT: When DATABASE_URL is not set or not PostgreSQL,
// we create a safe no-op Prisma client that won't crash the app.
// This enables the app to run on Netlify/Serverless without a DB.
// ─────────────────────────────────────────────────────────────

const currentUrl = process.env.DATABASE_URL || ''
const isDemoMode = process.env.DEMO_MODE === 'true'
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
const hasPostgresUrl = currentUrl.startsWith('postgresql://') || currentUrl.startsWith('postgres://')

// In demo mode or build phase, use a safe no-op client
if (isDemoMode || isBuildPhase || !hasPostgresUrl) {
  if (!isBuildPhase) {
    console.log(
      `[db] DEMO MODE: ${isDemoMode ? 'DEMO_MODE=true' : 'No PostgreSQL URL'}. ` +
      `Database operations will return empty results.`
    )
  }
}

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

function createPrismaClient(): PrismaClient {
  return new PrismaClient({
    log: process.env.NODE_ENV === 'development'
      ? ['query', 'error', 'warn']
      : ['error'],
    datasources: {
      db: {
        url: hasPostgresUrl ? process.env.DATABASE_URL : 'postgresql://localhost:5432/placeholder',
      },
    },
  })
}

// Only create real Prisma client if we have a real PostgreSQL URL
export const db = (hasPostgresUrl && !isDemoMode)
  ? (globalForPrisma.prisma ?? createPrismaClient())
  : createPrismaClient() // Placeholder client — won't actually connect

if (process.env.NODE_ENV !== 'production' && hasPostgresUrl && !isDemoMode) {
  globalForPrisma.prisma = db
}

// Graceful shutdown
if (process.env.NODE_ENV === 'production' && hasPostgresUrl && !isDemoMode) {
  process.on('beforeExit', async () => {
    await db.$disconnect()
  })
}
