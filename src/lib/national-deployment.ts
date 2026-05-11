// HealthFlow Guinea - Phase 6: National Deployment
// Comprehensive deployment management for Guinea's 8 health zones, 38 districts, and health facilities

/* ─────────── Guinea Administrative Divisions ─────────── */

export interface HealthZone {
  code: string
  name: string
  capital: string
  population: number
  area: number // km²
  districts: District[]
  healthFacilities: number
  doctors: number
  nurses: number
  midwives: number
  ascAgents: number
  hospitalBeds: number
  ambulances: number
  connectivity: 'fiber' | '4g' | '3g' | 'satellite' | 'offline'
  healthflowStatus: 'deployed' | 'partial' | 'pending' | 'planned'
  deploymentDate: string | null
  lastSyncAt: string | null
  coordinatorName: string
  coordinatorPhone: string
}

export interface District {
  code: string
  name: string
  zoneCode: string
  population: number
  healthFacilities: number
  mainFacility: string
  healthflowStatus: 'deployed' | 'partial' | 'pending' | 'planned'
}

export interface HealthFacility {
  id: string
  name: string
  type: 'CHU' | 'Hôpital Régional' | 'Hôpital de District' | 'Centre de Santé' | 'Poste de Santé' | 'Clinique Privée'
  zoneCode: string
  districtCode: string
  address: string
  phone: string
  email: string | null
  director: string
  capacity: number
  currentOccupancy: number
  departments: string[]
  services: string[]
  equipment: string[]
  healthflowDeployed: boolean
  healthflowVersion: string | null
  lastDataSync: string | null
  connectivity: 'fiber' | '4g' | '3g' | 'satellite' | 'offline'
  powerSupply: 'stable' | 'generator' | 'solar' | 'unstable'
  uptime24h: number // percentage
  totalPatients: number
  totalConsultations: number
  monthlyRevenue: number
  accreditation: 'A' | 'B' | 'C' | 'pending'
  gpsCoordinates: { lat: number; lng: number } | null
}

/* ─────────── Deployment & Training ─────────── */

export type DeploymentPhase = 'planning' | 'installation' | 'configuration' | 'training' | 'go-live' | 'monitoring' | 'completed'
export type TrainingModule = 'base' | 'medical' | 'pharmacy' | 'lab' | 'billing' | 'admin' | 'telemedicine' | 'fhir'
export type TrainingStatus = 'not-started' | 'in-progress' | 'completed' | 'certified'
export type UserRoleDeployment = 'medecin' | 'infirmier' | 'pharmacien' | 'laborantin' | 'secretaire' | 'admin' | 'asc'

export interface DeploymentPlan {
  id: string
  zoneCode: string
  zoneName: string
  phase: DeploymentPhase
  startDate: string
  targetGoLive: string
  progress: number // 0-100
  facilities: {
    facilityId: string
    facilityName: string
    phase: DeploymentPhase
    progress: number
    completedSteps: string[]
    remainingSteps: string[]
    assignedTeam: string[]
  }[]
  milestones: {
    name: string
    date: string | null
    completed: boolean
  }[]
  risks: {
    description: string
    severity: 'low' | 'medium' | 'high' | 'critical'
    mitigation: string
  }[]
  budgetAllocated: number // GNF
  budgetSpent: number
}

export interface TrainingSession {
  id: string
  moduleId: TrainingModule
  moduleName: string
  zoneCode: string
  facilityId: string
  facilityName: string
  trainer: string
  startDate: string
  endDate: string
  participants: {
    name: string
    role: UserRoleDeployment
    status: TrainingStatus
    score: number | null
    certifiedAt: string | null
  }[]
  status: 'planned' | 'in-progress' | 'completed' | 'cancelled'
  completionRate: number
  averageScore: number
}

export interface InfrastructureAlert {
  id: string
  facilityId: string
  facilityName: string
  zoneCode: string
  type: 'connectivity' | 'power' | 'server' | 'database' | 'backup' | 'security' | 'performance'
  severity: 'info' | 'warning' | 'critical'
  message: string
  detectedAt: string
  resolvedAt: string | null
  resolution: string | null
  affectedServices: string[]
}

/* ─────────── National Statistics ─────────── */

export interface NationalStatistics {
  totalPopulation: number
  totalFacilities: number
  totalDoctors: number
  totalNurses: number
  totalMidwives: number
  totalASCAgents: number
  totalHospitalBeds: number
  doctorPerCapita: string
  nursePerCapita: string
  bedPerCapita: string
  averageConsultationsPerDay: number
  averageUptime: number
  healthflowCoverage: number
  insCoverage: number
  dhis2ReportingRate: number
  topDiseases: { name: string; cases: number; trend: 'up' | 'down' | 'stable' }[]
  byZone: Record<string, {
    population: number
    facilities: number
    doctors: number
    consultations: number
    healthflowCoverage: number
    topDisease: string
  }>
}

/* ─────────── Guinea Health Zones Data ─────────── */

