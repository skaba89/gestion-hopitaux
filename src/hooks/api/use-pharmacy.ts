// HealthFlow Africa - Pharmacy API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type Medication } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const pharmacyKeys = {
  all: ['pharmacy'] as const,
  lists: () => [...pharmacyKeys.all, 'list'] as const,
  detail: (id: string) => [...pharmacyKeys.all, 'detail', id] as const,
}

export function useMedications(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { medications } = useDataStore()

  const query = useQuery({
    queryKey: [...pharmacyKeys.lists(), params],
    queryFn: () => apiClient.get<Medication[]>('/api/pharmacy', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? medications : (query.data?.data || medications),
  }
}

export function useCreateMedication() {
  const queryClient = useQueryClient()
  const { addMedication } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<Medication, 'id'>) => {
      const newMed: Medication = { ...data, id: `MED-${Date.now()}` }
      addMedication(newMed)
      return apiClient.post<Medication>('/api/pharmacy', newMed)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.all })
      toast({ title: 'Médicament ajouté' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateMedication() {
  const queryClient = useQueryClient()
  const { updateMedication } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Medication> }) => {
      updateMedication(id, data)
      return apiClient.put(`/api/pharmacy/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.all })
      toast({ title: 'Médicament modifié' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useStockEntry() {
  const queryClient = useQueryClient()
  const { stockEntry } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      stockEntry(id, quantity)
      return apiClient.put(`/api/pharmacy/${id}`, { action: 'stockEntry', quantity })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.all })
      toast({ title: 'Entrée de stock enregistrée' })
    },
  })
}

export function useStockExit() {
  const queryClient = useQueryClient()
  const { stockExit } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, quantity }: { id: string; quantity: number }) => {
      stockExit(id, quantity)
      return apiClient.put(`/api/pharmacy/${id}`, { action: 'stockExit', quantity })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.all })
      toast({ title: 'Sortie de stock enregistrée' })
    },
  })
}
