/**
 * HealthFlow Guinea - Sentry Error Monitoring Configuration
 * Initializes Sentry for server-side error tracking and performance monitoring
 * Sentry is optional — if @sentry/nextjs is not installed, all functions are no-ops
 */

let sentryInitialized = false

export async function initSentry() {
  if (sentryInitialized) return
  if (!process.env.NEXT_PUBLIC_SENTRY_DSN) {
    console.warn('[Sentry] DSN not configured, skipping initialization')
    return
  }

  try {
    const Sentry = await import('@sentry/nextjs')
    Sentry.init({
      dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
      environment: process.env.NODE_ENV || 'development',
      release: process.env.npm_package_version || '1.0.0',
      tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      profilesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,
      replaysSessionSampleRate: 0,
      replaysOnErrorSampleRate: 1.0,
      integrations: [],
      ignoreErrors: [
        'ChunkLoadError',
        'Loading chunk',
        'Non-Error promise rejection captured',
        'NetworkError',
        'Failed to fetch',
        'Network request failed',
      ],
      beforeSend(event: any) {
        if (process.env.NODE_ENV === 'development') return null
        if (event.request?.url?.includes('/api/health')) return null
        return event
      },
    })
    sentryInitialized = true
    console.log('[Sentry] Initialized for environment:', process.env.NODE_ENV)
  } catch (error) {
    console.warn('[Sentry] Failed to initialize (package may not be installed):', (error as Error).message)
  }
}

/**
 * Capture an exception with Sentry (no-op if not configured)
 */
export async function captureException(error: Error, context?: Record<string, unknown>) {
  if (!sentryInitialized || !process.env.NEXT_PUBLIC_SENTRY_DSN) return
  try {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureException(error, { extra: context })
  } catch {
    // Silently fail - don't let Sentry errors break the app
  }
}

/**
 * Capture a message with Sentry (no-op if not configured)
 */
export async function captureMessage(message: string, level: 'info' | 'warning' | 'error' = 'info') {
  if (!sentryInitialized || !process.env.NEXT_PUBLIC_SENTRY_DSN) return
  try {
    const Sentry = await import('@sentry/nextjs')
    Sentry.captureMessage(message, level)
  } catch {
    // Silently fail
  }
}