export const GUINEA_HEALTH_ZONES_FULL: HealthZone[] = [
  {
    code: 'conakry', name: 'Conakry', capital: 'Conakry', population: 2217000, area: 450,
    districts: [
      { code: 'CON-KAL', name: 'Kaloum', zoneCode: 'conakry', population: 62000, healthFacilities: 4, mainFacility: 'Hôpital National Donka', healthflowStatus: 'deployed' },
      { code: 'CON-DIX', name: 'Dixinn', zoneCode: 'conakry', population: 315000, healthFacilities: 6, mainFacility: 'Centre de Santé Dixinn', healthflowStatus: 'deployed' },
      { code: 'CON-RAT', name: 'Ratoma', zoneCode: 'conakry', population: 625000, healthFacilities: 8, mainFacility: 'Centre de Santé Ratoma', healthflowStatus: 'partial' },
      { code: 'CON-MAT', name: 'Matam', zoneCode: 'conakry', population: 560000, healthFacilities: 5, mainFacility: 'Centre de Santé Matam', healthflowStatus: 'deployed' },
      { code: 'CON-MTO', name: 'Matoto', zoneCode: 'conakry', population: 655000, healthFacilities: 7, mainFacility: 'Centre de Santé Matoto', healthflowStatus: 'partial' },
    ],
    healthFacilities: 30, doctors: 485, nurses: 1240, midwives: 320, ascAgents: 450, hospitalBeds: 2100, ambulances: 24,
    connectivity: 'fiber', healthflowStatus: 'deployed', deploymentDate: '2024-01-15', lastSyncAt: new Date().toISOString(),
    coordinatorName: 'Dr. Ibrahima Touré', coordinatorPhone: '+224 620 00 00 01',
  },
  {
    code: 'kindia', name: 'Kindia', capital: 'Kindia', population: 1831000, area: 28088,
    districts: [
      { code: 'KIN-CITY', name: 'Kindia Centre', zoneCode: 'kindia', population: 181000, healthFacilities: 3, mainFacility: 'Hôpital régional de Kindia', healthflowStatus: 'deployed' },
      { code: 'KIN-TLM', name: 'Télimélé', zoneCode: 'kindia', population: 284000, healthFacilities: 2, mainFacility: 'Centre de Santé Télimélé', healthflowStatus: 'pending' },
      { code: 'KIN-COY', name: 'Coyah', zoneCode: 'kindia', population: 107000, healthFacilities: 2, mainFacility: 'Centre de Santé Coyah', healthflowStatus: 'partial' },
      { code: 'KIN-DUB', name: 'Dubréka', zoneCode: 'kindia', population: 131000, healthFacilities: 2, mainFacility: 'Centre de Santé Dubréka', healthflowStatus: 'planned' },
      { code: 'KIN-FOC', name: 'Forécariah', zoneCode: 'kindia', population: 162000, healthFacilities: 2, mainFacility: 'Centre de Santé Forécariah', healthflowStatus: 'planned' },
    ],
    healthFacilities: 15, doctors: 87, nurses: 340, midwives: 98, ascAgents: 280, hospitalBeds: 450, ambulances: 8,
    connectivity: '4g', healthflowStatus: 'partial', deploymentDate: '2024-06-01', lastSyncAt: new Date(Date.now() - 3600000).toISOString(),
    coordinatorName: 'Dr. Fatoumata Bah', coordinatorPhone: '+224 620 00 00 02',
  },
  {
    code: 'boke', name: 'Boké', capital: 'Boké', population: 1145000, area: 31184,
    districts: [
      { code: 'BOK-CITY', name: 'Boké Centre', zoneCode: 'boke', population: 112000, healthFacilities: 2, mainFacility: 'Hôpital régional de Boké', healthflowStatus: 'partial' },
      { code: 'BOK-KGD', name: 'Koundara', zoneCode: 'boke', population: 130000, healthFacilities: 2, mainFacility: 'Centre de Santé Koundara', healthflowStatus: 'planned' },
      { code: 'BOK-GCL', name: 'Gaoual', zoneCode: 'boke', population: 195000, healthFacilities: 2, mainFacility: 'Centre de Santé Gaoual', healthflowStatus: 'planned' },
    ],
    healthFacilities: 8, doctors: 42, nurses: 180, midwives: 54, ascAgents: 195, hospitalBeds: 220, ambulances: 4,
    connectivity: '3g', healthflowStatus: 'pending', deploymentDate: null, lastSyncAt: null,
    coordinatorName: 'Dr. Mamadou Sow', coordinatorPhone: '+224 620 00 00 03',
  },
  {
    code: 'labe', name: 'Labé', capital: 'Labé', population: 995000, area: 22315,
    districts: [
      { code: 'LAB-CITY', name: 'Labé Centre', zoneCode: 'labe', population: 103000, healthFacilities: 3, mainFacility: 'Hôpital régional de Labé', healthflowStatus: 'deployed' },
      { code: 'LAB-LOK', name: 'Lélouma', zoneCode: 'labe', population: 64000, healthFacilities: 1, mainFacility: 'Poste de Santé Lélouma', healthflowStatus: 'planned' },
      { code: 'LAB-TOU', name: 'Tougué', zoneCode: 'labe', population: 88000, healthFacilities: 1, mainFacility: 'Centre de Santé Tougué', healthflowStatus: 'planned' },
      { code: 'LAB-KOBA', name: 'Koubia', zoneCode: 'labe', population: 74000, healthFacilities: 1, mainFacility: 'Centre de Santé Koubia', healthflowStatus: 'planned' },
    ],
    healthFacilities: 9, doctors: 56, nurses: 210, midwives: 72, ascAgents: 160, hospitalBeds: 280, ambulances: 5,
    connectivity: '3g', healthflowStatus: 'partial', deploymentDate: '2025-01-15', lastSyncAt: new Date(Date.now() - 86400000).toISOString(),
    coordinatorName: 'Dr. Thierno Baldé', coordinatorPhone: '+224 620 00 00 04',
  },
  {
    code: 'mali', name: 'Mamou', capital: 'Mamou', population: 886000, area: 17353,
    districts: [
      { code: 'MAM-CITY', name: 'Mamou Centre', zoneCode: 'mali', population: 107000, healthFacilities: 2, mainFacility: 'Hôpital régional de Mamou', healthflowStatus: 'partial' },
      { code: 'MAM-POC', name: 'Pita', zoneCode: 'mali', population: 96000, healthFacilities: 2, mainFacility: 'Centre de Santé Pita', healthflowStatus: 'planned' },
      { code: 'MAM-DLB', name: 'Dalaba', zoneCode: 'mali', population: 74000, healthFacilities: 1, mainFacility: 'Centre de Santé Dalaba', healthflowStatus: 'planned' },
    ],
    healthFacilities: 7, doctors: 38, nurses: 155, midwives: 45, ascAgents: 140, hospitalBeds: 200, ambulances: 3,
    connectivity: '3g', healthflowStatus: 'pending', deploymentDate: null, lastSyncAt: null,
    coordinatorName: 'Dr. Amadou Diallo', coordinatorPhone: '+224 620 00 00 05',
  },
  {
    code: 'faranah', name: 'Faranah', capital: 'Faranah', population: 941000, area: 35581,
    districts: [
      { code: 'FAR-CITY', name: 'Faranah Centre', zoneCode: 'faranah', population: 96000, healthFacilities: 2, mainFacility: 'Hôpital régional de Faranah', healthflowStatus: 'pending' },
      { code: 'FAR-DAB', name: 'Dabola', zoneCode: 'faranah', population: 118000, healthFacilities: 2, mainFacility: 'Centre de Santé Dabola', healthflowStatus: 'planned' },
      { code: 'FAR-DKO', name: 'Dinguiraye', zoneCode: 'faranah', population: 140000, healthFacilities: 1, mainFacility: 'Centre de Santé Dinguiraye', healthflowStatus: 'planned' },
    ],
    healthFacilities: 7, doctors: 32, nurses: 130, midwives: 40, ascAgents: 120, hospitalBeds: 180, ambulances: 3,
    connectivity: 'satellite', healthflowStatus: 'planned', deploymentDate: null, lastSyncAt: null,
    coordinatorName: 'Dr. Lansana Condé', coordinatorPhone: '+224 620 00 00 06',
  },
  {
    code: 'kankan', name: 'Kankan', capital: 'Kankan', population: 1976000, area: 72352,
    districts: [
      { code: 'KAN-CITY', name: 'Kankan Centre', zoneCode: 'kankan', population: 198000, healthFacilities: 3, mainFacility: 'Hôpital régional de Kankan', healthflowStatus: 'deployed' },
      { code: 'KAN-KRO', name: 'Kouroussa', zoneCode: 'kankan', population: 121000, healthFacilities: 2, mainFacility: 'Centre de Santé Kouroussa', healthflowStatus: 'planned' },
      { code: 'KAN-KER', name: 'Kérouané', zoneCode: 'kankan', population: 95000, healthFacilities: 1, mainFacility: 'Centre de Santé Kérouané', healthflowStatus: 'planned' },
      { code: 'KAN-SIG', name: 'Siguiri', zoneCode: 'kankan', population: 268000, healthFacilities: 2, mainFacility: 'Centre de Santé Siguiri', healthflowStatus: 'partial' },
      { code: 'KAN-MAN', name: 'Mandiana', zoneCode: 'kankan', population: 134000, healthFacilities: 1, mainFacility: 'Centre de Santé Mandiana', healthflowStatus: 'planned' },
    ],
    healthFacilities: 14, doctors: 95, nurses: 380, midwives: 110, ascAgents: 310, hospitalBeds: 520, ambulances: 7,
    connectivity: '4g', healthflowStatus: 'partial', deploymentDate: '2025-03-01', lastSyncAt: new Date(Date.now() - 7200000).toISOString(),
    coordinatorName: 'Dr. Moussa Condé', coordinatorPhone: '+224 620 00 00 07',
  },
  {
    code: 'nzerekore', name: "N'Zérékoré", capital: "N'Zérékoré", population: 2624000, area: 49144,
    districts: [
      { code: 'NZR-CITY', name: "N'Zérékoré Centre", zoneCode: 'nzerekore', population: 198000, healthFacilities: 3, mainFacility: "Hôpital régional de N'Zérékoré", healthflowStatus: 'partial' },
      { code: 'NZR-BEZ', name: 'Beyla', zoneCode: 'nzerekore', population: 204000, healthFacilities: 2, mainFacility: 'Centre de Santé Beyla', healthflowStatus: 'planned' },
      { code: 'NZR-GCK', name: 'Guéckédou', zoneCode: 'nzerekore', population: 189000, healthFacilities: 2, mainFacility: 'Centre de Santé Guéckédou', healthflowStatus: 'pending' },
      { code: 'NZR-MCT', name: 'Macenta', zoneCode: 'nzerekore', population: 178000, healthFacilities: 2, mainFacility: 'Centre de Santé Macenta', healthflowStatus: 'planned' },
      { code: 'NZR-ZNG', name: 'Ziong', zoneCode: 'nzerekore', population: 54000, healthFacilities: 1, mainFacility: 'Poste de Santé Ziong', healthflowStatus: 'planned' },
      { code: 'NZR-LOL', name: 'Lola', zoneCode: 'nzerekore', population: 89000, healthFacilities: 1, mainFacility: 'Centre de Santé Lola', healthflowStatus: 'planned' },
      { code: 'NZR-KSD', name: 'Kissidougou', zoneCode: 'nzerekore', population: 214000, healthFacilities: 2, mainFacility: 'Centre de Santé Kissidougou', healthflowStatus: 'pending' },
    ],
    healthFacilities: 18, doctors: 72, nurses: 290, midwives: 85, ascAgents: 350, hospitalBeds: 480, ambulances: 6,
    connectivity: '3g', healthflowStatus: 'pending', deploymentDate: null, lastSyncAt: null,
    coordinatorName: 'Dr. Koliba Camara', coordinatorPhone: '+224 620 00 00 08',
  },
]

