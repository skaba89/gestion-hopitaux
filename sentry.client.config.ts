// HealthFlow Guinea - Sentry Client Configuration
// This file is automatically loaded by @sentry/nextjs on the client side

import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',

    // Adjust sample rates based on environment
    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    ignoreErrors: [
      'ChunkLoadError',
      'Loading chunk',
      'NetworkError',
      'Failed to fetch',
      'Network request failed',
      'Non-Error promise rejection captured',
    ],

    // Don't send events in development
    beforeSend(event: any) {
      if (process.env.NODE_ENV === 'development') return null
      return event
    },
  })
}
