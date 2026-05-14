'use client'

import { useEffect } from 'react'
import { registerServiceWorker, initNetworkListeners } from '@/lib/pwa'

/**
 * Component that registers the PWA service worker on mount
 * This is rendered as a child in the page component
 * 
 * IMPORTANT: Service Worker is disabled in development to prevent
 * ChunkLoadError with Turbopack (SW caches stale chunks with
 * cache-first strategy, causing hash mismatches after HMR updates)
 */
export function PWARegistrar() {
  useEffect(() => {
    // Disable SW in development — Turbopack HMR regenerates chunks
    // with new hashes, and the SW cache-first strategy serves stale
    // chunks causing ChunkLoadError
    if (process.env.NODE_ENV === 'development') {
      console.log('[HealthFlow] Service Worker disabled in development mode')
      return
    }
    
    registerServiceWorker()
    const cleanup = initNetworkListeners()
    return cleanup
  }, [])

  return null
}