/* ─────────── Demo Facilities ─────────── */

export const DEMO_FACILITIES: HealthFacility[] = [
  {
    id: 'FAC-DONKA', name: 'Hôpital National Donka', type: 'CHU', zoneCode: 'conakry', districtCode: 'CON-KAL',
    address: 'Avenue du Port, Conakry', phone: '+224 620 10 00 01', email: 'donka@healthflow-gn.com',
    director: 'Pr. Ibrahima Touré', capacity: 500, currentOccupancy: 387,
    departments: ['Médecine Interne', 'Chirurgie', 'Pédiatrie', 'Gynécologie', 'Cardiologie', 'Neurologie', 'Urgences', 'Réanimation', 'Laboratoire', 'Radiologie'],
    services: ['Consultations', 'Hospitalisation', 'Chirurgie', 'Maternité', 'Urgences 24/7', 'Télémédecine', 'Pharmacie', 'Laboratoire', 'Imagerie'],
    equipment: ['Scanner', 'Échographie', 'Radiographie', 'ECG', 'Laboratoire auto', 'Oxygène central'],
    healthflowDeployed: true, healthflowVersion: '2.4.1', lastDataSync: new Date().toISOString(),
    connectivity: 'fiber', powerSupply: 'generator', uptime24h: 99.8,
    totalPatients: 15234, totalConsultations: 48720, monthlyRevenue: 28450000,
    accreditation: 'A', gpsCoordinates: { lat: 9.5092, lng: -13.7122 },
  },
  {
    id: 'FAC-IGNACE', name: 'Hôpital National Ignace Deen', type: 'CHU', zoneCode: 'conakry', districtCode: 'CON-KAL',
    address: 'Boulevard du Commerce, Conakry', phone: '+224 620 10 00 02', email: 'ignace-deen@healthflow-gn.com',
    director: 'Dr. Mamadou Keïta', capacity: 350, currentOccupancy: 298,
    departments: ['Médecine Interne', 'Chirurgie', 'Ophtalmologie', 'ORL', 'Dermatologie', 'Psychiatrie', 'Urgences'],
    services: ['Consultations', 'Hospitalisation', 'Chirurgie spécialisée', 'Urgences', 'Pharmacie', 'Laboratoire'],
    equipment: ['Scanner', 'Échographie', 'Radiographie', 'ECG', 'Laboratoire'],
    healthflowDeployed: true, healthflowVersion: '2.4.1', lastDataSync: new Date(Date.now() - 300000).toISOString(),
    connectivity: 'fiber', powerSupply: 'generator', uptime24h: 99.5,
    totalPatients: 11200, totalConsultations: 34500, monthlyRevenue: 21200000,
    accreditation: 'A', gpsCoordinates: { lat: 9.5050, lng: -13.7100 },
  },
  {
    id: 'FAC-KINDIA', name: 'Hôpital régional de Kindia', type: 'Hôpital Régional', zoneCode: 'kindia', districtCode: 'KIN-CITY',
    address: 'Kindia Centre', phone: '+224 620 20 00 01', email: null,
    director: 'Dr. Fatoumata Bah', capacity: 150, currentOccupancy: 98,
    departments: ['Médecine Interne', 'Chirurgie', 'Maternité', 'Pédiatrie', 'Urgences'],
    services: ['Consultations', 'Hospitalisation', 'Maternité', 'Urgences', 'Pharmacie', 'Laboratoire'],
    equipment: ['Échographie', 'Radiographie', 'ECG'],
    healthflowDeployed: true, healthflowVersion: '2.3.0', lastDataSync: new Date(Date.now() - 3600000).toISOString(),
    connectivity: '4g', powerSupply: 'solar', uptime24h: 97.2,
    totalPatients: 4200, totalConsultations: 12800, monthlyRevenue: 8900000,
    accreditation: 'B', gpsCoordinates: { lat: 10.0580, lng: -12.8620 },
  },
  {
    id: 'FAC-KANKAN', name: 'Hôpital régional de Kankan', type: 'Hôpital Régional', zoneCode: 'kankan', districtCode: 'KAN-CITY',
    address: 'Kankan Centre', phone: '+224 620 30 00 01', email: null,
    director: 'Dr. Moussa Condé', capacity: 200, currentOccupancy: 145,
    departments: ['Médecine Interne', 'Chirurgie', 'Maternité', 'Pédiatrie', 'Urgences', 'Hépatologie'],
    services: ['Consultations', 'Hospitalisation', 'Maternité', 'Urgences', 'Pharmacie', 'Laboratoire', 'Télémédecine'],
    equipment: ['Scanner', 'Échographie', 'Radiographie', 'ECG'],
    healthflowDeployed: true, healthflowVersion: '2.3.0', lastDataSync: new Date(Date.now() - 7200000).toISOString(),
    connectivity: '4g', powerSupply: 'generator', uptime24h: 96.8,
    totalPatients: 5800, totalConsultations: 17200, monthlyRevenue: 12500000,
    accreditation: 'B', gpsCoordinates: { lat: 10.3833, lng: -9.3000 },
  },
  {
    id: 'FAC-NZR', name: "Hôpital régional de N'Zérékoré", type: 'Hôpital Régional', zoneCode: 'nzerekore', districtCode: 'NZR-CITY',
    address: "N'Zérékoré Centre", phone: '+224 620 40 00 01', email: null,
    director: 'Dr. Koliba Camara', capacity: 180, currentOccupancy: 132,
    departments: ['Médecine Interne', 'Chirurgie', 'Maternité', 'Pédiatrie', 'Urgences'],
    services: ['Consultations', 'Hospitalisation', 'Maternité', 'Urgences', 'Pharmacie', 'Laboratoire'],
    equipment: ['Échographie', 'Radiographie', 'ECG'],
    healthflowDeployed: false, healthflowVersion: null, lastDataSync: null,
    connectivity: '3g', powerSupply: 'generator', uptime24h: 0,
    totalPatients: 3200, totalConsultations: 8900, monthlyRevenue: 6700000,
    accreditation: 'B', gpsCoordinates: { lat: 7.7500, lng: -8.8167 },
  },
  {
    id: 'FAC-LABE', name: 'Hôpital régional de Labé', type: 'Hôpital Régional', zoneCode: 'labe', districtCode: 'LAB-CITY',
    address: 'Labé Centre', phone: '+224 620 50 00 01', email: null,
    director: 'Dr. Thierno Baldé', capacity: 120, currentOccupancy: 76,
    departments: ['Médecine Interne', 'Chirurgie', 'Maternité', 'Pédiatrie'],
    services: ['Consultations', 'Hospitalisation', 'Maternité', 'Pharmacie', 'Laboratoire'],
    equipment: ['Échographie', 'Radiographie'],
    healthflowDeployed: true, healthflowVersion: '2.2.0', lastDataSync: new Date(Date.now() - 86400000).toISOString(),
    connectivity: '3g', powerSupply: 'solar', uptime24h: 92.5,
    totalPatients: 2800, totalConsultations: 7600, monthlyRevenue: 5400000,
    accreditation: 'B', gpsCoordinates: { lat: 11.3167, lng: -12.2833 },
  },
  {
    id: 'FAC-BOKE', name: 'Hôpital régional de Boké', type: 'Hôpital Régional', zoneCode: 'boke', districtCode: 'BOK-CITY',
    address: 'Boké Centre', phone: '+224 620 60 00 01', email: null,
    director: 'Dr. Mamadou Sow', capacity: 100, currentOccupancy: 56,
    departments: ['Médecine Interne', 'Chirurgie', 'Maternité'],
    services: ['Consultations', 'Hospitalisation', 'Maternité', 'Pharmacie'],
    equipment: ['Échographie', 'Radiographie'],
    healthflowDeployed: false, healthflowVersion: null, lastDataSync: null,
    connectivity: '3g', powerSupply: 'unstable', uptime24h: 0,
    totalPatients: 1800, totalConsultations: 4200, monthlyRevenue: 3200000,
    accreditation: 'C', gpsCoordinates: { lat: 10.9333, lng: -14.3000 },
  },
  {
    id: 'FAC-CS-DIXINN', name: 'Centre de santé Dixinn', type: 'Centre de Santé', zoneCode: 'conakry', districtCode: 'CON-DIX',
    address: 'Dixinn, Conakry', phone: '+224 620 11 00 01', email: null,
    director: 'Dr. Aminata Soumah', capacity: 30, currentOccupancy: 12,
    departments: ['Médecine Générale', 'Maternité'],
    services: ['Consultations', 'Maternité', 'Vaccination', 'Pharmacie', 'Télémédecine'],
    equipment: ['Échographie portable'],
    healthflowDeployed: true, healthflowVersion: '2.4.1', lastDataSync: new Date(Date.now() - 180000).toISOString(),
    connectivity: 'fiber', powerSupply: 'stable', uptime24h: 99.9,
    totalPatients: 3400, totalConsultations: 9800, monthlyRevenue: 2100000,
    accreditation: 'B', gpsCoordinates: { lat: 9.5150, lng: -13.6950 },
  },
]

