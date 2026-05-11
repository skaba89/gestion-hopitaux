'use client'

import React from 'react'
import { motion } from 'framer-motion'
import type { TransactionStatus } from '@/lib/data-store'

const statusConfig: Record<TransactionStatus, { label: string; color: string; pulse: boolean }> = {
  'En attente': { label: 'En attente', color: 'bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-950/40 dark:text-amber-300 dark:border-amber-800', pulse: false },
  'En cours': { label: 'En cours', color: 'bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950/40 dark:text-blue-300 dark:border-blue-800', pulse: true },
  'Réussi': { label: 'Réussi', color: 'bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-950/40 dark:text-emerald-300 dark:border-emerald-800', pulse: false },
  'Échoué': { label: 'Échoué', color: 'bg-red-50 text-red-700 border-red-200 dark:bg-red-950/40 dark:text-red-300 dark:border-red-800', pulse: false },
  'Remboursé': { label: 'Remboursé', color: 'bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-950/40 dark:text-purple-300 dark:border-purple-800', pulse: false },
}

interface PaymentStatusBadgeProps {
  status: TransactionStatus
  className?: string
}

export function PaymentStatusBadge({ status, className = '' }: PaymentStatusBadgeProps) {
  const config = statusConfig[status]

  return (
    <span className={`inline-flex items-center gap-1.5 rounded-md border px-2 py-0.5 text-xs font-medium ${config.color} ${className}`}>
      {config.pulse && (
        <motion.span
          animate={{ opacity: [1, 0.3, 1] }}
          transition={{ duration: 1.5, repeat: Infinity }}
          className="size-1.5 rounded-full bg-current"
        />
      )}
      {!config.pulse && (
        <span className={`size-1.5 rounded-full ${
          status === 'Réussi' ? 'bg-emerald-500' :
          status === 'Échoué' ? 'bg-red-500' :
          status === 'Remboursé' ? 'bg-purple-500' :
          'bg-amber-500'
        }`} />
      )}
      {config.label}
    </span>
  )
}
