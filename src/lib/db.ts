import { PrismaClient } from '@prisma/client'

// ─────────────────────────────────────────────────────────────
// SECURITY FIX: No hardcoded database URLs.
// DATABASE_URL MUST be set via environment variable.
// If it's set to a non-PostgreSQL value (e.g. SQLite from old setup),
// we fail fast instead of silently connecting to the wrong DB.
// ─────────────────────────────────────────────────────────────
const currentUrl = process.env.DATABASE_URL || ''
const isBuildPhase = process.env.NEXT_PHASE === 'phase-production-build'
if (!currentUrl.startsWith('postgresql://') && !currentUrl.startsWith('postgres://')) {
  if (process.env.NODE_ENV === 'production' && !isBuildPhase) {
    throw new Error(
      '[FATAL] DATABASE_URL must be a valid PostgreSQL connection string in production. ' +
      `Current value: "${currentUrl.slice(0, 30)}..."`
    )
  }
  // In development, warn but try to proceed with the .env value
  if (currentUrl) {
    console.warn(
      `[db] WARNING: DATABASE_URL is "${currentUrl.slice(0, 40)}..." which is not PostgreSQL. ` +
      `Please set DATABASE_URL to a PostgreSQL connection string in .env`
    )
  } else {
    console.warn('[db] WARNING: DATABASE_URL not found in process.env')
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
        url: process.env.DATABASE_URL,
      },
    },
  })
}

export const db = globalForPrisma.prisma ?? createPrismaClient()

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

// Graceful shutdown
if (process.env.NODE_ENV === 'production') {
  process.on('beforeExit', async () => {
    await db.$disconnect()
  })
}