/* ─────────── Demo Deployment Plans ─────────── */

export const DEMO_DEPLOYMENT_PLANS: DeploymentPlan[] = [
  {
    id: 'DEPLOY-CONAKRY', zoneCode: 'conakry', zoneName: 'Conakry', phase: 'completed', startDate: '2024-01-01', targetGoLive: '2024-03-01', progress: 100,
    facilities: [
      { facilityId: 'FAC-DONKA', facilityName: 'Hôpital National Donka', phase: 'completed', progress: 100, completedSteps: ['Installation', 'Configuration', 'Formation', 'Go-Live', 'Monitoring'], remainingSteps: [], assignedTeam: ['Sekouna KABA', 'Ibrahima Touré'] },
      { facilityId: 'FAC-IGNACE', facilityName: 'Hôpital National Ignace Deen', phase: 'completed', progress: 100, completedSteps: ['Installation', 'Configuration', 'Formation', 'Go-Live', 'Monitoring'], remainingSteps: [], assignedTeam: ['Sekouna KABA'] },
      { facilityId: 'FAC-CS-DIXINN', facilityName: 'Centre de santé Dixinn', phase: 'completed', progress: 100, completedSteps: ['Installation', 'Configuration', 'Formation', 'Go-Live'], remainingSteps: [], assignedTeam: ['Moussa Camara'] },
    ],
    milestones: [
      { name: 'Installation serveurs', date: '2024-01-15', completed: true },
      { name: 'Formation personnel', date: '2024-02-10', completed: true },
      { name: 'Go-Live', date: '2024-03-01', completed: true },
      { name: 'Monitoring stabilisé', date: '2024-04-01', completed: true },
    ],
    risks: [],
    budgetAllocated: 45000000, budgetSpent: 42800000,
  },
  {
    id: 'DEPLOY-KINDIA', zoneCode: 'kindia', zoneName: 'Kindia', phase: 'monitoring', startDate: '2024-05-01', targetGoLive: '2024-07-01', progress: 85,
    facilities: [
      { facilityId: 'FAC-KINDIA', facilityName: 'Hôpital régional de Kindia', phase: 'monitoring', progress: 90, completedSteps: ['Installation', 'Configuration', 'Formation', 'Go-Live'], remainingSteps: ['Monitoring stabilisé'], assignedTeam: ['Fatoumata Bah'] },
    ],
    milestones: [
      { name: 'Installation', date: '2024-05-15', completed: true },
      { name: 'Formation personnel', date: '2024-06-10', completed: true },
      { name: 'Go-Live', date: '2024-07-01', completed: true },
      { name: 'Monitoring stabilisé', date: null, completed: false },
    ],
    risks: [{ description: 'Connectivité 4G instable en saison des pluies', severity: 'medium', mitigation: 'Antenne satellite de secours prévue' }],
    budgetAllocated: 25000000, budgetSpent: 21200000,
  },
  {
    id: 'DEPLOY-KANKAN', zoneCode: 'kankan', zoneName: 'Kankan', phase: 'training', startDate: '2025-01-15', targetGoLive: '2025-04-01', progress: 60,
    facilities: [
      { facilityId: 'FAC-KANKAN', facilityName: 'Hôpital régional de Kankan', phase: 'training', progress: 65, completedSteps: ['Installation', 'Configuration'], remainingSteps: ['Formation complète', 'Go-Live', 'Monitoring'], assignedTeam: ['Moussa Condé'] },
    ],
    milestones: [
      { name: 'Installation', date: '2025-01-30', completed: true },
      { name: 'Configuration', date: '2025-02-15', completed: true },
      { name: 'Formation personnel', date: null, completed: false },
      { name: 'Go-Live', date: null, completed: false },
    ],
    risks: [{ description: 'Personnel insuffisant pour formation complète', severity: 'high', mitigation: 'Plan de formation accélérée avec e-learning' }],
    budgetAllocated: 22000000, budgetSpent: 13200000,
  },
  {
    id: 'DEPLOY-NZEREKORE', zoneCode: 'nzerekore', zoneName: "N'Zérékoré", phase: 'planning', startDate: '2025-06-01', targetGoLive: '2025-10-01', progress: 15,
    facilities: [
      { facilityId: 'FAC-NZR', facilityName: "Hôpital régional de N'Zérékoré", phase: 'planning', progress: 10, completedSteps: [], remainingSteps: ['Installation', 'Configuration', 'Formation', 'Go-Live', 'Monitoring'], assignedTeam: [] },
    ],
    milestones: [
      { name: 'Étude de site', date: '2025-06-15', completed: false },
      { name: 'Installation', date: null, completed: false },
      { name: 'Formation', date: null, completed: false },
      { name: 'Go-Live', date: null, completed: false },
    ],
    risks: [
      { description: 'Connectivité limitée en zone forestière', severity: 'high', mitigation: 'Antenne satellite dédiée' },
      { description: 'Résistance au changement du personnel', severity: 'medium', mitigation: 'Implication précoce des leaders locaux' },
    ],
    budgetAllocated: 28000000, budgetSpent: 4200000,
  },
]

