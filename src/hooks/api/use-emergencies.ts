// HealthFlow Africa - Emergencies API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type EmergencyCase } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const emergencyKeys = {
  all: ['emergencies'] as const,
  lists: () => [...emergencyKeys.all, 'list'] as const,
  detail: (id: string) => [...emergencyKeys.all, 'detail', id] as const,
}

export function useEmergencies(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { emergencies } = useDataStore()

  const query = useQuery({
    queryKey: [...emergencyKeys.lists(), params],
    queryFn: () => apiClient.get<EmergencyCase[]>('/api/emergencies', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? emergencies : (query.data?.data || emergencies),
  }
}

export function useCreateEmergency() {
  const queryClient = useQueryClient()
  const { addEmergency } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<EmergencyCase, 'id'>) => {
      const newCase: EmergencyCase = { ...data, id: `URG-${Date.now()}` }
      addEmergency(newCase)
      return apiClient.post<EmergencyCase>('/api/emergencies', newCase)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyKeys.all })
      toast({ title: 'Cas d\'urgence enregistré' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateEmergency() {
  const queryClient = useQueryClient()
  const { updateEmergency } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<EmergencyCase> }) => {
      updateEmergency(id, data)
      return apiClient.put(`/api/emergencies/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyKeys.all })
      toast({ title: 'Cas mis à jour' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useTakeCharge() {
  const queryClient = useQueryClient()
  const { takeCharge } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, doctor }: { id: string; doctor: string }) => {
      takeCharge(id, doctor)
      return apiClient.put(`/api/emergencies/${id}`, { status: 'Pris en charge', doctor })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: emergencyKeys.all })
      toast({ title: 'Pris en charge' })
    },
  })
}
