// HealthFlow Africa - IndexedDB Wrapper for Offline Data
// Provides offline CRUD operations with sync queue support

const DB_NAME = 'healthflow-offline'
const DB_VERSION = 1

export type OfflineStore = 'patients' | 'appointments' | 'consultations' | 'labRequests' | 'medications'

interface SyncQueueItem {
  id?: number
  store: OfflineStore
  action: 'create' | 'update' | 'delete'
  data: unknown
  recordId: string
  timestamp: number
  synced: boolean
}

interface OfflineRecord {
  id: string
  data: unknown
  store: OfflineStore
  lastModified: number
  isLocal: boolean // true = created offline, not yet synced
}

let dbInstance: IDBDatabase | null = null

/**
 * Open the IndexedDB database
 */
function openDB(): Promise<IDBDatabase> {
  if (dbInstance) return Promise.resolve(dbInstance)

  return new Promise((resolve, reject) => {
    const request = indexedDB.open(DB_NAME, DB_VERSION)

    request.onupgradeneeded = () => {
      const db = request.result

      // Create object stores
      const stores: OfflineStore[] = ['patients', 'appointments', 'consultations', 'labRequests', 'medications']

      stores.forEach((storeName) => {
        if (!db.objectStoreNames.contains(storeName)) {
          const store = db.createObjectStore(storeName, { keyPath: 'id' })
          store.createIndex('lastModified', 'lastModified', { unique: false })
          store.createIndex('isLocal', 'isLocal', { unique: false })
        }
      })

      // Sync queue store
      if (!db.objectStoreNames.contains('syncQueue')) {
        const syncStore = db.createObjectStore('syncQueue', { keyPath: 'id', autoIncrement: true })
        syncStore.createIndex('synced', 'synced', { unique: false })
        syncStore.createIndex('store', 'store', { unique: false })
        syncStore.createIndex('timestamp', 'timestamp', { unique: false })
      }
    }

    request.onsuccess = () => {
      dbInstance = request.result
      resolve(request.result)
    }

    request.onerror = () => reject(request.error)
  })
}

/**
 * Generic CRUD Operations
 */

export async function offlineGet<T>(store: OfflineStore, id: string): Promise<T | null> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const objectStore = tx.objectStore(store)
    const request = objectStore.get(id)
    request.onsuccess = () => {
      const record = request.result as OfflineRecord | undefined
      resolve(record ? (record.data as T) : null)
    }
    request.onerror = () => reject(request.error)
  })
}

export async function offlineGetAll<T>(store: OfflineStore): Promise<T[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readonly')
    const objectStore = tx.objectStore(store)
    const request = objectStore.getAll()
    request.onsuccess = () => {
      const records = (request.result as OfflineRecord[]) || []
      resolve(records.map((r) => r.data as T))
    }
    request.onerror = () => reject(request.error)
  })
}