/* ─────────── Demo Training Sessions ─────────── */

export const DEMO_TRAINING_SESSIONS: TrainingSession[] = [
  {
    id: 'TRAIN-001', moduleId: 'base', moduleName: 'HealthFlow — Module de Base', zoneCode: 'conakry', facilityId: 'FAC-DONKA', facilityName: 'Hôpital National Donka',
    trainer: 'Sekouna KABA', startDate: '2024-02-01', endDate: '2024-02-10',
    participants: [
      { name: 'Dr. Mamadou Diallo', role: 'medecin', status: 'certified', score: 95, certifiedAt: '2024-02-10' },
      { name: 'Aminata Soumah', role: 'infirmier', status: 'certified', score: 88, certifiedAt: '2024-02-10' },
      { name: 'Ibrahima Touré', role: 'pharmacien', status: 'certified', score: 92, certifiedAt: '2024-02-10' },
      { name: 'Mariama Condé', role: 'secretaire', status: 'certified', score: 85, certifiedAt: '2024-02-10' },
      { name: 'Ousmane Camara', role: 'laborantin', status: 'completed', score: 78, certifiedAt: null },
    ],
    status: 'completed', completionRate: 100, averageScore: 87.6,
  },
  {
    id: 'TRAIN-002', moduleId: 'medical', moduleName: 'HealthFlow — Module Médical', zoneCode: 'conakry', facilityId: 'FAC-DONKA', facilityName: 'Hôpital National Donka',
    trainer: 'Dr. Ibrahima Touré', startDate: '2024-02-15', endDate: '2024-02-25',
    participants: [
      { name: 'Dr. Mamadou Diallo', role: 'medecin', status: 'certified', score: 97, certifiedAt: '2024-02-25' },
      { name: 'Dr. Keïta', role: 'medecin', status: 'certified', score: 91, certifiedAt: '2024-02-25' },
      { name: 'Aminata Soumah', role: 'infirmier', status: 'completed', score: 82, certifiedAt: null },
    ],
    status: 'completed', completionRate: 100, averageScore: 90.0,
  },
  {
    id: 'TRAIN-003', moduleId: 'telemedicine', moduleName: 'HealthFlow — Télémédecine', zoneCode: 'kankan', facilityId: 'FAC-KANKAN', facilityName: 'Hôpital régional de Kankan',
    trainer: 'Sekouna KABA', startDate: '2025-03-01', endDate: '2025-03-10',
    participants: [
      { name: 'Dr. Moussa Condé', role: 'medecin', status: 'in-progress', score: null, certifiedAt: null },
      { name: 'Fatoumata Diallo', role: 'infirmier', status: 'in-progress', score: null, certifiedAt: null },
      { name: 'Kabiné Touré', role: 'admin', status: 'not-started', score: null, certifiedAt: null },
    ],
    status: 'in-progress', completionRate: 40, averageScore: 0,
  },
  {
    id: 'TRAIN-004', moduleId: 'billing', moduleName: 'HealthFlow — Facturation & Paiements', zoneCode: 'kindia', facilityId: 'FAC-KINDIA', facilityName: 'Hôpital régional de Kindia',
    trainer: 'Fatoumata Bah', startDate: '2024-06-20', endDate: '2024-06-28',
    participants: [
      { name: 'Mamadou Sow', role: 'secretaire', status: 'certified', score: 89, certifiedAt: '2024-06-28' },
      { name: 'Aïssatou Bah', role: 'admin', status: 'certified', score: 94, certifiedAt: '2024-06-28' },
    ],
    status: 'completed', completionRate: 100, averageScore: 91.5,
  },
]

