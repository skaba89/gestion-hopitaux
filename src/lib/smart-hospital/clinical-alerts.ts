export type AlertSeverity = 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL'

export interface ClinicalAlert {
  category: string
  severity: AlertSeverity
  description: string
  recommendation: string
}

export interface VitalSignsInput {
  oxygenSaturation?: number
  temperatureC?: number
  heartRate?: number
  respiratoryRate?: number
}

export function analyzeClinicalAlerts(input: VitalSignsInput): ClinicalAlert[] {
  const alerts: ClinicalAlert[] = []

  if (input.oxygenSaturation !== undefined && input.oxygenSaturation < 90) {
    alerts.push({
      category: 'respiratory',
      severity: 'CRITICAL',
      description: 'Critical oxygen saturation detected.',
      recommendation: 'Immediate clinical evaluation recommended.',
    })
  }

  if (input.temperatureC !== undefined && input.temperatureC > 39) {
    alerts.push({
      category: 'infection-risk',
      severity: 'HIGH',
      description: 'High fever detected.',
      recommendation: 'Clinical monitoring and evaluation recommended.',
    })
  }

  if (input.heartRate !== undefined && input.heartRate > 130) {
    alerts.push({
      category: 'cardiac',
      severity: 'HIGH',
      description: 'Abnormal heart rate detected.',
      recommendation: 'Cardiovascular assessment recommended.',
    })
  }

  if (input.respiratoryRate !== undefined && input.respiratoryRate > 30) {
    alerts.push({
      category: 'respiratory',
      severity: 'HIGH',
      description: 'Elevated respiratory rate detected.',
      recommendation: 'Respiratory monitoring recommended.',
    })
  }

  return alerts
}
