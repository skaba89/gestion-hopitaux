// HealthFlow Africa - Billing API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type Invoice } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const billingKeys = {
  all: ['billing'] as const,
  lists: () => [...billingKeys.all, 'list'] as const,
  detail: (id: string) => [...billingKeys.all, 'detail', id] as const,
}

export function useInvoices(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { invoices } = useDataStore()

  const query = useQuery({
    queryKey: [...billingKeys.lists(), params],
    queryFn: () => apiClient.get<Invoice[]>('/api/billing', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? invoices : (query.data?.data || invoices),
  }
}

export function useCreateInvoice() {
  const queryClient = useQueryClient()
  const { addInvoice } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<Invoice, 'id'>) => {
      const newInv: Invoice = { ...data, id: `FAC-${Date.now()}` }
      addInvoice(newInv)
      return apiClient.post<Invoice>('/api/billing', newInv)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
      toast({ title: 'Facture créée' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function usePayInvoice() {
  const queryClient = useQueryClient()
  const { payInvoice } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, method, amount }: { id: string; method: string; amount: number }) => {
      payInvoice(id, method, amount)
      return apiClient.put(`/api/billing/${id}`, { action: 'pay', method, amount })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
      toast({ title: 'Paiement enregistré' })
    },
  })
}

export function useUpdateInvoice() {
  const queryClient = useQueryClient()
  const { updateInvoice } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Invoice> }) => {
      updateInvoice(id, data)
      return apiClient.put(`/api/billing/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: billingKeys.all })
      toast({ title: 'Facture modifiée' })
    },
  })
}
