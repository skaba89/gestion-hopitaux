// HealthFlow Guinea - Multi-Hospital Data Model
// World-class multi-hospital architecture for Guinea's healthcare system
// Each hospital has autonomous services with centralized oversight

// ─────────── Geographic Model (Guinea) ───────────

export type GuineaRegion = 
  | 'Conakry' 
  | 'Kindia' 
  | 'Boké' 
  | 'Labé' 
  | 'Mamou' 
  | 'Faranah' 
  | 'Kankan' 
  | 'Nzérékoré'

export const REGION_LABELS: Record<GuineaRegion, string> = {
  'Conakry': 'Conakry',
  'Kindia': 'Kindia',
  'Boké': 'Boké',
  'Labé': 'Labé',
  'Mamou': 'Mamou',
  'Faranah': 'Faranah',
  'Kankan': 'Kankan',
  'Nzérékoré': 'N\'Zérékoré',
}

export const REGION_COLORS: Record<GuineaRegion, string> = {
  'Conakry': '#0d9488',
  'Kindia': '#2563eb',
  'Boké': '#dc2626',
  'Labé': '#7c3aed',
  'Mamou': '#ea580c',
  'Faranah': '#059669',
  'Kankan': '#ca8a04',
  'Nzérékoré': '#db2777',
}

// ─────────── Hospital Model ───────────

export type HospitalType = 'CHU' | 'HGR' | 'HGD' | 'CS' | 'CMS' | 'Clinique' | 'DSP'
export type HospitalStatus = 'Actif' | 'En maintenance' | 'En construction' | 'Fermé'

export interface Hospital {
  id: string
  name: string
  shortName: string
  type: HospitalType
  status: HospitalStatus
  region: GuineaRegion
  prefecture: string
  address: string
  phone: string
  email: string
  directorName: string
  directorPhone: string
  totalBeds: number
  occupiedBeds: number
  services: HospitalService[]
  coordinates: { lat: number; lng: number }
  logoUrl?: string
  color: string
  accreditationLevel: 'Niveau 1' | 'Niveau 2' | 'Niveau 3'
  yearEstablished: number
  createdAt: string
  updatedAt: string
}

// ─────────── Service/Department Model ───────────

export type ServiceType = 
  // Medical Services
  | 'Urgences' | 'Médecine Interne' | 'Chirurgie Générale' | 'Chirurgie Pédiatrique'
  | 'Maternité' | 'Gynécologie' | 'Pédiatrie' | 'Néonatologie'
  | 'Cardiologie' | 'Neurologie' | 'Néphrologie' | 'Pneumologie'
  | 'Gastro-entérologie' | 'Endocrinologie' | 'Oncologie' | 'Hématologie'
  | 'Dermatologie' | 'Ophtalmologie' | 'ORL' | 'Stomatologie'
  | 'Psychiatrie' | 'Rhumatologie' | 'Infectiologie' | 'Réanimation'
  // Support Services
  | 'Laboratoire' | 'Imagerie' | 'Pharmacie' | 'Bloc Opératoire'
  | 'Anesthésie' | 'Kinésithérapie' | 'Nutrition' | 'Service Social'
  // Administrative
  | 'Direction' | 'Administration' | 'Admissions' | 'Facturation'
  | 'Ressources Humaines' | 'Informatique' | 'Maintenance'
  // Specialized
  | 'Tuberculose' | 'VIH/SIDA' | 'Paludisme' | 'Choléra'
  | 'Vaccination' | 'Planification Familiale' | 'CPN'

export type ServiceStatus = 'Actif' | 'En maintenance' | 'Fermé'
export type ServiceUrgency = 'Normale' | 'Surchargé' | 'Critique'

export interface HospitalService {
  id: string
  hospitalId: string
  name: string
  type: ServiceType
  status: ServiceStatus
  urgency: ServiceUrgency
  headDoctorName: string
  headDoctorPhone: string
  headDoctorId?: string
  totalBeds: number
  occupiedBeds: number
  staffCount: number
  doctorsCount: number
  nursesCount: number
  floor?: string
  wing?: string
  phone: string
  email?: string
  dailyCapacity: number
  averageWaitTime: number // minutes
  isAutonomous: boolean // Service operates independently
  budget?: number
  expenses?: number
  color: string
  icon: string
  lastActivityAt: string
  createdAt: string
  updatedAt: string
}

// ─────────── Service-Specific Stats ───────────

export interface ServiceStats {
  serviceId: string
  hospitalId: string
  date: string
  patientCount: number
  admissionCount: number
  dischargeCount: number
  consultationCount: number
  surgeryCount: number
  emergencyCount: number
  deathCount: number
  transferCount: number
  averageStayDuration: number // days
  bedOccupancyRate: number // 0-100
  staffPresentCount: number
  staffAbsentCount: number
  revenue: number
  expenses: number
}

