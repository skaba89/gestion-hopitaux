export interface RegionalHealthSnapshot {
  region: string
  hospitals: number
  totalBeds: number
  occupiedBeds: number
  consultationsToday: number
  emergencyPatients: number
  criticalAlerts: number
  vaccinationCoverage: number
  stockoutFacilities: number
}

export interface MinistryRegionKpi {
  region: string
  occupancyRate: number
  consultationsToday: number
  emergencyPatients: number
  criticalAlerts: number
  vaccinationCoverage: number
  stockoutFacilities: number
  status: 'GOOD' | 'WARNING' | 'CRITICAL'
  priority: string
}

export interface MinistryDashboardSummary {
  nationalHealthScore: number
  totalHospitals: number
  totalBeds: number
  occupancyRate: number
  consultationsToday: number
  emergencyPatients: number
  criticalAlerts: number
  regions: MinistryRegionKpi[]
  nationalPriorities: string[]
}

function regionStatus(input: RegionalHealthSnapshot, occupancyRate: number): MinistryRegionKpi['status'] {
  if (occupancyRate >= 95 || input.criticalAlerts >= 5 || input.stockoutFacilities >= 3) return 'CRITICAL'
  if (occupancyRate >= 85 || input.criticalAlerts >= 2 || input.stockoutFacilities >= 1) return 'WARNING'
  return 'GOOD'
}

function priorityFromStatus(status: MinistryRegionKpi['status'], region: string): string {
  if (status === 'CRITICAL') return `Intervention prioritaire requise dans la région ${region}.`
  if (status === 'WARNING') return `Surveillance renforcée recommandée dans la région ${region}.`
  return `Situation maîtrisée dans la région ${region}.`
}

export function buildMinistryDashboard(snapshots: RegionalHealthSnapshot[]): MinistryDashboardSummary {
  const totalHospitals = snapshots.reduce((sum, item) => sum + item.hospitals, 0)
  const totalBeds = snapshots.reduce((sum, item) => sum + item.totalBeds, 0)
  const occupiedBeds = snapshots.reduce((sum, item) => sum + item.occupiedBeds, 0)
  const consultationsToday = snapshots.reduce((sum, item) => sum + item.consultationsToday, 0)
  const emergencyPatients = snapshots.reduce((sum, item) => sum + item.emergencyPatients, 0)
  const criticalAlerts = snapshots.reduce((sum, item) => sum + item.criticalAlerts, 0)
  const stockoutFacilities = snapshots.reduce((sum, item) => sum + item.stockoutFacilities, 0)
  const occupancyRate = Math.round((occupiedBeds / Math.max(totalBeds, 1)) * 100)

  const regions = snapshots.map(item => {
    const regionalOccupancy = Math.round((item.occupiedBeds / Math.max(item.totalBeds, 1)) * 100)
    const status = regionStatus(item, regionalOccupancy)

    return {
      region: item.region,
      occupancyRate: regionalOccupancy,
      consultationsToday: item.consultationsToday,
      emergencyPatients: item.emergencyPatients,
      criticalAlerts: item.criticalAlerts,
      vaccinationCoverage: item.vaccinationCoverage,
      stockoutFacilities: item.stockoutFacilities,
      status,
      priority: priorityFromStatus(status, item.region),
    }
  }).sort((a, b) => {
    const order = { CRITICAL: 3, WARNING: 2, GOOD: 1 }
    return order[b.status] - order[a.status] || b.occupancyRate - a.occupancyRate
  })

  const criticalRegions = regions.filter(item => item.status === 'CRITICAL').length
  const warningRegions = regions.filter(item => item.status === 'WARNING').length
  const nationalHealthScore = Math.max(0, 100 - criticalRegions * 18 - warningRegions * 7 - Math.min(stockoutFacilities * 2, 15))

  const nationalPriorities = regions
    .filter(item => item.status !== 'GOOD')
    .map(item => item.priority)

  if (nationalPriorities.length === 0) {
    nationalPriorities.push('Situation nationale maîtrisée. Maintenir la surveillance standard.')
  }

  return {
    nationalHealthScore,
    totalHospitals,
    totalBeds,
    occupancyRate,
    consultationsToday,
    emergencyPatients,
    criticalAlerts,
    regions,
    nationalPriorities,
  }
}
