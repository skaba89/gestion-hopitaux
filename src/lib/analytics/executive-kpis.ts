export interface HospitalActivitySnapshot {
  admissionsToday: number
  consultationsToday: number
  dischargesToday: number
  emergencyPatients: number
  criticalIncidents: number
  totalBeds: number
  occupiedBeds: number
  availableDoctors: number
  availableNurses: number
  pharmacyStockouts: number
  labPendingResults: number
  revenueToday: number
  averageWaitingMinutes: number
}

export interface ExecutiveKpi {
  key: string
  label: string
  value: number | string
  unit?: string
  status: 'GOOD' | 'WARNING' | 'CRITICAL'
  description: string
}

export interface ExecutiveDashboardSummary {
  healthScore: number
  globalStatus: 'GOOD' | 'WARNING' | 'CRITICAL'
  kpis: ExecutiveKpi[]
  priorities: string[]
}

function statusFromThreshold(value: number, warning: number, critical: number, higherIsWorse = true): ExecutiveKpi['status'] {
  if (higherIsWorse) {
    if (value >= critical) return 'CRITICAL'
    if (value >= warning) return 'WARNING'
    return 'GOOD'
  }

  if (value <= critical) return 'CRITICAL'
  if (value <= warning) return 'WARNING'
  return 'GOOD'
}

export function buildExecutiveDashboard(snapshot: HospitalActivitySnapshot): ExecutiveDashboardSummary {
  const bedOccupancyRate = Math.round((snapshot.occupiedBeds / Math.max(snapshot.totalBeds, 1)) * 100)
  const staffPressure = Math.round(snapshot.emergencyPatients / Math.max(snapshot.availableDoctors + snapshot.availableNurses, 1))

  const kpis: ExecutiveKpi[] = [
    {
      key: 'bed_occupancy_rate',
      label: 'Occupation lits',
      value: bedOccupancyRate,
      unit: '%',
      status: statusFromThreshold(bedOccupancyRate, 85, 95),
      description: 'Taux d’occupation global des lits hospitaliers.',
    },
    {
      key: 'average_waiting_time',
      label: 'Temps moyen attente',
      value: snapshot.averageWaitingMinutes,
      unit: 'min',
      status: statusFromThreshold(snapshot.averageWaitingMinutes, 60, 120),
      description: 'Temps moyen avant prise en charge.',
    },
    {
      key: 'critical_incidents',
      label: 'Incidents critiques',
      value: snapshot.criticalIncidents,
      status: statusFromThreshold(snapshot.criticalIncidents, 1, 3),
      description: 'Incidents nécessitant une attention immédiate.',
    },
    {
      key: 'pharmacy_stockouts',
      label: 'Ruptures pharmacie',
      value: snapshot.pharmacyStockouts,
      status: statusFromThreshold(snapshot.pharmacyStockouts, 1, 5),
      description: 'Nombre de médicaments critiques en rupture.',
    },
    {
      key: 'lab_pending_results',
      label: 'Résultats labo en attente',
      value: snapshot.labPendingResults,
      status: statusFromThreshold(snapshot.labPendingResults, 20, 50),
      description: 'Volume de résultats laboratoire non validés.',
    },
    {
      key: 'daily_revenue',
      label: 'Recettes du jour',
      value: snapshot.revenueToday,
      unit: 'GNF',
      status: 'GOOD',
      description: 'Recettes journalières consolidées.',
    },
    {
      key: 'staff_pressure',
      label: 'Pression personnel urgences',
      value: staffPressure,
      status: statusFromThreshold(staffPressure, 8, 15),
      description: 'Ratio patients urgences par personnel disponible.',
    },
  ]

  const criticalCount = kpis.filter(kpi => kpi.status === 'CRITICAL').length
  const warningCount = kpis.filter(kpi => kpi.status === 'WARNING').length
  const healthScore = Math.max(0, 100 - criticalCount * 25 - warningCount * 10)

  const globalStatus: ExecutiveDashboardSummary['globalStatus'] =
    criticalCount > 0 ? 'CRITICAL' : warningCount > 0 ? 'WARNING' : 'GOOD'

  const priorities = kpis
    .filter(kpi => kpi.status !== 'GOOD')
    .map(kpi => `${kpi.label}: ${kpi.description}`)

  if (priorities.length === 0) {
    priorities.push('Situation maîtrisée. Maintenir le suivi standard.')
  }

  return {
    healthScore,
    globalStatus,
    kpis,
    priorities,
  }
}
