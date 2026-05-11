// HealthFlow Africa - Hospitalization API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type BedUnit } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const hospitalizationKeys = {
  all: ['hospitalization'] as const,
  lists: () => [...hospitalizationKeys.all, 'list'] as const,
  detail: (id: string) => [...hospitalizationKeys.all, 'detail', id] as const,
}

export function useBeds(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { beds } = useDataStore()

  const query = useQuery({
    queryKey: [...hospitalizationKeys.lists(), params],
    queryFn: () => apiClient.get<BedUnit[]>('/api/hospitalizations', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? beds : (query.data?.data || beds),
  }
}

export function useUpdateBed() {
  const queryClient = useQueryClient()
  const { updateBed } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<BedUnit> }) => {
      updateBed(id, data)
      return apiClient.put(`/api/hospitalizations/${id}`, data)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalizationKeys.all })
      toast({ title: 'Lit mis à jour' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useAdmitPatient() {
  const queryClient = useQueryClient()
  const { admitPatient } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ bedId, patientName, patientId }: { bedId: string; patientName: string; patientId: string }) => {
      admitPatient(bedId, patientName, patientId)
      return apiClient.put(`/api/hospitalizations/${bedId}`, { action: 'admit', patientName, patientId })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalizationKeys.all })
      toast({ title: 'Patient admis' })
    },
  })
}

export function useDischargeBed() {
  const queryClient = useQueryClient()
  const { dischargeBed } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (bedId: string) => {
      dischargeBed(bedId)
      return apiClient.put(`/api/hospitalizations/${bedId}`, { action: 'discharge' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: hospitalizationKeys.all })
      toast({ title: 'Patient libéré' })
    },
  })
}
