'use client'

import { useEffect } from 'react'
import { registerServiceWorker, initNetworkListeners } from '@/lib/pwa'

/**
 * Component that registers the PWA service worker on mount
 * This is rendered as a child in the page component
 */
export function PWARegistrar() {
  useEffect(() => {
    registerServiceWorker()
    const cleanup = initNetworkListeners()
    return cleanup
  }, [])

  return null
}
