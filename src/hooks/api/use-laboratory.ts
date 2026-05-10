// HealthFlow Africa - Laboratory API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type LabRequest } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const labKeys = {
  all: ['laboratory'] as const,
  lists: () => [...labKeys.all, 'list'] as const,
  detail: (id: string) => [...labKeys.all, 'detail', id] as const,
}

export function useLabRequests(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { labRequests } = useDataStore()

  const query = useQuery({
    queryKey: [...labKeys.lists(), params],
    queryFn: () => apiClient.get<LabRequest[]>('/api/laboratory', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? labRequests : (query.data?.data || labRequests),
  }
}

export function useCreateLabRequest() {
  const queryClient = useQueryClient()
  const { addLabRequest } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<LabRequest, 'id'>) => {
      const newReq: LabRequest = { ...data, id: `LAB-${Date.now()}` }
      addLabRequest(newReq)
      return apiClient.post<LabRequest>('/api/laboratory', newReq)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labKeys.all })
      toast({ title: 'Demande de laboratoire créée' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateLabRequest() {
  const queryClient = useQueryClient()
  const { updateLabRequest } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<LabRequest> }) => {
      updateLabRequest(id, data)
      return apiClient.put(`/api/laboratory/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labKeys.all })
      toast({ title: 'Demande mise à jour' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useValidateLabResult() {
  const queryClient = useQueryClient()
  const { validateLabResult } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      validateLabResult(id)
      return apiClient.put(`/api/laboratory/${id}`, { status: 'Validé' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: labKeys.all })
      toast({ title: 'Résultat validé' })
    },
  })
}
