// HealthFlow Africa - Maternity API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type Pregnancy } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const maternityKeys = {
  all: ['maternity'] as const,
  lists: () => [...maternityKeys.all, 'list'] as const,
  detail: (id: string) => [...maternityKeys.all, 'detail', id] as const,
}

export function usePregnancies(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { pregnancies } = useDataStore()

  const query = useQuery({
    queryKey: [...maternityKeys.lists(), params],
    queryFn: () => apiClient.get<Pregnancy[]>('/api/maternity', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? pregnancies : (query.data?.data || pregnancies),
  }
}

export function useCreatePregnancy() {
  const queryClient = useQueryClient()
  const { addPregnancy } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<Pregnancy, 'id'>) => {
      const newPreg: Pregnancy = { ...data, id: `MAT-${Date.now()}` }
      addPregnancy(newPreg)
      return apiClient.post<Pregnancy>('/api/maternity', newPreg)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maternityKeys.all })
      toast({ title: 'Grossesse enregistrée' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useAddPregnancyVisit() {
  const queryClient = useQueryClient()
  const { addPregnancyVisit } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, visit }: { id: string; visit: Pregnancy['visits'][0] }) => {
      addPregnancyVisit(id, visit)
      return apiClient.post(`/api/maternity/${id}/visits`, visit)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: maternityKeys.all })
      toast({ title: 'Visite prénatale ajoutée' })
    },
  })
}
