// HealthFlow Africa - Vaccination API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type VaccineRecord } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const vaccinationKeys = {
  all: ['vaccination'] as const,
  lists: () => [...vaccinationKeys.all, 'list'] as const,
  detail: (id: string) => [...vaccinationKeys.all, 'detail', id] as const,
}

export function useVaccineRecords(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { vaccineRecords } = useDataStore()

  const query = useQuery({
    queryKey: [...vaccinationKeys.lists(), params],
    queryFn: () => apiClient.get<VaccineRecord[]>('/api/vaccinations', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? vaccineRecords : (query.data?.data || vaccineRecords),
  }
}

export function useCreateVaccineRecord() {
  const queryClient = useQueryClient()
  const { addVaccineRecord } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<VaccineRecord, 'id'>) => {
      const newRecord: VaccineRecord = { ...data, id: `VAC-${Date.now()}` }
      addVaccineRecord(newRecord)
      return apiClient.post<VaccineRecord>('/api/vaccinations', newRecord)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.all })
      toast({ title: 'Carnet de vaccination créé' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useAdministerVaccine() {
  const queryClient = useQueryClient()
  const { administerVaccine } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ recordId, vaccineName }: { recordId: string; vaccineName: string }) => {
      administerVaccine(recordId, vaccineName)
      return apiClient.put(`/api/vaccinations/${recordId}`, { action: 'administer', vaccineName })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: vaccinationKeys.all })
      toast({ title: 'Vaccin administré' })
    },
  })
}
