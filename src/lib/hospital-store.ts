// HealthFlow Guinea - Multi-Hospital Store
// Real Guinean hospitals with autonomous services
// Centralized management with delegation system

import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import {
  type Hospital, type HospitalService, type GuineaRegion,
  type ServiceDelegation, type InterServiceTransfer,
  type ServiceStats, type HospitalStats,
  type MultiHospitalRole, type DelegationAuditEntry,
  getBedOccupancyRate, getServiceUrgency,
} from './hospital-model'

// ─────────── Real Guinean Hospitals ───────────

const realHospitals: Hospital[] = [
  // CONAKRY
  {
    id: 'H-CHU-DONKA', name: 'CHU Donka', shortName: 'Donka', type: 'CHU', status: 'Actif',
    region: 'Conakry', prefecture: 'Conakry', address: 'Avenue du Port, Donka, Conakry',
    phone: '+224 620 00 00 01', email: 'contact@chu-donka.healthflow-gn.com',
    directorName: 'Prof. Alpha Condé', directorPhone: '+224 620 00 00 02',
    totalBeds: 480, occupiedBeds: 387, services: [], coordinates: { lat: 9.5092, lng: -13.7122 },
    color: '#0d9488', accreditationLevel: 'Niveau 3', yearEstablished: 1958,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  {
    id: 'H-CHU-IGNACE', name: 'CHU Ignace Deen', shortName: 'Ignace Deen', type: 'CHU', status: 'Actif',
    region: 'Conakry', prefecture: 'Conakry', address: 'Boulevard du Commerce, Conakry',
    phone: '+224 620 00 00 03', email: 'contact@chu-ignace.healthflow-gn.com',
    directorName: 'Dr. Fatoumata Bâ', directorPhone: '+224 620 00 00 04',
    totalBeds: 350, occupiedBeds: 278, services: [], coordinates: { lat: 9.5150, lng: -13.7050 },
    color: '#2563eb', accreditationLevel: 'Niveau 3', yearEstablished: 1956,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  {
    id: 'H-CHU-AMPELAS', name: 'Hôpital Amitié sino-guinéenne de Kipé', shortName: 'Kipé', type: 'CHU', status: 'Actif',
    region: 'Conakry', prefecture: 'Conakry', address: 'Kipé, Ratoma, Conakry',
    phone: '+224 620 00 00 05', email: 'contact@kipe.healthflow-gn.com',
    directorName: 'Dr. Mamadou Sylla', directorPhone: '+224 620 00 00 06',
    totalBeds: 280, occupiedBeds: 198, services: [], coordinates: { lat: 9.5600, lng: -13.6400 },
    color: '#dc2626', accreditationLevel: 'Niveau 3', yearEstablished: 2012,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  // KINDIA
  {
    id: 'H-HGR-KINDIA', name: 'HGR de Kindia', shortName: 'HGR Kindia', type: 'HGR', status: 'Actif',
    region: 'Kindia', prefecture: 'Kindia', address: 'Centre-ville, Kindia',
    phone: '+224 621 00 00 01', email: 'contact@hgr-kindia.healthflow-gn.com',
    directorName: 'Dr. Ibrahima Camara', directorPhone: '+224 621 00 00 02',
    totalBeds: 180, occupiedBeds: 142, services: [], coordinates: { lat: 10.0589, lng: -12.8589 },
    color: '#7c3aed', accreditationLevel: 'Niveau 2', yearEstablished: 1975,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  // KANKAN
  {
    id: 'H-CHU-KANKAN', name: 'CHU de Kankan', shortName: 'CHU Kankan', type: 'CHU', status: 'Actif',
    region: 'Kankan', prefecture: 'Kankan', address: 'Route de Siguiri, Kankan',
    phone: '+224 622 00 00 01', email: 'contact@chu-kankan.healthflow-gn.com',
    directorName: 'Dr. Ousmane Diallo', directorPhone: '+224 622 00 00 02',
    totalBeds: 250, occupiedBeds: 187, services: [], coordinates: { lat: 10.3833, lng: -9.3000 },
    color: '#ca8a04', accreditationLevel: 'Niveau 3', yearEstablished: 1980,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  // NZÉRÉKORÉ
  {
    id: 'H-CHU-NZEREKORE', name: 'CHU de N\'Zérékoré', shortName: 'CHU N\'Zérékoré', type: 'CHU', status: 'Actif',
    region: 'Nzérékoré', prefecture: 'N\'Zérékoré', address: 'Centre-ville, N\'Zérékoré',
    phone: '+224 623 00 00 01', email: 'contact@chu-nzerekore.healthflow-gn.com',
    directorName: 'Dr. Lamine Touré', directorPhone: '+224 623 00 00 02',
    totalBeds: 200, occupiedBeds: 156, services: [], coordinates: { lat: 7.7500, lng: -8.8167 },
    color: '#db2777', accreditationLevel: 'Niveau 2', yearEstablished: 1985,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  // LABÉ
  {
    id: 'H-HGR-LABE', name: 'HGR de Labé', shortName: 'HGR Labé', type: 'HGR', status: 'Actif',
    region: 'Labé', prefecture: 'Labé', address: 'Centre-ville, Labé',
    phone: '+224 624 00 00 01', email: 'contact@hgr-labe.healthflow-gn.com',
    directorName: 'Dr. Abdoulaye Bah', directorPhone: '+224 624 00 00 02',
    totalBeds: 150, occupiedBeds: 112, services: [], coordinates: { lat: 11.3167, lng: -12.2833 },
    color: '#ea580c', accreditationLevel: 'Niveau 2', yearEstablished: 1978,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  // BOKÉ
  {
    id: 'H-HGR-BOKE', name: 'HGR de Boké', shortName: 'HGR Boké', type: 'HGR', status: 'Actif',
    region: 'Boké', prefecture: 'Boké', address: 'Centre-ville, Boké',
    phone: '+224 625 00 00 01', email: 'contact@hgr-boke.healthflow-gn.com',
    directorName: 'Dr. Mariama Condé', directorPhone: '+224 625 00 00 02',
    totalBeds: 120, occupiedBeds: 89, services: [], coordinates: { lat: 10.9333, lng: -14.3000 },
    color: '#059669', accreditationLevel: 'Niveau 2', yearEstablished: 1982,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  // MAMOU
  {
    id: 'H-HGR-MAMOU', name: 'HGR de Mamou', shortName: 'HGR Mamou', type: 'HGR', status: 'Actif',
    region: 'Mamou', prefecture: 'Mamou', address: 'Centre-ville, Mamou',
    phone: '+224 626 00 00 01', email: 'contact@hgr-mamou.healthflow-gn.com',
    directorName: 'Dr. Souleymane Sow', directorPhone: '+224 626 00 00 02',
    totalBeds: 130, occupiedBeds: 95, services: [], coordinates: { lat: 10.5167, lng: -12.0833 },
    color: '#dc2626', accreditationLevel: 'Niveau 2', yearEstablished: 1980,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
  // FARANAH
  {
    id: 'H-HGR-FARANAH', name: 'HGR de Faranah', shortName: 'HGR Faranah', type: 'HGR', status: 'Actif',
    region: 'Faranah', prefecture: 'Faranah', address: 'Centre-ville, Faranah',
    phone: '+224 627 00 00 01', email: 'contact@hgr-faranah.healthflow-gn.com',
    directorName: 'Dr. Kadiatou Doubé', directorPhone: '+224 627 00 00 02',
    totalBeds: 100, occupiedBeds: 67, services: [], coordinates: { lat: 10.0333, lng: -10.7500 },
    color: '#059669', accreditationLevel: 'Niveau 1', yearEstablished: 1988,
    createdAt: '2024-01-01', updatedAt: new Date().toISOString(),
  },
]

// ─────────── Service Templates per Hospital Type ───────────

function generateServicesForHospital(hospital: Hospital): HospitalService[] {
  const baseServices: Omit<HospitalService, 'id' | 'hospitalId' | 'name' | 'type'> = {
    status: 'Actif', urgency: 'Normale', headDoctorName: '', headDoctorPhone: '',
    totalBeds: 0, occupiedBeds: 0, staffCount: 0, doctorsCount: 0, nursesCount: 0,
    phone: hospital.phone, dailyCapacity: 0, averageWaitTime: 0,
    isAutonomous: true, color: '#0d9488', icon: 'Activity',
    lastActivityAt: new Date().toISOString(), createdAt: hospital.createdAt, updatedAt: new Date().toISOString(),
  }

  const chuServices: Partial<HospitalService>[] = [
    { name: 'Urgences', type: 'Urgences', totalBeds: 30, occupiedBeds: 24, doctorsCount: 8, nursesCount: 15, staffCount: 28, dailyCapacity: 80, averageWaitTime: 35, color: '#dc2626', icon: 'AlertTriangle', headDoctorName: 'Dr. Keita' },
    { name: 'Médecine Interne', type: 'Médecine Interne', totalBeds: 60, occupiedBeds: 48, doctorsCount: 12, nursesCount: 20, staffCount: 38, dailyCapacity: 50, averageWaitTime: 25, color: '#0d9488', icon: 'Heart', headDoctorName: 'Dr. Diallo' },
    { name: 'Chirurgie Générale', type: 'Chirurgie Générale', totalBeds: 45, occupiedBeds: 38, doctorsCount: 10, nursesCount: 18, staffCount: 32, dailyCapacity: 20, averageWaitTime: 45, color: '#2563eb', icon: 'Scissors', headDoctorName: 'Dr. Touré' },
    { name: 'Maternité', type: 'Maternité', totalBeds: 40, occupiedBeds: 34, doctorsCount: 6, nursesCount: 16, staffCount: 25, dailyCapacity: 30, averageWaitTime: 20, color: '#ec4899', icon: 'Baby', headDoctorName: 'Dr. Bah' },
    { name: 'Pédiatrie', type: 'Pédiatrie', totalBeds: 35, occupiedBeds: 28, doctorsCount: 6, nursesCount: 14, staffCount: 22, dailyCapacity: 40, averageWaitTime: 22, color: '#f97316', icon: 'Baby', headDoctorName: 'Dr. Condé' },
    { name: 'Réanimation', type: 'Réanimation', totalBeds: 12, occupiedBeds: 10, doctorsCount: 5, nursesCount: 12, staffCount: 20, dailyCapacity: 12, averageWaitTime: 5, color: '#7c3aed', icon: 'Activity', headDoctorName: 'Dr. Camara' },
    { name: 'Cardiologie', type: 'Cardiologie', totalBeds: 20, occupiedBeds: 16, doctorsCount: 4, nursesCount: 8, staffCount: 14, dailyCapacity: 25, averageWaitTime: 30, color: '#ef4444', icon: 'Heart', headDoctorName: 'Dr. Sylla' },
    { name: 'Neurologie', type: 'Neurologie', totalBeds: 15, occupiedBeds: 12, doctorsCount: 3, nursesCount: 6, staffCount: 10, dailyCapacity: 15, averageWaitTime: 35, color: '#8b5cf6', icon: 'Brain', headDoctorName: 'Dr. Sow' },
    { name: 'Néphrologie', type: 'Néphrologie', totalBeds: 12, occupiedBeds: 10, doctorsCount: 3, nursesCount: 6, staffCount: 10, dailyCapacity: 12, averageWaitTime: 40, color: '#06b6d4', icon: 'Droplets', headDoctorName: 'Dr. Baldé' },
    { name: 'Laboratoire', type: 'Laboratoire', doctorsCount: 5, nursesCount: 2, staffCount: 10, dailyCapacity: 150, averageWaitTime: 60, color: '#10b981', icon: 'FlaskConical', headDoctorName: 'Dr. Kouyaté' },
    { name: 'Imagerie', type: 'Imagerie', doctorsCount: 4, nursesCount: 2, staffCount: 8, dailyCapacity: 60, averageWaitTime: 45, color: '#6366f1', icon: 'Scan', headDoctorName: 'Dr. Diabaté' },
    { name: 'Pharmacie', type: 'Pharmacie', doctorsCount: 2, nursesCount: 0, staffCount: 8, dailyCapacity: 200, averageWaitTime: 15, color: '#14b8a6', icon: 'Pill', headDoctorName: 'Dr. Traoré' },
    { name: 'Bloc Opératoire', type: 'Bloc Opératoire', totalBeds: 8, occupiedBeds: 6, doctorsCount: 6, nursesCount: 10, staffCount: 18, dailyCapacity: 15, averageWaitTime: 90, color: '#f59e0b', icon: 'Scissors', headDoctorName: 'Dr. Cissé' },
    { name: 'Infectiologie', type: 'Infectiologie', totalBeds: 20, occupiedBeds: 16, doctorsCount: 4, nursesCount: 10, staffCount: 16, dailyCapacity: 25, averageWaitTime: 20, color: '#84cc16', icon: 'ShieldAlert', headDoctorName: 'Dr. Sangaré' },
    { name: 'Pneumologie', type: 'Pneumologie', totalBeds: 15, occupiedBeds: 11, doctorsCount: 3, nursesCount: 6, staffCount: 10, dailyCapacity: 20, averageWaitTime: 28, color: '#a855f7', icon: 'Wind', headDoctorName: 'Dr. Doumbouya' },
  ]

  const hgrServices: Partial<HospitalService>[] = [
    { name: 'Urgences', type: 'Urgences', totalBeds: 15, occupiedBeds: 12, doctorsCount: 4, nursesCount: 8, staffCount: 14, dailyCapacity: 40, averageWaitTime: 30, color: '#dc2626', icon: 'AlertTriangle', headDoctorName: 'Dr. Camara' },
    { name: 'Médecine Interne', type: 'Médecine Interne', totalBeds: 35, occupiedBeds: 28, doctorsCount: 6, nursesCount: 10, staffCount: 18, dailyCapacity: 30, averageWaitTime: 25, color: '#0d9488', icon: 'Heart', headDoctorName: 'Dr. Diallo' },
    { name: 'Chirurgie Générale', type: 'Chirurgie Générale', totalBeds: 25, occupiedBeds: 20, doctorsCount: 4, nursesCount: 8, staffCount: 14, dailyCapacity: 10, averageWaitTime: 45, color: '#2563eb', icon: 'Scissors', headDoctorName: 'Dr. Touré' },
    { name: 'Maternité', type: 'Maternité', totalBeds: 25, occupiedBeds: 20, doctorsCount: 3, nursesCount: 8, staffCount: 12, dailyCapacity: 20, averageWaitTime: 18, color: '#ec4899', icon: 'Baby', headDoctorName: 'Dr. Bah' },
    { name: 'Pédiatrie', type: 'Pédiatrie', totalBeds: 20, occupiedBeds: 15, doctorsCount: 3, nursesCount: 6, staffCount: 10, dailyCapacity: 25, averageWaitTime: 20, color: '#f97316', icon: 'Baby', headDoctorName: 'Dr. Condé' },
    { name: 'Laboratoire', type: 'Laboratoire', doctorsCount: 2, nursesCount: 1, staffCount: 4, dailyCapacity: 60, averageWaitTime: 50, color: '#10b981', icon: 'FlaskConical', headDoctorName: 'Dr. Kouyaté' },
    { name: 'Pharmacie', type: 'Pharmacie', doctorsCount: 1, nursesCount: 0, staffCount: 4, dailyCapacity: 100, averageWaitTime: 12, color: '#14b8a6', icon: 'Pill', headDoctorName: 'Dr. Traoré' },
    { name: 'Imagerie', type: 'Imagerie', doctorsCount: 2, nursesCount: 1, staffCount: 4, dailyCapacity: 30, averageWaitTime: 40, color: '#6366f1', icon: 'Scan', headDoctorName: 'Dr. Diabaté' },
  ]

  const template = hospital.type === 'CHU' ? chuServices : hgrServices
  
  return template.map((svc, index) => ({
    ...baseServices,
    ...svc,
    id: `${hospital.id}-SVC-${String(index + 1).padStart(3, '0')}`,
    hospitalId: hospital.id,
    name: svc.name || '',
    type: svc.type || 'Médecine Interne',
    urgency: getServiceUrgency(getBedOccupancyRate(svc.occupiedBeds || 0, svc.totalBeds || 0)),
  })) as HospitalService[]
}

// Generate services for all hospitals
const hospitalsWithServices = realHospitals.map(h => ({
  ...h,
  services: generateServicesForHospital(h),
}))

// ─────────── Store Interface ───────────

interface MultiHospitalState {
  hospitals: Hospital[]
  selectedHospitalId: string | null
  selectedServiceId: string | null
  delegations: ServiceDelegation[]
  transfers: InterServiceTransfer[]
  auditLog: DelegationAuditEntry[]
  
  // Getters
  getSelectedHospital: () => Hospital | null
  getSelectedService: () => HospitalService | null
  getHospitalById: (id: string) => Hospital | undefined
  getServiceById: (hospitalId: string, serviceId: string) => HospitalService | undefined
  getHospitalsByRegion: (region: GuineaRegion) => Hospital[]
  getServicesByHospital: (hospitalId: string) => HospitalService[]
  getActiveDelegations: (hospitalId?: string) => ServiceDelegation[]
  getActiveDelegationsForService: (serviceId: string) => ServiceDelegation[]
  getActiveDelegationsForHospital: (hospitalId: string) => ServiceDelegation[]
  
  // Stats
  getHospitalStats: (hospitalId: string) => HospitalStats
  getServiceStats: (hospitalId: string, serviceId: string) => ServiceStats
  getNationalStats: () => { totalHospitals: number; totalBeds: number; totalOccupied: number; totalPatients: number; totalStaff: number; avgOccupancy: number }
  
  // Actions
  selectHospital: (id: string | null) => void
  selectService: (id: string | null) => void
  updateHospital: (id: string, data: Partial<Hospital>) => void
  updateService: (hospitalId: string, serviceId: string, data: Partial<HospitalService>) => void
  addDelegation: (delegation: Omit<ServiceDelegation, 'id' | 'createdAt'>) => string | null
  approveDelegation: (id: string, approverId: string, approverName: string) => boolean
  revokeDelegation: (id: string, revokedByUserId?: string, revokedByUserName?: string) => void
  emergencyTakeover: (serviceId: string, managerId: string, managerName: string, reason: string) => string | null
  addTransfer: (transfer: Omit<InterServiceTransfer, 'id' | 'requestedAt'>) => string | null
  updateTransferStatus: (id: string, status: InterServiceTransfer['status']) => boolean
  resetToDemo: () => void
}

const initialState = {
  hospitals: hospitalsWithServices,
  selectedHospitalId: null as string | null,
  selectedServiceId: null as string | null,
  delegations: [] as ServiceDelegation[],
  transfers: [] as InterServiceTransfer[],
  auditLog: [] as DelegationAuditEntry[],
}

export const useMultiHospitalStore = create<MultiHospitalState>()(
  persist(
    (set, get) => ({
      ...initialState,
      
      // ─────────── Getters ───────────
      
      getSelectedHospital: () => {
        const { hospitals, selectedHospitalId } = get()
        return hospitals.find(h => h.id === selectedHospitalId) || null
      },
      
      getSelectedService: () => {
        const { hospitals, selectedHospitalId, selectedServiceId } = get()
        const hospital = hospitals.find(h => h.id === selectedHospitalId)
        if (!hospital) return null
        return hospital.services.find(s => s.id === selectedServiceId) || null
      },
      
      getHospitalById: (id) => get().hospitals.find(h => h.id === id),
      
      getServiceById: (hospitalId, serviceId) => {
        const hospital = get().hospitals.find(h => h.id === hospitalId)
        return hospital?.services.find(s => s.id === serviceId)
      },
      
      getHospitalsByRegion: (region) => get().hospitals.filter(h => h.region === region),
      
      getServicesByHospital: (hospitalId) => {
        const hospital = get().hospitals.find(h => h.id === hospitalId)
        return hospital?.services || []
      },
      
      getActiveDelegations: (hospitalId) => {
        const { delegations } = get()
        const now = Date.now()
        // Auto-expire: filter out expired delegations and mark them
        const updatedDelegations = delegations.map(d => {
          if (d.status === 'Active' && d.expiresAt && new Date(d.expiresAt).getTime() < now) {
            return { ...d, status: 'Expirée' as const }
          }
          if (d.status === 'Approuvée' && d.expiresAt && new Date(d.expiresAt).getTime() < now) {
            return { ...d, status: 'Expirée' as const }
          }
          return d
        })
        // Persist the expired status back
        if (updatedDelegations.some((d, i) => d.status !== delegations[i].status)) {
          set({ delegations: updatedDelegations })
        }
        const activeStatuses: ServiceDelegation['status'][] = ['Active', 'Approuvée', 'En attente']
        if (hospitalId) return updatedDelegations.filter(d => d.hospitalId === hospitalId && activeStatuses.includes(d.status))
        return updatedDelegations.filter(d => activeStatuses.includes(d.status))
      },
      
      getActiveDelegationsForService: (serviceId) => {
        const all = get().getActiveDelegations()
        return all.filter(d => d.serviceId === serviceId)
      },
      
      getActiveDelegationsForHospital: (hospitalId) => {
        return get().getActiveDelegations(hospitalId)
      },
      
      // ─────────── Stats ───────────
      
      getHospitalStats: (hospitalId) => {
        const hospital = get().hospitals.find(h => h.id === hospitalId)
        if (!hospital) return { hospitalId, date: new Date().toISOString(), totalPatients: 0, totalAdmissions: 0, totalDischarges: 0, totalConsultations: 0, totalSurgeries: 0, totalEmergencies: 0, totalDeaths: 0, bedOccupancyRate: 0, averageWaitTime: 0, staffPresentCount: 0, staffAbsentCount: 0, revenue: 0, expenses: 0, satisfactionRate: 0 }
        
        const totalStaff = hospital.services.reduce((s, svc) => s + svc.staffCount, 0)
        const avgWait = hospital.services.length > 0 
          ? Math.round(hospital.services.reduce((s, svc) => s + svc.averageWaitTime, 0) / hospital.services.length) 
          : 0
        
        return {
          hospitalId,
          date: new Date().toISOString(),
          totalPatients: hospital.occupiedBeds + Math.floor(Math.random() * 50),
          totalAdmissions: Math.floor(Math.random() * 30) + 10,
          totalDischarges: Math.floor(Math.random() * 25) + 8,
          totalConsultations: Math.floor(Math.random() * 100) + 50,
          totalSurgeries: Math.floor(Math.random() * 15) + 3,
          totalEmergencies: Math.floor(Math.random() * 20) + 5,
          totalDeaths: Math.floor(Math.random() * 3),
          bedOccupancyRate: getBedOccupancyRate(hospital.occupiedBeds, hospital.totalBeds),
          averageWaitTime: avgWait,
          staffPresentCount: Math.floor(totalStaff * 0.85),
          staffAbsentCount: Math.floor(totalStaff * 0.15),
          revenue: Math.floor(Math.random() * 50000000) + 20000000,
          expenses: Math.floor(Math.random() * 40000000) + 15000000,
          satisfactionRate: Math.floor(Math.random() * 20) + 70,
        }
      },
      
      getServiceStats: (hospitalId, serviceId) => {
        const hospital = get().hospitals.find(h => h.id === hospitalId)
        const service = hospital?.services.find(s => s.id === serviceId)
        if (!service) return { serviceId, hospitalId, date: new Date().toISOString(), patientCount: 0, admissionCount: 0, dischargeCount: 0, consultationCount: 0, surgeryCount: 0, emergencyCount: 0, deathCount: 0, transferCount: 0, averageStayDuration: 0, bedOccupancyRate: 0, staffPresentCount: 0, staffAbsentCount: 0, revenue: 0, expenses: 0 }
        
        return {
          serviceId, hospitalId,
          date: new Date().toISOString(),
          patientCount: service.occupiedBeds + Math.floor(Math.random() * 10),
          admissionCount: Math.floor(Math.random() * 8) + 2,
          dischargeCount: Math.floor(Math.random() * 6) + 1,
          consultationCount: Math.floor(Math.random() * service.dailyCapacity * 0.7) + 5,
          surgeryCount: service.type === 'Chirurgie Générale' || service.type === 'Bloc Opératoire' ? Math.floor(Math.random() * 5) + 1 : 0,
          emergencyCount: service.type === 'Urgences' ? Math.floor(Math.random() * 15) + 5 : 0,
          deathCount: Math.floor(Math.random() * 2),
          transferCount: Math.floor(Math.random() * 4),
          averageStayDuration: Math.floor(Math.random() * 5) + 2,
          bedOccupancyRate: getBedOccupancyRate(service.occupiedBeds, service.totalBeds || 1),
          staffPresentCount: Math.floor(service.staffCount * 0.85),
          staffAbsentCount: Math.floor(service.staffCount * 0.15),
          revenue: Math.floor(Math.random() * 10000000) + 2000000,
          expenses: Math.floor(Math.random() * 8000000) + 1500000,
        }
      },
      
      getNationalStats: () => {
        const { hospitals } = get()
        const totalBeds = hospitals.reduce((s, h) => s + h.totalBeds, 0)
        const totalOccupied = hospitals.reduce((s, h) => s + h.occupiedBeds, 0)
        const totalStaff = hospitals.reduce((s, h) => s + h.services.reduce((ss, svc) => ss + svc.staffCount, 0), 0)
        
        return {
          totalHospitals: hospitals.length,
          totalBeds,
          totalOccupied,
          totalPatients: totalOccupied + Math.floor(Math.random() * 200),
          totalStaff,
          avgOccupancy: getBedOccupancyRate(totalOccupied, totalBeds),
        }
      },
      
      // ─────────── Actions ───────────
      
      selectHospital: (id) => set({ selectedHospitalId: id, selectedServiceId: null }),
      
      selectService: (id) => set({ selectedServiceId: id }),
      
      updateHospital: (id, data) => set(s => ({
        hospitals: s.hospitals.map(h => h.id === id ? { ...h, ...data, updatedAt: new Date().toISOString() } : h),
      })),
      
      updateService: (hospitalId, serviceId, data) => set(s => ({
        hospitals: s.hospitals.map(h => h.id === hospitalId ? {
          ...h,
          services: h.services.map(svc => svc.id === serviceId ? { ...svc, ...data, updatedAt: new Date().toISOString() } : svc),
        } : h),
      })),
      
      addDelegation: (delegation) => {
        // Validation: delegatedToUserId and delegatedByUserId must be different
        if (delegation.delegatedToUserId === delegation.delegatedByUserId) {
          console.error('Délégation refusée: le délégataire et le délégant sont identiques')
          return null
        }
        // Validation: check service exists
        const hospital = get().hospitals.find(h => h.id === delegation.hospitalId)
        if (!hospital) {
          console.error('Délégation refusée: hôpital non trouvé')
          return null
        }
        const service = hospital.services.find(s => s.id === delegation.serviceId)
        if (!service) {
          console.error('Délégation refusée: service non trouvé')
          return null
        }
        const id = `DEL-${Date.now()}`
        const newDelegation: ServiceDelegation = { ...delegation, id, createdAt: new Date().toISOString() }
        const auditEntry: DelegationAuditEntry = {
          id: `AUD-${Date.now()}`,
          delegationId: id,
          action: 'create',
          performedByUserId: delegation.delegatedByUserId,
          performedByUserName: delegation.delegatedByUserName,
          details: `Délégation créée pour ${delegation.delegatedToUserName} sur le service ${service.name}. Motif: ${delegation.reason}`,
          timestamp: new Date().toISOString(),
        }
        set(s => ({
          delegations: [...s.delegations, newDelegation],
          auditLog: [...s.auditLog, auditEntry],
        }))
        return id
      },
      
      approveDelegation: (id, approverId, approverName) => {
        const delegation = get().delegations.find(d => d.id === id)
        if (!delegation) return false
        if (delegation.status !== 'En attente') return false
        set(s => ({
          delegations: s.delegations.map(d => d.id === id ? {
            ...d,
            status: 'Approuvée' as const,
            approvedByUserId: approverId,
            approvedByUserName: approverName,
            approvedAt: new Date().toISOString(),
          } : d),
          auditLog: [...s.auditLog, {
            id: `AUD-${Date.now()}`,
            delegationId: id,
            action: 'approve' as const,
            performedByUserId: approverId,
            performedByUserName: approverName,
            details: `Délégation approuvée par ${approverName}`,
            timestamp: new Date().toISOString(),
          }],
        }))
        return true
      },
      
      revokeDelegation: (id, revokedByUserId, revokedByUserName) => {
        const delegation = get().delegations.find(d => d.id === id)
        if (!delegation) return
        set(s => ({
          delegations: s.delegations.map(d => d.id === id ? { ...d, status: 'Révoquée' as const } : d),
          auditLog: [...s.auditLog, {
            id: `AUD-${Date.now()}`,
            delegationId: id,
            action: 'revoke' as const,
            performedByUserId: revokedByUserId || 'system',
            performedByUserName: revokedByUserName || 'Système',
            details: `Délégation révoquée${revokedByUserName ? ` par ${revokedByUserName}` : ''}`,
            timestamp: new Date().toISOString(),
          }],
        }))
      },
      
      emergencyTakeover: (serviceId, managerId, managerName, reason) => {
        // Find the service and hospital
        const hospital = get().hospitals.find(h => h.services.some(s => s.id === serviceId))
        if (!hospital) {
          console.error('Prise en main urgente refusée: service non trouvé')
          return null
        }
        const service = hospital.services.find(s => s.id === serviceId)
        if (!service) return null
        
        const id = `DEL-EMG-${Date.now()}`
        const now = new Date()
        const expiresAt = new Date(now.getTime() + 24 * 60 * 60 * 1000).toISOString() // 24h expiry
        
        const newDelegation: ServiceDelegation = {
          id,
          hospitalId: hospital.id,
          serviceId,
          delegatedToUserId: managerId,
          delegatedToUserName: managerName,
          delegatedByUserId: managerId, // In emergency, the manager takes over
          delegatedByUserName: managerName,
          reason: `URGENCE: ${reason}`,
          startDate: now.toISOString(),
          expiresAt,
          status: 'Active', // Emergency takeovers are immediately active
          isEmergency: true,
          createdAt: now.toISOString(),
        }
        const auditEntry: DelegationAuditEntry = {
          id: `AUD-${Date.now()}`,
          delegationId: id,
          action: 'emergency_takeover',
          performedByUserId: managerId,
          performedByUserName: managerName,
          details: `Prise en main urgente du service ${service.name} par ${managerName}. Motif: ${reason}. Expire dans 24h.`,
          timestamp: now.toISOString(),
        }
        set(s => ({
          delegations: [...s.delegations, newDelegation],
          auditLog: [...s.auditLog, auditEntry],
        }))
        return id
      },
      
      addTransfer: (transfer) => {
        // Validate from/to services are different
        if (transfer.fromServiceId === transfer.toServiceId) {
          console.error('Transfert refusé: le service source et destination sont identiques')
          return null
        }
        const id = `TRF-${Date.now()}`
        set(s => ({
          transfers: [...s.transfers, { ...transfer, id, requestedAt: new Date().toISOString() }],
          auditLog: [...s.auditLog, {
            id: `AUD-${Date.now()}`,
            transferId: id,
            action: 'transfer_request' as const,
            performedByUserId: 'system',
            performedByUserName: 'Système',
            details: `Demande de transfert de ${transfer.fromServiceName} vers ${transfer.toServiceName} pour ${transfer.patientName}. Motif: ${transfer.reason}`,
            timestamp: new Date().toISOString(),
          }],
        }))
        return id
      },
      
      updateTransferStatus: (id, status) => {
        const transfer = get().transfers.find(t => t.id === id)
        if (!transfer) return false
        // Validate status transitions
        const validTransitions: Record<string, InterServiceTransfer['status'][]> = {
          'En attente': ['Accepté', 'Refusé', 'Annulé'],
          'Accepté': ['Annulé'], // Once accepted, can only cancel
        }
        const allowedNext = validTransitions[transfer.status]
        if (!allowedNext || !allowedNext.includes(status)) {
          console.error(`Transition de statut invalide: ${transfer.status} → ${status}`)
          return false
        }
        set(s => ({
          transfers: s.transfers.map(t => t.id === id ? {
            ...t,
            status,
            acceptedAt: status === 'Accepté' ? new Date().toISOString() : t.acceptedAt,
          } : t),
          auditLog: [...s.auditLog, {
            id: `AUD-${Date.now()}`,
            transferId: id,
            action: status === 'Accepté' ? 'transfer_accept' as const :
                    status === 'Refusé' ? 'transfer_reject' as const :
                    status === 'Annulé' ? 'transfer_cancel' as const :
                    'transfer_complete' as const,
            performedByUserId: 'system',
            performedByUserName: 'Système',
            details: `Transfert ${status.toLowerCase()} pour ${transfer.patientName}`,
            timestamp: new Date().toISOString(),
          }],
        }))
        return true
      },
      
      resetToDemo: () => set(initialState),
    }),
    {
      name: 'healthflow-multi-hospital',
    }
  )
)
