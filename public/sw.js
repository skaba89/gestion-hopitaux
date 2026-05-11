// HealthFlow Africa - Service Worker v1
// Offline-first caching strategies for hospital information system

const CACHE_NAME = 'healthflow-v1'
const STATIC_CACHE = 'healthflow-static-v1'
const API_CACHE = 'healthflow-api-v1'
const PAGE_CACHE = 'healthflow-pages-v1'

// Static assets to cache on install
const STATIC_ASSETS = [
  '/',
  '/manifest.json',
  '/logo.svg',
]

// Cache-first for static assets (JS, CSS, images, fonts)
const STATIC_EXTENSIONS = [
  '.js', '.css', '.png', '.jpg', '.jpeg', '.svg', '.gif', '.webp',
  '.woff', '.woff2', '.ttf', '.eot', '.ico',
]

// Install event - pre-cache essential assets
self.addEventListener('install', (event) => {
  event.waitUntil(
    caches.open(STATIC_CACHE).then((cache) => {
      return cache.addAll(STATIC_ASSETS)
    }).then(() => {
      return self.skipWaiting()
    })
  )
})

// Activate event - clean up old caches
self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys().then((cacheNames) => {
      return Promise.all(
        cacheNames
          .filter((name) => name.startsWith('healthflow-') && name !== CACHE_NAME && name !== STATIC_CACHE && name !== API_CACHE && name !== PAGE_CACHE)
          .map((name) => caches.delete(name))
      )
    }).then(() => {
      return self.clients.claim()
    })
  )
})

// Helper: determine if a request is for a static asset
function isStaticAsset(url) {
  return STATIC_EXTENSIONS.some((ext) => url.pathname.endsWith(ext))
}

// Helper: determine if a request is an API call
function isApiRequest(url) {
  return url.pathname.startsWith('/api/')
}

// Strategy: Cache-First for static assets
async function cacheFirst(request) {
  const cached = await caches.match(request)
  if (cached) return cached

  try {
    const response = await fetch(request)
    if (response.ok) {
      const cache = await caches.open(STATIC_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    // Return offline fallback for images
    if (request.destination === 'image') {
      return new Response(
        '<svg xmlns="http://www.w3.org/2000/svg" width="200" height="200" viewBox="0 0 200 200"><rect fill="#1e293b" width="200" height="200"/><text fill="#64748b" font-size="14" x="50%" y="50%" dominant-baseline="middle" text-anchor="middle">Hors ligne</text></svg>',
        { headers: { 'Content-Type': 'image/svg+xml' } }
      )
    }
    return new Response('Offline', { status: 503, statusText: 'Service Unavailable' })
  }
}

// Strategy: Network-First for API calls
async function networkFirst(request) {
  try {
    const response = await fetch(request)
    if (response.ok && request.method === 'GET') {
      const cache = await caches.open(API_CACHE)
      cache.put(request, response.clone())
    }
    return response
  } catch {
    const cached = await caches.match(request)
    if (cached) return cached

    return new Response(
      JSON.stringify({ success: false, error: 'Vous êtes hors ligne. Cette donnée n\'est pas disponible en cache.' }),
      { status: 503, headers: { 'Content-Type': 'application/json' } }
    )
  }
}

// Strategy: Stale-While-Revalidate for pages
async function staleWhileRevalidate(request) {
  const cache = await caches.open(PAGE_CACHE)
  const cached = await cache.match(request)

  const fetchPromise = fetch(request).then((response) => {
    if (response.ok) {
      cache.put(request, response.clone())
    }
    return response
  }).catch(() => cached)

  return cached || fetchPromise
}

// Fetch event - route requests to appropriate strategy
self.addEventListener('fetch', (event) => {
  const url = new URL(event.request.url)

  // Skip non-GET requests for caching (POST, PUT, DELETE handled by sync queue)
  if (event.request.method !== 'GET') {
    // Queue mutation requests when offline
    if (!navigator.onLine) {
      event.respondWith(
        (async () => {
          // Store the request in IndexedDB for later sync
          const db = await openSyncDB()
          await db.put('syncQueue', {
            url: event.request.url,
            method: event.request.method,
            headers: Object.fromEntries(event.request.headers.entries()),
            body: await event.request.text(),
            timestamp: Date.now(),
          })
          // Notify clients about pending sync
          const clients = await self.clients.matchAll()
          clients.forEach((client) => {
            client.postMessage({ type: 'SYNC_QUEUED', timestamp: Date.now() })
          })
          return new Response(
            JSON.stringify({ success: false, error: 'Requête mise en file d\'attente. Sera synchronisée lors de la reconnexion.' }),
            { status: 202, headers: { 'Content-Type': 'application/json' } }
          )
        })()
      )
      return
    }
    return
  }

  // Skip chrome-extension and other non-http requests
  if (!url.protocol.startsWith('http')) return

  if (isApiRequest(url)) {
    event.respondWith(networkFirst(event.request))
  } else if (isStaticAsset(url)) {
    event.respondWith(cacheFirst(event.request))
  } else {
    event.respondWith(staleWhileRevalidate(event.request))
  }
})

// Background Sync for pending data changes
self.addEventListener('sync', (event) => {
  if (event.tag === 'healthflow-sync') {
    event.waitUntil(processSyncQueue())
  }
})

// Process the sync queue
async function processSyncQueue() {
  const db = await openSyncDB()
  const items = await db.getAll('syncQueue')

  for (const item of items) {
    try {
      const response = await fetch(item.url, {
        method: item.method,
        headers: item.headers,
        body: item.body,
      })

      if (response.ok) {
        await db.delete('syncQueue', item.id)
      }
    } catch {
      // Will retry on next sync event
      break
    }
  }

  // Notify clients that sync is complete
  const clients = await self.clients.matchAll()
  clients.forEach((client) => {
    client.postMessage({ type: 'SYNC_COMPLETE', timestamp: Date.now() })
  })
}

// IndexedDB helper for sync queue
function openSyncDB() {
  return new Promise((resolve, reject) => {
    const request = indexedDB.open('healthflow-sync', 1)
    request.onupgradeneeded = () => {
      const db = request.result
      if (!db.objectStoreNames.contains('syncQueue')) {
        db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
      }
    }
    request.onsuccess = () => resolve(request.result)
    request.onerror = () => reject(request.error)
  })
}

// Push notification handler
self.addEventListener('push', (event) => {
  const data = event.data ? event.data.json() : {}
  const title = data.title || 'HealthFlow Africa'
  const options = {
    body: data.body || 'Nouvelle notification',
    icon: '/icons/icon-192x192.png',
    badge: '/icons/icon-72x72.png',
    vibrate: [100, 50, 100],
    data: data.data || {},
    actions: data.actions || [],
  }
  event.waitUntil(self.registration.showNotification(title, options))
})

// Notification click handler
self.addEventListener('notificationclick', (event) => {
  event.notification.close()
  event.waitUntil(
    self.clients.matchAll({ type: 'window' }).then((clientList) => {
      if (clientList.length > 0) {
        return clientList[0].focus()
      }
      return self.clients.openWindow('/')
    })
  )
})
