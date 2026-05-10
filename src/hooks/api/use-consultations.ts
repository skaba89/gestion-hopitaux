// HealthFlow Africa - Consultations API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type Consultation } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const consultationKeys = {
  all: ['consultations'] as const,
  lists: () => [...consultationKeys.all, 'list'] as const,
  detail: (id: string) => [...consultationKeys.all, 'detail', id] as const,
}

export function useConsultations(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { consultations } = useDataStore()

  const query = useQuery({
    queryKey: [...consultationKeys.lists(), params],
    queryFn: () => apiClient.get<Consultation[]>('/api/consultations', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? consultations : (query.data?.data || consultations),
  }
}

export function useConsultation(id: string) {
  return useQuery({
    queryKey: consultationKeys.detail(id),
    queryFn: () => apiClient.get<Consultation>(`/api/consultations/${id}`),
    enabled: !!id,
  })
}

export function useCreateConsultation() {
  const queryClient = useQueryClient()
  const { addConsultation } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<Consultation, 'id'>) => {
      const newCons: Consultation = { ...data, id: `CONS-${Date.now()}` }
      addConsultation(newCons)
      return apiClient.post<Consultation>('/api/consultations', newCons)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.all })
      toast({ title: 'Consultation créée' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateConsultation() {
  const queryClient = useQueryClient()
  const { updateConsultation } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Consultation> }) => {
      updateConsultation(id, data)
      return apiClient.put(`/api/consultations/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: consultationKeys.all })
      toast({ title: 'Consultation modifiée' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}
