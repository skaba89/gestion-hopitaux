export type NotificationSeverity = 'INFO' | 'WARNING' | 'CRITICAL'

export interface LiveNotification {
  id: string
  title: string
  message: string
  severity: NotificationSeverity
  createdAt: string
  source: string
}

export function generateExecutiveNotifications(): LiveNotification[] {
  return [
    {
      id: 'notif-1',
      title: 'Saturation urgences',
      message: 'Le service des urgences du CHU Donka dépasse 95% de capacité.',
      severity: 'CRITICAL',
      createdAt: new Date().toISOString(),
      source: 'Emergency Monitoring',
    },
    {
      id: 'notif-2',
      title: 'Rupture pharmacie',
      message: 'Médicament critique indisponible dans 2 établissements.',
      severity: 'WARNING',
      createdAt: new Date().toISOString(),
      source: 'Pharmacy Monitoring',
    },
    {
      id: 'notif-3',
      title: 'Activité nationale',
      message: 'Les consultations nationales augmentent de 12% aujourd’hui.',
      severity: 'INFO',
      createdAt: new Date().toISOString(),
      source: 'National Analytics',
    },
  ]
}
