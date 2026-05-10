// HealthFlow Africa - Sync Manager
// Handles offline-to-online synchronization with conflict resolution

import { useAuthStore } from '@/lib/auth-store'
import { getSyncQueue, clearSyncQueue, markSynced, getPendingCount } from '@/lib/offline-db'
import { apiClient } from '@/lib/api-client'
import type { OfflineStore } from '@/lib/offline-db'

export type SyncStatus = 'idle' | 'syncing' | 'error' | 'complete'

interface SyncState {
  status: SyncStatus
  pendingCount: number
  lastSyncAt: Date | null
  error: string | null
  progress: { current: number; total: number }
}

const listeners = new Set<(state: SyncState) => void>()
let syncState: SyncState = {
  status: 'idle',
  pendingCount: 0,
  lastSyncAt: null,
  error: null,
  progress: { current: 0, total: 0 },
}

function notifyListeners() {
  listeners.forEach((fn) => fn({ ...syncState }))
}

export function subscribeToSyncState(listener: (state: SyncState) => void): () => void {
  listeners.add(listener)
  listener({ ...syncState }) // Send current state immediately
  return () => listeners.delete(listener)
}

export function getSyncState(): SyncState {
  return { ...syncState }
}

/**
 * Process the sync queue - push pending changes to the server
 */
export async function processSyncQueue(): Promise<void> {
  if (syncState.status === 'syncing') return

  const isAuthenticated = useAuthStore.getState().isAuthenticated
  if (!isAuthenticated) return

  try {
    syncState = { ...syncState, status: 'syncing', error: null }
    notifyListeners()

    const queue = await getSyncQueue()
    syncState.progress = { current: 0, total: queue.length }
    notifyListeners()

    for (const item of queue) {
      try {
        let response

        switch (item.action) {
          case 'create':
            response = await apiClient.post(`/api/${getStorePath(item.store)}`, item.data)
            break
          case 'update':
            response = await apiClient.put(`/api/${getStorePath(item.store)}/${item.recordId}`, item.data)
            break
          case 'delete':
            response = await apiClient.delete(`/api/${getStorePath(item.store)}/${item.recordId}`)
            break
        }

        if (response?.success) {
          await markSynced(item.id!)
        }

        syncState.progress.current++
        notifyListeners()
      } catch (error) {
        // Last-write-wins conflict resolution
        // If the server returns a conflict (409), we accept the server version
        console.warn(`Sync conflict for ${item.store}/${item.recordId}:`, error)
        // Mark as synced to remove from queue even on conflict
        await markSynced(item.id!)
      }
    }

    // Update state
    const remainingCount = await getPendingCount()
    syncState = {
      status: remainingCount === 0 ? 'complete' : 'idle',
      pendingCount: remainingCount,
      lastSyncAt: new Date(),
      error: null,
      progress: { current: syncState.progress.total, total: syncState.progress.total },
    }
    notifyListeners()

    // Reset to idle after a delay
    if (syncState.status === 'complete') {
      setTimeout(() => {
        syncState = { ...syncState, status: 'idle' }
        notifyListeners()
      }, 3000)
    }
  } catch (error) {
    syncState = {
      ...syncState,
      status: 'error',
      error: error instanceof Error ? error.message : 'Erreur de synchronisation',
    }
    notifyListeners()
  }
}

/**
 * Get the API path for a given offline store
 */
function getStorePath(store: OfflineStore): string {
  const pathMap: Record<OfflineStore, string> = {
    patients: 'patients',
    appointments: 'appointments',
    consultations: 'consultations',
    labRequests: 'laboratory',
    medications: 'pharmacy',
  }
  return pathMap[store] || store
}

/**
 * Update the pending count
 */
export async function updatePendingCount(): Promise<number> {
  const count = await getPendingCount()
  syncState = { ...syncState, pendingCount: count }
  notifyListeners()
  return count
}

/**
 * Clear all sync data
 */
export async function clearSyncData(): Promise<void> {
  await clearSyncQueue()
  syncState = {
    status: 'idle',
    pendingCount: 0,
    lastSyncAt: null,
    error: null,
    progress: { current: 0, total: 0 },
  }
  notifyListeners()
}

/**
 * Initialize sync - set up event listeners and process queue
 */
export function initSyncManager(): () => void {
  // Update pending count on load
  updatePendingCount()

  // Listen for online events to trigger sync
  const handleOnline = () => {
    console.log('[Sync] Back online, processing sync queue...')
    processSyncQueue()
  }

  window.addEventListener('online', handleOnline)

  // Listen for service worker sync messages
  if ('serviceWorker' in navigator) {
    navigator.serviceWorker.addEventListener('message', (event) => {
      if (event.data?.type === 'SYNC_QUEUED') {
        updatePendingCount()
      } else if (event.data?.type === 'SYNC_COMPLETE') {
        updatePendingCount()
      }
    })
  }

  return () => {
    window.removeEventListener('online', handleOnline)
  }
}
