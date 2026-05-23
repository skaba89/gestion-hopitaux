export type BedStatus = 'AVAILABLE' | 'OCCUPIED' | 'MAINTENANCE' | 'RESERVED'

export interface BedSnapshot {
  service: string
  totalBeds: number
  availableBeds: number
  occupiedBeds: number
  maintenanceBeds?: number
  reservedBeds?: number
}

export interface BedManagementInsight {
  service: string
  occupancyRate: number
  severity: 'NORMAL' | 'WARNING' | 'CRITICAL'
  message: string
  recommendation: string
}

export function analyzeBedOccupancy(snapshots: BedSnapshot[]): BedManagementInsight[] {
  return snapshots.map(snapshot => {
    const total = Math.max(snapshot.totalBeds, 1)
    const occupancyRate = Math.round((snapshot.occupiedBeds / total) * 100)

    if (occupancyRate >= 95) {
      return {
        service: snapshot.service,
        occupancyRate,
        severity: 'CRITICAL',
        message: `Service ${snapshot.service} en saturation critique (${occupancyRate}%).`,
        recommendation: 'Déclencher un plan de délestage, réorientation patients et mobilisation lits supplémentaires.',
      }
    }

    if (occupancyRate >= 85) {
      return {
        service: snapshot.service,
        occupancyRate,
        severity: 'WARNING',
        message: `Service ${snapshot.service} proche de la saturation (${occupancyRate}%).`,
        recommendation: 'Surveiller les admissions et anticiper les sorties médicales possibles.',
      }
    }

    return {
      service: snapshot.service,
      occupancyRate,
      severity: 'NORMAL',
      message: `Capacité maîtrisée pour ${snapshot.service} (${occupancyRate}%).`,
      recommendation: 'Continuer le suivi standard.',
    }
  }).sort((a, b) => b.occupancyRate - a.occupancyRate)
}
