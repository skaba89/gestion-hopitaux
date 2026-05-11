'use client'

import React from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Wifi, WifiOff, RefreshCw, CloudOff } from 'lucide-react'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { Badge } from '@/components/ui/badge'

export function NetworkStatus() {
  const { isOnline, isSyncing } = useOnlineStatus()
  const [pendingCount, setPendingCount] = React.useState(0)

  // Check pending sync items periodically
  React.useEffect(() => {
    if (!isOnline) {
      // Show a count of pending items when offline
      const checkPending = async () => {
        try {
          const { getPendingCount } = await import('@/lib/offline-db')
          const count = await getPendingCount()
          setPendingCount(count)
        } catch {
          setPendingCount(0)
        }
      }
      checkPending()
      const interval = setInterval(checkPending, 10000)
      return () => clearInterval(interval)
    } else {
      setPendingCount(0)
    }
  }, [isOnline])

  return (
    <AnimatePresence mode="wait">
      {!isOnline ? (
        <motion.div
          key="offline"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex items-center gap-1.5"
        >
          <Badge
            variant="outline"
            className="bg-red-50 dark:bg-red-950/30 text-red-700 dark:text-red-400 border-red-200 dark:border-red-800 gap-1 px-2 py-0.5 text-xs"
          >
            <span className="relative flex h-2 w-2">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
              <span className="relative inline-flex rounded-full h-2 w-2 bg-red-500" />
            </span>
            <WifiOff className="h-3 w-3" />
            Hors ligne
            {pendingCount > 0 && (
              <span className="ml-0.5 bg-red-200 dark:bg-red-900 text-red-800 dark:text-red-300 rounded-full px-1 text-[10px] font-bold">
                {pendingCount}
              </span>
            )}
          </Badge>
        </motion.div>
      ) : isSyncing ? (
        <motion.div
          key="syncing"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex items-center gap-1.5"
        >
          <Badge
            variant="outline"
            className="bg-amber-50 dark:bg-amber-950/30 text-amber-700 dark:text-amber-400 border-amber-200 dark:border-amber-800 gap-1 px-2 py-0.5 text-xs"
          >
            <RefreshCw className="h-3 w-3 animate-spin" />
            Synchronisation...
          </Badge>
        </motion.div>
      ) : (
        <motion.div
          key="online"
          initial={{ opacity: 0, x: 10 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -10 }}
          className="flex items-center gap-1.5"
        >
          <span className="relative flex h-2 w-2" title="En ligne">
            <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  )
}
