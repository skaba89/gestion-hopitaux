// HealthFlow Africa - Notifications API Hooks

import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { apiClient } from '@/lib/api-client'
import { useDataStore, type Notification } from '@/lib/data-store'
import { useToast } from '@/hooks/use-toast'

export const notificationKeys = {
  all: ['notifications'] as const,
  lists: () => [...notificationKeys.all, 'list'] as const,
}

export function useNotifications() {
  const { notifications } = useDataStore()

  const query = useQuery({
    queryKey: notificationKeys.lists(),
    queryFn: () => apiClient.get<Notification[]>('/api/alerts'),
    placeholderData: (previousData) => previousData,
  })

  return {
    ...query,
    data: query.data?.data || notifications,
  }
}

export function useMarkNotificationRead() {
  const queryClient = useQueryClient()
  const { markNotificationRead } = useDataStore()

  return useMutation({
    mutationFn: async (id: string) => {
      markNotificationRead(id)
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}

export function useMarkAllNotificationsRead() {
  const queryClient = useQueryClient()
  const { markAllNotificationsRead } = useDataStore()

  return useMutation({
    mutationFn: async () => {
      markAllNotificationsRead()
      return Promise.resolve()
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: notificationKeys.all })
    },
  })
}
