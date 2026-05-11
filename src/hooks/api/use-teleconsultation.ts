// HealthFlow Africa - Teleconsultation API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type TeleconsultSession } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const teleconsultKeys = {
  all: ['teleconsultation'] as const,
  lists: () => [...teleconsultKeys.all, 'list'] as const,
  detail: (id: string) => [...teleconsultKeys.all, 'detail', id] as const,
}

export function useTeleconsultations(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { teleconsults } = useDataStore()

  const query = useQuery({
    queryKey: [...teleconsultKeys.lists(), params],
    queryFn: () => apiClient.get<TeleconsultSession[]>('/api/teleconsultation', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? teleconsults : (query.data?.data || teleconsults),
  }
}

export function useCreateTeleconsultation() {
  const queryClient = useQueryClient()
  const { addTeleconsult } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<TeleconsultSession, 'id'>) => {
      const newSession: TeleconsultSession = { ...data, id: `TEL-${Date.now()}` }
      addTeleconsult(newSession)
      return apiClient.post<TeleconsultSession>('/api/teleconsultation', newSession)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teleconsultKeys.all })
      toast({ title: 'Session de téléconsultation créée' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateTeleconsultation() {
  const queryClient = useQueryClient()
  const { updateTeleconsult } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<TeleconsultSession> }) => {
      updateTeleconsult(id, data)
      return apiClient.put(`/api/teleconsultation/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: teleconsultKeys.all })
      toast({ title: 'Session mise à jour' })
    },
  })
}
