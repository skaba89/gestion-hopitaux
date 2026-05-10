// HealthFlow Africa - Patients API Hooks
// React Query hooks for patient CRUD operations

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient, type ApiResponse } from '@/lib/api-client'
import { useDataStore, type Patient } from '@/lib/data-store'
import { useOnlineStatus } from '@/hooks/use-online-status'
import { useToast } from '@/hooks/use-toast'

// Query keys
export const patientKeys = {
  all: ['patients'] as const,
  lists: () => [...patientKeys.all, 'list'] as const,
  list: (filters: Record<string, unknown>) => [...patientKeys.lists(), filters] as const,
  details: () => [...patientKeys.all, 'detail'] as const,
  detail: (id: string) => [...patientKeys.details(), id] as const,
}

interface PatientListParams {
  page?: number
  limit?: number
  search?: string
  gender?: string
  bloodType?: string
  status?: string
}

export function usePatients(params: PatientListParams = {}) {
  const { isOnline } = useOnlineStatus()
  const { patients } = useDataStore()

  const query = useQuery({
    queryKey: patientKeys.list(params),
    queryFn: () => apiClient.get<Patient[]>('/api/patients', params as Record<string, string | number | boolean | undefined>),
    enabled: isOnline,
    placeholderData: (previousData) => previousData,
  })

  // Merge API data with local Zustand data
  const localPatients = patients
  const apiPatients = query.data?.data || []

  // If offline or API hasn't returned yet, use local data
  const data = !isOnline || apiPatients.length === 0 ? localPatients : apiPatients

  return {
    ...query,
    data,
    isLoading: isOnline ? query.isLoading : false,
  }
}

export function usePatient(id: string) {
  const { isOnline } = useOnlineStatus()
  const { patients } = useDataStore()

  const query = useQuery({
    queryKey: patientKeys.detail(id),
    queryFn: () => apiClient.get<Patient>(`/api/patients/${id}`),
    enabled: isOnline && !!id,
  })

  // Fallback to local data
  const localPatient = patients.find((p) => p.id === id)

  return {
    ...query,
    data: query.data?.data || localPatient,
  }
}

export function useCreatePatient() {
  const queryClient = useQueryClient()
  const { addPatient } = useDataStore()
  const { toast } = useToast()
  const { isOnline } = useOnlineStatus()

  return useMutation({
    mutationFn: async (data: Omit<Patient, 'id' | 'qrCode' | 'registrationDate'>) => {
      // Optimistic: add to local store first
      const newPatient: Patient = {
        ...data,
        id: `P-${Date.now()}`,
        qrCode: `QR-${Date.now()}`,
        registrationDate: new Date().toISOString().split('T')[0],
      }
      addPatient(newPatient)

      // Then sync to API if online
      if (isOnline) {
        return apiClient.post<Patient>('/api/patients', newPatient)
      }
      return { success: true, data: newPatient } as ApiResponse<Patient>
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all })
      toast({ title: 'Patient enregistré', description: 'Le patient a été enregistré avec succès.' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || "Impossible d'enregistrer le patient.",
        variant: 'destructive',
      })
    },
  })
}

export function useUpdatePatient() {
  const queryClient = useQueryClient()
  const { updatePatient } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<Patient> }) => {
      // Optimistic update locally
      updatePatient(id, data)

      // Then sync to API
      return apiClient.put<Patient>(`/api/patients/${id}`, data)
    },
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: patientKeys.detail(variables.id) })
      queryClient.invalidateQueries({ queryKey: patientKeys.lists() })
      toast({ title: 'Patient modifié', description: 'Les informations du patient ont été mises à jour.' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || 'Impossible de modifier le patient.',
        variant: 'destructive',
      })
    },
  })
}

export function useDeletePatient() {
  const queryClient = useQueryClient()
  const { archivePatient } = useDataStore()
  const { toast } = useToast()

  return useMutation({
    mutationFn: async (id: string) => {
      archivePatient(id)
      return apiClient.delete(`/api/patients/${id}`)
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: patientKeys.all })
      toast({ title: 'Patient archivé', description: 'Le patient a été archivé.' })
    },
    onError: (error: Error) => {
      toast({
        title: 'Erreur',
        description: error.message || "Impossible d'archiver le patient.",
        variant: 'destructive',
      })
    },
  })
}
