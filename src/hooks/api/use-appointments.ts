// HealthFlow Africa - Appointments API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type Appointment } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

export const appointmentKeys = {
  all: ['appointments'] as const,
  lists: () => [...appointmentKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...appointmentKeys.lists(), filters] as const,
  detail: (id: string) => [...appointmentKeys.all, 'detail', id] as const,
}

export function useAppointments(params: Record<string, unknown> = {}) {
  const { isOnline } = useOnlineStatus()
  const { appointments } = useDataStore()

  const query = useQuery({
    queryKey: appointmentKeys.list(params),
    queryFn: () => apiClient.get<Appointment[]>('/api/appointments', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: !isOnline ? appointments : (query.data?.data || appointments),
  }
}

export function useCreateAppointment() {
  const queryClient = useQueryClient()
  const { addAppointment } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (data: Omit<Appointment, 'id'>) => {
      const newAppt: Appointment = { ...data, id: `RDV-${Date.now()}` }
      addAppointment(newAppt)
      return apiClient.post<Appointment>('/api/appointments', newAppt)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      toast({ title: 'Rendez-vous créé' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useUpdateAppointment() {
  const queryClient = useQueryClient()
  const { updateAppointment } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Appointment> }) => {
      updateAppointment(id, data)
      return apiClient.put<Appointment>(`/api/appointments/${id}`, data)
    },
    onSuccess: (_d, vars) => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.detail(vars.id) })
      queryClient.invalidateQueries({ queryKey: appointmentKeys.lists() })
      toast({ title: 'Rendez-vous modifié' })
    },
    onError: (error: Error) => {
      toast({ title: 'Erreur', description: error.message, variant: 'destructive' })
    },
  })
}

export function useConfirmAppointment() {
  const queryClient = useQueryClient()
  const { confirmAppointment } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      confirmAppointment(id)
      return apiClient.put(`/api/appointments/${id}`, { status: 'Confirmé' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      toast({ title: 'Rendez-vous confirmé' })
    },
  })
}

export function useCancelAppointment() {
  const queryClient = useQueryClient()
  const { cancelAppointment } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      cancelAppointment(id)
      return apiClient.put(`/api/appointments/${id}`, { status: 'Annulé' })
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: appointmentKeys.all })
      toast({ title: 'Rendez-vous annulé' })
    },
  })
}
