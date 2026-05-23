export interface DemoHospitalSnapshot {
  hospitalName: string
  region: string
  admissionsToday: number
  consultationsToday: number
  emergencyPatients: number
  occupiedBeds: number
  totalBeds: number
  availableDoctors: number
  availableNurses: number
  pharmacyStockouts: number
  labPendingResults: number
  averageWaitingMinutes: number
  revenueToday: number
}

export function generateDemoHospitalSnapshots(): DemoHospitalSnapshot[] {
  return [
    {
      hospitalName: 'CHU Donka',
      region: 'Conakry',
      admissionsToday: 126,
      consultationsToday: 540,
      emergencyPatients: 78,
      occupiedBeds: 410,
      totalBeds: 450,
      availableDoctors: 22,
      availableNurses: 51,
      pharmacyStockouts: 3,
      labPendingResults: 64,
      averageWaitingMinutes: 92,
      revenueToday: 128000000,
    },
    {
      hospitalName: 'CHU Ignace Deen',
      region: 'Conakry',
      admissionsToday: 102,
      consultationsToday: 460,
      emergencyPatients: 61,
      occupiedBeds: 350,
      totalBeds: 390,
      availableDoctors: 18,
      availableNurses: 42,
      pharmacyStockouts: 1,
      labPendingResults: 43,
      averageWaitingMinutes: 76,
      revenueToday: 94000000,
    },
    {
      hospitalName: 'Hôpital Régional de Kankan',
      region: 'Kankan',
      admissionsToday: 64,
      consultationsToday: 230,
      emergencyPatients: 34,
      occupiedBeds: 165,
      totalBeds: 220,
      availableDoctors: 11,
      availableNurses: 24,
      pharmacyStockouts: 4,
      labPendingResults: 27,
      averageWaitingMinutes: 58,
      revenueToday: 42000000,
    },
  ]
}
