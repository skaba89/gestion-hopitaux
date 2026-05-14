// HealthFlow Guinea - Next.js Instrumentation
// This file runs BEFORE any other server code, including API routes.
// Used to ensure critical environment variables are correctly set before Prisma loads.

export async function register() {
  // ─────────────────────────────────────────────────────────────
  // SECURITY FIX: Validate DATABASE_URL instead of hardcoding.
  // In production, if DATABASE_URL is missing or not PostgreSQL,
  // we log a clear error. The app will fail to start in db.ts
  // if this is not resolved.
  // ─────────────────────────────────────────────────────────────
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