export async function offlinePut<T extends { id: string }>(
  store: OfflineStore,
  data: T,
  isLocal = false
): Promise<void> {
  const db = await openDB()
  const record: OfflineRecord = {
    id: data.id,
    data,
    store,
    lastModified: Date.now(),
    isLocal,
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const objectStore = tx.objectStore(store)
    const request = objectStore.put(record)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function offlineDelete(store: OfflineStore, id: string): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction(store, 'readwrite')
    const objectStore = tx.objectStore(store)
    const request = objectStore.delete(id)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

/**
 * Bulk sync: replace all records in a store
 */
export async function offlineBulkSync<T extends { id: string }>(
  store: OfflineStore,
  data: T[]
): Promise<void> {
  const db = await openDB()
  const tx = db.transaction(store, 'readwrite')
  const objectStore = tx.objectStore(store)

  // Clear existing non-local records
  return new Promise((resolve, reject) => {
    const getAllRequest = objectStore.getAll()
    getAllRequest.onsuccess = () => {
      const existing = (getAllRequest.result as OfflineRecord[]) || []
      const deletePromises: Promise<void>[] = []

      existing.forEach((record) => {
        if (!record.isLocal) {
          const delTx = db.transaction(store, 'readwrite')
          const delStore = delTx.objectStore(store)
          delStore.delete(record.id)
        }
      })

      // Add all new records
      data.forEach((item) => {
        const record: OfflineRecord = {
          id: item.id,
          data: item,
          store,
          lastModified: Date.now(),
          isLocal: false,
        }
        objectStore.put(record)
      })

      resolve()
    }
    getAllRequest.onerror = () => reject(getAllRequest.error)
  })
}

/**
 * Sync Queue Operations
 */

export async function addToSyncQueue(
  store: OfflineStore,
  action: 'create' | 'update' | 'delete',
  recordId: string,
  data: unknown
): Promise<void> {
  const db = await openDB()
  const item: Omit<SyncQueueItem, 'id'> = {
    store,
    action,
    data,
    recordId,
    timestamp: Date.now(),
    synced: false,
  }

  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite')
    const objectStore = tx.objectStore('syncQueue')
    const request = objectStore.add(item)
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function getSyncQueue(): Promise<SyncQueueItem[]> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readonly')
    const objectStore = tx.objectStore('syncQueue')
    const index = objectStore.index('synced')
    const request = index.getAll(IDBKeyRange.only(0)) // 0 = false
    request.onsuccess = () => resolve(request.result || [])
    request.onerror = () => reject(request.error)
  })
}

export async function getPendingCount(): Promise<number> {
  const queue = await getSyncQueue()
  return queue.length
}

export async function clearSyncQueue(): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite')
    const objectStore = tx.objectStore('syncQueue')
    const request = objectStore.clear()
    request.onsuccess = () => resolve()
    request.onerror = () => reject(request.error)
  })
}

export async function markSynced(id: number): Promise<void> {
  const db = await openDB()
  return new Promise((resolve, reject) => {
    const tx = db.transaction('syncQueue', 'readwrite')
    const objectStore = tx.objectStore('syncQueue')
    const getRequest = objectStore.get(id)
    getRequest.onsuccess = () => {
      const item = getRequest.result
      if (item) {
        item.synced = true
        const putRequest = objectStore.put(item)
        putRequest.onsuccess = () => resolve()
        putRequest.onerror = () => reject(putRequest.error)
      } else {
        resolve()
      }
    }
    getRequest.onerror = () => reject(getRequest.error)
  })
}

/**
 * Conflict Resolution: Last-Write-Wins with Timestamp
 * Compares local record with server record and keeps the most recent
 */
export async function resolveConflict<T extends { id: string; updatedAt?: string | number }>(
  store: OfflineStore,
  serverData: T,
  localData: T
): Promise<T> {
  const serverTimestamp = typeof serverData.updatedAt === 'string'
    ? new Date(serverData.updatedAt).getTime()
    : (serverData.updatedAt as number) || 0

  const localTimestamp = typeof localData.updatedAt === 'string'
    ? new Date(localData.updatedAt).getTime()
    : (localData.updatedAt as number) || 0

  // Last-write-wins
  const winner = serverTimestamp >= localTimestamp ? serverData : localData

  // Update the offline store with the winner
  await offlinePut(store, winner, false)

  return winner
}

/**
 * Clear all offline data
 */
export async function clearAllOfflineData(): Promise<void> {
  const db = await openDB()
  const stores: OfflineStore[] = ['patients', 'appointments', 'consultations', 'labRequests', 'medications']

  for (const store of stores) {
    await new Promise<void>((resolve, reject) => {
      const tx = db.transaction(store, 'readwrite')
      const objectStore = tx.objectStore(store)
      const request = objectStore.clear()
      request.onsuccess = () => resolve()
      request.onerror = () => reject(request.error)
    })
  }

  await clearSyncQueue()
}
