import { create } from 'zustand'

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

interface User {
  name: string
  role: string
  establishment: string
  email: string
  phone: string
}

interface PortalUser {
  accountId: string | null
  phone: string
  isLoggedIn: boolean
}

interface AppState {
  currentView: AppView
  sidebarOpen: boolean
  user: User
  searchQuery: string
  notificationsOpen: boolean
  portalUser: PortalUser
  setCurrentView: (view: AppView) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setNotificationsOpen: (open: boolean) => void
  updateUser: (data: Partial<User>) => void
  setPortalUser: (data: Partial<PortalUser>) => void
}

export const useStore = create<AppState>((set) => ({
  currentView: 'landing',
  sidebarOpen: true,
  searchQuery: '',
  notificationsOpen: false,
  portalUser: { accountId: null, phone: '', isLoggedIn: false },
  user: {
    name: 'Dr. Mamadou Diallo',
    role: 'Médecin',
    establishment: 'Hôpital Donka',
    email: 'm.diallo@healthflow-gn.com',
    phone: '+224 622 00 00 00',
  },
  setCurrentView: (view) => set({ currentView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
  setSearchQuery: (query) => set({ searchQuery: query }),
  setNotificationsOpen: (open) => set({ notificationsOpen: open }),
  updateUser: (data) => set((s) => ({ user: { ...s.user, ...data } })),
  setPortalUser: (data) => set((s) => ({ portalUser: { ...s.portalUser, ...data } })),
}))
