import { create } from 'zustand'
import type { ManagementScope, ClinicalRole, UserScope } from './unified-rbac'

export type AppView =
  | 'landing'
  | 'dashboard'
  | 'patients'
  | 'appointments'
  | 'consultations'
  | 'laboratory'
  | 'pharmacy'
  | 'hospitalization'
  | 'emergencies'
  | 'maternity'
  | 'vaccination'
  | 'billing'
  | 'payments'
  | 'messaging'
  | 'insurance'
  | 'teleconsultation'
  | 'analytics'
  | 'administration'
  | 'settings'
  | 'patient-portal'
  | 'ai-diagnostic'
  | 'ai-interactions'
  | 'ai-surveillance'
  | 'video-consultation'
  | 'virtual-waiting-room'
  | 'asc-dashboard'
  | 'audit-log'
  | 'security-dashboard'
  | 'permission-matrix'
  | 'fhir-explorer'
  | 'integration-dashboard'
  | 'adt-messages'
  | 'terminology-browser'
  | 'mpi-dashboard'
  | 'dicom-viewer'
  | 'cross-border'
  | 'fhir-subscriptions'
  | 'national-health-id'
  | 'dhis2-connector'
  | 'facilities-management'
  | 'national-supervision'
  | 'national-statistics'
  | 'multi-hospital'
  | 'adaptive-dashboard'

interface User {
  name: string
  role: string
  establishment: string
  email: string
  phone: string
  // ─── Unified Auth / Hospital Scope Fields ───
  hospitalId?: string
  serviceId?: string
  regionCode?: string
  managementScope: ManagementScope
  clinicalRole: ClinicalRole
}

interface PortalUser {
  accountId: string | null
  phone: string
  isLoggedIn: boolean
}

type ScopeLevel = 'service' | 'hospital' | 'region' | 'national'

interface AppState {
  currentView: AppView
  sidebarOpen: boolean
  user: User
  searchQuery: string
  notificationsOpen: boolean
  portalUser: PortalUser
  // ─── Unified Auth / Hospital Scope State ───
  activeHospitalScope: string | null
  activeServiceScope: string | null
  scopeLevel: ScopeLevel
  // ─── Actions ───
  setCurrentView: (view: AppView) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setNotificationsOpen: (open: boolean) => void
  updateUser: (data: Partial<User>) => void
  setPortalUser: (data: Partial<PortalUser>) => void
  setActiveScope: (level: ScopeLevel, entityId?: string) => void
  getUserScope: () => UserScope
}

export const useStore = create<AppState>((set, get) => ({
  currentView: 'landing',
  sidebarOpen: true,
  searchQuery: '',
  notificationsOpen: false,
  portalUser: { accountId: null, phone: '', isLoggedIn: false },
  // ─── Unified Auth / Hospital Scope Defaults ───
  activeHospitalScope: null,
  activeServiceScope: null,
  scopeLevel: 'hospital',
  user: {
    name: '',
    role: '',
    establishment: '',
    email: '',
    phone: '',
    hospitalId: undefined,
    serviceId: undefined,
    regionCode: undefined,
    managementScope: 'none' as ManagementScope,
    clinicalRole: 'none' as ClinicalRole,
  },
  setCurrentView: (view) => set({ currentView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),
  setPortalUser: (data) => set((s) => ({ portalUser: { ...s.portalUser, ...data } })),
  // ─── Unified Scope Actions ───
  setActiveScope: (level, entityId) =>
    set((s) => {
      const updates: Partial<AppState> = { scopeLevel: level }
      if (level === 'national') {
        updates.activeHospitalScope = null
        updates.activeServiceScope = null
      } else if (level === 'region') {
        updates.activeHospitalScope = null
        updates.activeServiceScope = null
        // regionCode is already on the user, entityId could update it
        if (entityId) {
          updates.user = { ...s.user, regionCode: entityId }
        }
      } else if (level === 'hospital') {
        updates.activeHospitalScope = entityId ?? s.user.hospitalId ?? null
        updates.activeServiceScope = null
      } else if (level === 'service') {
        updates.activeServiceScope = entityId ?? s.user.serviceId ?? null
      }
      return updates
    }),
  getUserScope: () => {
    const { user } = get()
    return {
      clinicalRole: user.clinicalRole,
      managementScope: user.managementScope,
      scopeEntityId: user.serviceId ?? user.hospitalId ?? user.regionCode,
      hospitalId: user.hospitalId,
      serviceId: user.serviceId,
      regionCode: user.regionCode,
    }
  },
}))