// ─────────── Hospital Stats ───────────

export interface HospitalStats {
  hospitalId: string
  date: string
  totalPatients: number
  totalAdmissions: number
  totalDischarges: number
  totalConsultations: number
  totalSurgeries: number
  totalEmergencies: number
  totalDeaths: number
  bedOccupancyRate: number
  averageWaitTime: number
  staffPresentCount: number
  staffAbsentCount: number
  revenue: number
  expenses: number
  satisfactionRate: number // 0-100
}

// ─────────── Cross-Service Management ───────────

export interface ServiceDelegation {
  id: string
  hospitalId: string
  serviceId: string
  delegatedToUserId: string
  delegatedToUserName: string
  delegatedByUserId: string
  delegatedByUserName: string
  reason: string
  startDate: string
  endDate?: string
  expiresAt?: string // ISO timestamp for auto-expiration
  status: 'Active' | 'En attente' | 'Approuvée' | 'Expirée' | 'Révoquée'
  isEmergency?: boolean // True for emergency takeover
  approvedByUserId?: string // Who approved the delegation
  approvedByUserName?: string
  approvedAt?: string // When it was approved
  createdAt: string
}

// Audit entry for delegation/transfer actions
export interface DelegationAuditEntry {
  id: string
  delegationId?: string
  transferId?: string
  action: 'create' | 'approve' | 'revoke' | 'expire' | 'emergency_takeover' | 'transfer_request' | 'transfer_accept' | 'transfer_reject' | 'transfer_cancel' | 'transfer_complete'
  performedByUserId: string
  performedByUserName: string
  details: string
  timestamp: string
}

export interface InterServiceTransfer {
  id: string
  hospitalId: string
  fromServiceId: string
  fromServiceName: string
  toServiceId: string
  toServiceName: string
  patientId: string
  patientName: string
  reason: string
  priority: 'Normal' | 'Urgent' | 'Stat'
  status: 'En attente' | 'Accepté' | 'Refusé' | 'Annulé'
  requestedAt: string
  acceptedAt?: string
  notes?: string
}

// ─────────── Role Hierarchy ───────────

export type MultiHospitalRole = 
  | 'Directeur Général'    // Sees everything across all hospitals
  | 'Directeur Régional'   // Sees all hospitals in a region
  | 'Directeur Hôpital'   // Manages one hospital, all services
  | 'Chef de Service'     // Manages one service autonomously
  | 'Médecin'            // Works within a service
  | 'Infirmier'          // Works within a service
  | 'Laborantin'         // Works within a service
  | 'Pharmacien'         // Works within a service
  | 'Secrétaire'         // Works within a service
  | 'ASC'                // Community health worker
  | 'Patient'            // Own data only

export const ROLE_HIERARCHY: Record<MultiHospitalRole, number> = {
  'Directeur Général': 10,
  'Directeur Régional': 8,
  'Directeur Hôpital': 6,
  'Chef de Service': 4,
  'Médecin': 3,
  'Infirmier': 2,
  'Laborantin': 2,
  'Pharmacien': 2,
  'Secrétaire': 1,
  'ASC': 1,
  'Patient': 0,
}

export const ROLE_LABELS: Record<MultiHospitalRole, string> = {
  'Directeur Général': 'Directeur Général',
  'Directeur Régional': 'Directeur Régional',
  'Directeur Hôpital': 'Directeur d\'Hôpital',
  'Chef de Service': 'Chef de Service',
  'Médecin': 'Médecin',
  'Infirmier': 'Infirmier(e)',
  'Laborantin': 'Laborantin(e)',
  'Pharmacien': 'Pharmacien(ne)',
  'Secrétaire': 'Secrétaire',
  'ASC': 'Agent Santé Communautaire',
  'Patient': 'Patient(e)',
}

// ─────────── Helper Functions ───────────

export function canManageService(role: MultiHospitalRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY['Chef de Service']
}

export function canManageHospital(role: MultiHospitalRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY['Directeur Hôpital']
}

export function canManageAllHospitals(role: MultiHospitalRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY['Directeur Général']
}

export function canManageRegion(role: MultiHospitalRole): boolean {
  return ROLE_HIERARCHY[role] >= ROLE_HIERARCHY['Directeur Régional']
}

export function getBedOccupancyRate(occupied: number, total: number): number {
  if (total === 0) return 0
  return Math.round((occupied / total) * 100)
}

export function getServiceUrgency(occupancyRate: number): ServiceUrgency {
  if (occupancyRate >= 95) return 'Critique'
  if (occupancyRate >= 80) return 'Surchargé'
  return 'Normale'
}
