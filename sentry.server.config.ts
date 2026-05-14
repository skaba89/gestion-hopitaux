// HealthFlow Guinea - Sentry Server Configuration
// This file is automatically loaded by @sentry/nextjs on the server side

import * as Sentry from '@sentry/nextjs'

if (process.env.NEXT_PUBLIC_SENTRY_DSN) {
  Sentry.init({
    dsn: process.env.NEXT_PUBLIC_SENTRY_DSN,
    environment: process.env.NODE_ENV || 'development',
    release: process.env.npm_package_version || '1.0.0',

    tracesSampleRate: process.env.NODE_ENV === 'production' ? 0.1 : 1.0,

    ignoreErrors: [
      'ChunkLoadError',
      'NetworkError',
      'Failed to fetch',
    ],

    beforeSend(event: any) {
      if (process.env.NODE_ENV === 'development') return null
      // Filter out health check requests
      if (event.request?.url?.includes('/api/health')) return null
      return event
    },
  })
}