/* ─────────── Demo Infrastructure Alerts ─────────── */

export const DEMO_INFRA_ALERTS: InfrastructureAlert[] = [
  {
    id: 'ALERT-INFRA-001', facilityId: 'FAC-KINDIA', facilityName: 'Hôpital régional de Kindia', zoneCode: 'kindia',
    type: 'connectivity', severity: 'warning', message: 'Latence 4G élevée — temps de réponse > 500ms',
    detectedAt: new Date(Date.now() - 7200000).toISOString(), resolvedAt: null, resolution: null,
    affectedServices: ['Synchronisation DHIS2', 'Télémédecine'],
  },
  {
    id: 'ALERT-INFRA-002', facilityId: 'FAC-BOKE', facilityName: 'Hôpital régional de Boké', zoneCode: 'boke',
    type: 'power', severity: 'critical', message: 'Coupure électrique prolongée — générateur en panne',
    detectedAt: new Date(Date.now() - 14400000).toISOString(), resolvedAt: null, resolution: null,
    affectedServices: ['Serveur local', 'Laboratoire', 'Imagerie'],
  },
  {
    id: 'ALERT-INFRA-003', facilityId: 'FAC-DONKA', facilityName: 'Hôpital National Donka', zoneCode: 'conakry',
    type: 'database', severity: 'info', message: 'Sauvegarde automatique complétée — 2.4 GB',
    detectedAt: new Date(Date.now() - 3600000).toISOString(), resolvedAt: new Date(Date.now() - 3500000).toISOString(), resolution: 'Sauvegarde réussie',
    affectedServices: [],
  },
  {
    id: 'ALERT-INFRA-004', facilityId: 'FAC-LABE', facilityName: 'Hôpital régional de Labé', zoneCode: 'labe',
    type: 'performance', severity: 'warning', message: 'Espace disque serveur à 85% — nettoyage recommandé',
    detectedAt: new Date(Date.now() - 86400000).toISOString(), resolvedAt: null, resolution: null,
    affectedServices: ['Base de données patients'],
  },
  {
    id: 'ALERT-INFRA-005', facilityId: 'FAC-KANKAN', facilityName: 'Hôpital régional de Kankan', zoneCode: 'kankan',
    type: 'security', severity: 'critical', message: 'Tentative d\'accès non autorisé détectée — IP suspecte',
    detectedAt: new Date(Date.now() - 1800000).toISOString(), resolvedAt: new Date(Date.now() - 1700000).toISOString(),
    resolution: 'IP bloquée — accès refusé. Audit en cours.',
    affectedServices: ['Authentification'],
  },
]

