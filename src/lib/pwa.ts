// HealthFlow Africa - PWA Registration Utility

export type SyncStatus = 'idle' | 'syncing' | 'offline'

interface PWAState {
  isOnline: boolean
  isInstalled: boolean
  hasUpdate: boolean
  syncStatus: SyncStatus
  pendingCount: number
}

let registration: ServiceWorkerRegistration | null = null
let updateAvailable = false
const listeners: Set<(state: Partial<PWAState>) => void> = new Set()

function notifyListeners(update: Partial<PWAState>) {
  listeners.forEach((fn) => fn(update))
}

/**
 * Register the service worker
 */
export async function registerServiceWorker(): Promise<void> {
  if (typeof window === 'undefined' || !('serviceWorker' in navigator)) {
    return
  }

  try {
    registration = await navigator.serviceWorker.register('/sw.js', {
      scope: '/',
    })

    // Check for updates on load
    registration.addEventListener('updatefound', () => {
      const newWorker = registration?.waiting
      if (newWorker) {
        updateAvailable = true
        notifyListeners({ hasUpdate: true })
      }
    })

    // Listen for messages from the service worker
    navigator.serviceWorker.addEventListener('message', (event) => {
      const data = event.data
      if (data?.type === 'SYNC_QUEUED') {
        notifyListeners({ syncStatus: 'offline' })
      } else if (data?.type === 'SYNC_COMPLETE') {
        notifyListeners({ syncStatus: 'idle' })
      }
    })

    // Periodically check for updates (every 30 minutes)
    setInterval(() => {
      checkForUpdates()
    }, 30 * 60 * 1000)
  } catch (error) {
    console.error('SW registration failed:', error)
  }
}

/**
 * Check for service worker updates
 */
export async function checkForUpdates(): Promise<boolean> {
  if (!registration) return false

  try {
    await registration.update()
    return updateAvailable
  } catch {
    return false
  }
}

/**
 * Apply the waiting service worker update
 */
export async function applyUpdate(): Promise<void> {
  if (!registration?.waiting) return

  registration.waiting.postMessage({ type: 'SKIP_WAITING' })

  return new Promise((resolve) => {
    const onActivated = () => {
      navigator.serviceWorker.removeEventListener('controllerchange', onActivated)
      resolve()
    }
    navigator.serviceWorker.addEventListener('controllerchange', onActivated)
  })
}

/**
 * Get current online/offline status
 */
export function isOnline(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

/**
 * Subscribe to PWA state changes
 */
export function subscribeToPWAState(listener: (state: Partial<PWAState>) => void): () => void {
  listeners.add(listener)
  return () => listeners.delete(listener)
}

/**
 * Get the current PWA state
 */
export function getPWAState(): PWAState {
  return {
    isOnline: typeof window !== 'undefined' ? navigator.onLine : true,
    isInstalled: typeof window !== 'undefined' && window.matchMedia('(display-mode: standalone)').matches,
    hasUpdate: updateAvailable,
    syncStatus: 'idle',
    pendingCount: 0,
  }
}

/**
 * Initialize online/offline event listeners
 */
export function initNetworkListeners(): () => void {
  if (typeof window === 'undefined') return () => {}

  const onOnline = () => {
    notifyListeners({ isOnline: true, syncStatus: 'syncing' })
    // Trigger background sync
    if ('serviceWorker' in navigator && navigator.serviceWorker.controller) {
      navigator.serviceWorker.ready.then((reg) => {
        return (reg as any).sync.register('healthflow-sync')
      }).catch(console.error)
    }
    // Reset sync status after a delay
    setTimeout(() => {
      notifyListeners({ syncStatus: 'idle' })
    }, 3000)
  }

  const onOffline = () => {
    notifyListeners({ isOnline: false, syncStatus: 'offline' })
  }

  window.addEventListener('online', onOnline)
  window.addEventListener('offline', onOffline)

  return () => {
    window.removeEventListener('online', onOnline)
    window.removeEventListener('offline', onOffline)
  }
}
