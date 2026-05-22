// HealthFlow Guinea - Next.js Instrumentation
// This file runs BEFORE any other server code, including API routes.
// Used to ensure critical environment variables are correctly set before Prisma loads.

export async function register() {
  // Detect demo mode: either explicitly set, or no PostgreSQL URL in production
  const dbUrl = process.env.DATABASE_URL || ''
  const hasPostgresUrl = dbUrl.startsWith('postgresql://') || dbUrl.startsWith('postgres://')
  const isDemoMode = process.env.DEMO_MODE === 'true' ||
    (!hasPostgresUrl && process.env.NODE_ENV === 'production')

  // ─── DEMO MODE SETUP ───
  if (isDemoMode) {
    console.log('[instrumentation] DEMO_MODE is active — running without database')

    // Auto-generate secrets for demo mode if not set
    if (!process.env.JWT_SECRET) {
      process.env.JWT_SECRET = 'healthflow-guinea-demo-jwt-secret-NOT-FOR-PRODUCTION'
      console.log('[instrumentation] JWT_SECRET auto-generated for demo mode')
    }
    if (!process.env.NEXTAUTH_SECRET) {
      process.env.NEXTAUTH_SECRET = 'healthflow-guinea-demo-nextauth-secret-NOT-FOR-PRODUCTION'
      console.log('[instrumentation] NEXTAUTH_SECRET auto-generated for demo mode')
    }
    if (!process.env.ENCRYPTION_KEY) {
      process.env.ENCRYPTION_KEY = 'demo-encryption-key-32-bytes-long!!'
      console.log('[instrumentation] ENCRYPTION_KEY auto-generated for demo mode')
    }
    if (!process.env.DATABASE_URL) {
      process.env.DATABASE_URL = 'file:/tmp/demo.db'
    }

    // Skip all database validation in demo mode
    return
  }

  // ─── PRODUCTION MODE VALIDATION ───
  const currentUrl = process.env.DATABASE_URL || ''
  if (!currentUrl.startsWith('postgresql://') && !currentUrl.startsWith('postgres://')) {
    if (process.env.NODE_ENV === 'production') {
      console.error(
        '[instrumentation] FATAL: DATABASE_URL is not a PostgreSQL URL. ' +
        'The application cannot start. Please set DATABASE_URL in your environment.'
      )
    } else {
      console.warn(
        `[instrumentation] DATABASE_URL is "${currentUrl.slice(0, 30)}..." - not PostgreSQL. ` +
        'Please update .env with a valid PostgreSQL connection string.'
      )
    }
  }

  // Validate critical secrets in production
  if (process.env.NODE_ENV === 'production') {
    const criticalVars = ['JWT_SECRET', 'NEXTAUTH_SECRET', 'ENCRYPTION_KEY']
    for (const varName of criticalVars) {
      if (!process.env[varName]) {
        console.error(`[instrumentation] FATAL: ${varName} is not set. Application cannot start safely.`)
      }
    }
  }

  // Also ensure REDIS_URL has a fallback
  if (!process.env.REDIS_URL) {
    if (process.env.NODE_ENV === 'production') {
      console.error('[instrumentation] WARNING: REDIS_URL is not set. Rate limiting and OTP storage will not work.')
    } else {
      process.env.REDIS_URL = 'redis://localhost:6380'
    }
  }
}