/* ─────────── National Statistics Calculator ─────────── */

export function calculateNationalStatistics(): NationalStatistics {
  const zones = GUINEA_HEALTH_ZONES_FULL
  const totalPopulation = zones.reduce((s, z) => s + z.population, 0)
  const totalFacilities = zones.reduce((s, z) => s + z.healthFacilities, 0)
  const totalDoctors = zones.reduce((s, z) => s + z.doctors, 0)
  const totalNurses = zones.reduce((s, z) => s + z.nurses, 0)
  const totalMidwives = zones.reduce((s, z) => s + z.midwives, 0)
  const totalASCAgents = zones.reduce((s, z) => s + z.ascAgents, 0)
  const totalHospitalBeds = zones.reduce((s, z) => s + z.hospitalBeds, 0)

  const deployedZones = zones.filter((z) => z.healthflowStatus === 'deployed' || z.healthflowStatus === 'partial')
  const totalConsultationsDay = DEMO_FACILITIES.filter((f) => f.healthflowDeployed).reduce((s, f) => s + Math.round(f.totalConsultations / 365), 0)
  const averageUptime = DEMO_FACILITIES.filter((f) => f.healthflowDeployed).reduce((s, f) => s + f.uptime24h, 0) / DEMO_FACILITIES.filter((f) => f.healthflowDeployed).length
  const healthflowCoverage = (deployedZones.length / zones.length) * 100

  const byZone: NationalStatistics['byZone'] = {}
  for (const z of zones) {
    byZone[z.code] = {
      population: z.population,
      facilities: z.healthFacilities,
      doctors: z.doctors,
      consultations: z.healthFacilities * 15, // estimated daily
      healthflowCoverage: z.healthflowStatus === 'deployed' ? 100 : z.healthflowStatus === 'partial' ? 50 : 0,
      topDisease: z.code === 'conakry' ? 'Paludisme' : z.code === 'nzerekore' ? 'Fièvre de Lassa' : z.code === 'kankan' ? 'Hépatite B' : 'Paludisme',
    }
  }

  return {
    totalPopulation,
    totalFacilities,
    totalDoctors,
    totalNurses,
    totalMidwives,
    totalASCAgents,
    totalHospitalBeds,
    doctorPerCapita: `1 / ${Math.round(totalPopulation / totalDoctors).toLocaleString('fr-FR')}`,
    nursePerCapita: `1 / ${Math.round(totalPopulation / totalNurses).toLocaleString('fr-FR')}`,
    bedPerCapita: `1 / ${Math.round(totalPopulation / totalHospitalBeds).toLocaleString('fr-FR')}`,
    averageConsultationsPerDay: totalConsultationsDay,
    averageUptime: Math.round(averageUptime * 10) / 10,
    healthflowCoverage: Math.round(healthflowCoverage),
    insCoverage: 12,
    dhis2ReportingRate: 78,
    topDiseases: [
      { name: 'Paludisme', cases: 45200, trend: 'down' },
      { name: 'Infections respiratoires', cases: 32100, trend: 'up' },
      { name: 'Diarrhée', cases: 18900, trend: 'stable' },
      { name: 'Hypertension', cases: 12400, trend: 'up' },
      { name: 'Hépatite B', cases: 8700, trend: 'stable' },
      { name: 'VIH/SIDA', cases: 5200, trend: 'down' },
      { name: 'Tuberculose', cases: 4800, trend: 'down' },
      { name: 'Diabète', cases: 3400, trend: 'up' },
    ],
    byZone,
  }
}

