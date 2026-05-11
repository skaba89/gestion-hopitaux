'use client'

import { useCallback, useSyncExternalStore } from 'react'

export interface OnlineStatus {
  isOnline: boolean
  isSyncing: boolean
}

// ── Online status via external store ──

function getOnlineSnapshot(): boolean {
  if (typeof window === 'undefined') return true
  return navigator.onLine
}

function getServerOnlineSnapshot(): boolean {
  return true
}

function subscribeToOnline(callback: () => void): () => void {
  window.addEventListener('online', callback)
  window.addEventListener('offline', callback)
  return () => {
    window.removeEventListener('online', callback)
    window.removeEventListener('offline', callback)
  }
}

// ── Syncing status via external store ──

let syncingListeners = new Set<() => void>()
let isCurrentlySyncing = false
let syncingTimeout: ReturnType<typeof setTimeout> | null = null

function notifySyncingListeners() {
  syncingListeners.forEach((l) => l())
}

function getSyncingSnapshot(): boolean {
  return isCurrentlySyncing
}

function getServerSyncingSnapshot(): boolean {
  return false
}

function subscribeToSyncing(callback: () => void): () => void {
  syncingListeners.add(callback)
  return () => syncingListeners.delete(callback)
}

// Listen for online/offline events to manage syncing state
if (typeof window !== 'undefined') {
  window.addEventListener('online', () => {
    isCurrentlySyncing = true
    notifySyncingListeners()
    if (syncingTimeout) clearTimeout(syncingTimeout)
    syncingTimeout = setTimeout(() => {
      isCurrentlySyncing = false
      notifySyncingListeners()
    }, 3000)
  })
  window.addEventListener('offline', () => {
    isCurrentlySyncing = false
    if (syncingTimeout) clearTimeout(syncingTimeout)
    notifySyncingListeners()
  })
}

/**
 * Hook for detecting online/offline status
 */
export function useOnlineStatus(): OnlineStatus {
  const isOnline = useSyncExternalStore(subscribeToOnline, getOnlineSnapshot, getServerOnlineSnapshot)
  const isSyncing = useSyncExternalStore(subscribeToSyncing, getSyncingSnapshot, getServerSyncingSnapshot)
  return { isOnline, isSyncing }
}

/**
 * Hook that returns a callback to run different logic based on online status
 */
export function useOfflineAction() {
  const { isOnline } = useOnlineStatus()

  const execute = useCallback(
    async <T>(
      onlineAction: () => Promise<T>,
      offlineAction: () => Promise<T>
    ): Promise<T> => {
      if (isOnline) {
        return onlineAction()
      }
      return offlineAction()
    },
    [isOnline]
  )

  return { isOnline, execute }
}
