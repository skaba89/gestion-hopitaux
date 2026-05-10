// HealthFlow Africa - Dashboard API Hooks

import { useQuery } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useOnlineStatus } from '@/hooks/use-online-status'

export const dashboardKeys = {
  all: ['dashboard'] as const,
  stats: () => [...dashboardKeys.all, 'stats'] as const,
  trends: () => [...dashboardKeys.all, 'trends'] as const,
}

interface DashboardStats {
  totalPatients: number
  appointmentsToday: number
  bedsOccupied: number
  pendingLabResults: number
  revenue: number
  activeEmergencies: number
  stockAlerts: number
}

export function useDashboardStats() {
  const { isOnline } = useOnlineStatus()

  return useQuery({
    queryKey: dashboardKeys.stats(),
    queryFn: () => apiClient.get<DashboardStats>('/api/dashboard'),
    enabled: isOnline,
    staleTime: 30 * 1000, // 30 seconds
  })
}

export function useDashboardTrends() {
  const { isOnline } = useOnlineStatus()

  return useQuery({
    queryKey: dashboardKeys.trends(),
    queryFn: () => apiClient.get<Record<string, unknown>>('/api/dashboard', { type: 'trends' }),
    enabled: isOnline,
    staleTime: 5 * 60 * 1000, // 5 minutes
  })
}