/* ─────────── Phase Helpers ─────────── */

export const PHASE_LABELS: Record<DeploymentPhase, string> = {
  planning: 'Planification',
  installation: 'Installation',
  configuration: 'Configuration',
  training: 'Formation',
  'go-live': 'Mise en service',
  monitoring: 'Suivi',
  completed: 'Terminé',
}

export const PHASE_COLORS: Record<DeploymentPhase, string> = {
  planning: 'bg-gray-100 text-gray-700 border-gray-300',
  installation: 'bg-blue-100 text-blue-700 border-blue-300',
  configuration: 'bg-purple-100 text-purple-700 border-purple-300',
  training: 'bg-amber-100 text-amber-700 border-amber-300',
  'go-live': 'bg-teal-100 text-teal-700 border-teal-300',
  monitoring: 'bg-emerald-100 text-emerald-700 border-emerald-300',
  completed: 'bg-green-100 text-green-700 border-green-300',
}

export const CONNECTIVITY_LABELS: Record<HealthZone['connectivity'], string> = {
  fiber: 'Fibre optique',
  '4g': '4G/LTE',
  '3g': '3G',
  satellite: 'Satellite',
  offline: 'Hors ligne',
}

export const FACILITY_TYPE_LABELS: Record<HealthFacility['type'], string> = {
  'CHU': 'Centre Hospitalier Universitaire',
  'Hôpital Régional': 'Hôpital Régional',
  'Hôpital de District': 'Hôpital de District',
  'Centre de Santé': 'Centre de Santé',
  'Poste de Santé': 'Poste de Santé',
  'Clinique Privée': 'Clinique Privée',
}

export const TRAINING_MODULE_LABELS: Record<TrainingModule, string> = {
  base: 'Module de Base',
  medical: 'Module Médical',
  pharmacy: 'Module Pharmacie',
  lab: 'Module Laboratoire',
  billing: 'Module Facturation',
  admin: 'Module Administration',
  telemedicine: 'Module Télémédecine',
  fhir: 'Module Interopérabilité FHIR',
}
