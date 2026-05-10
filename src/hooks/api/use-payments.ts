import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import type { MobileMoneyProvider, TransactionStatus } from '@/lib/data-store'

/* ─────────── Query Keys ─────────── */

const paymentKeys = {
  all: ['payments'] as const,
  transactions: () => [...paymentKeys.all, 'transactions'] as const,
  transaction: (id: string) => [...paymentKeys.all, 'transaction', id] as const,
  dashboard: () => [...paymentKeys.all, 'dashboard'] as const,
}

/* ─────────── Hooks ─────────── */

export function useTransactions() {
  return useQuery({
    queryKey: paymentKeys.transactions(),
    queryFn: async () => {
      // In a real app, fetch from API
      // For demo, data comes from Zustand store directly
      return []
    },
    staleTime: 30000,
  })
}

export function useTransaction(id: string) {
  return useQuery({
    queryKey: paymentKeys.transaction(id),
    queryFn: async () => {
      return null
    },
    enabled: !!id,
  })
}

export function useInitiatePayment() {
  const queryClient = useQueryClient()

  return useMutation({
    mutationFn: async (params: {
      phoneNumber: string
      amount: number
      currency: 'GNF' | 'USD'
      reason: string
      invoiceId: string | null
      patientName: string
      patientId: string
      provider?: MobileMoneyProvider
    }) => {
      const res = await fetch('/api/payments/mobile-money', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(params),
      })
      return res.json()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: paymentKeys.transactions() })
    },
  })
}

export function useCheckPaymentStatus() {
  return useMutation({
    mutationFn: async (params: {
      transactionId: string
      provider: MobileMoneyProvider
    }) => {
      const res = await fetch(`/api/payments/mobile-money?transactionId=${params.transactionId}&provider=${encodeURIComponent(params.provider)}`)
      return res.json() as Promise<{
        success: boolean
        transactionId: string
        status: TransactionStatus
        providerTransactionId: string | null
        completedAt: string | null
        message: string
      }>
    },
  })
}

export function useFinancialDashboard() {
  return useQuery({
    queryKey: paymentKeys.dashboard(),
    queryFn: async () => {
      const res = await fetch('/api/payments/dashboard')
      const data = await res.json()
      return data.stats
    },
    staleTime: 60000,
  })
}
