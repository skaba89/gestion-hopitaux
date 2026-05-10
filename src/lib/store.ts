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
  | 'teleconsultation'
  | 'analytics'
  | 'administration'
  | 'settings'

interface User {
  name: string
  role: string
  establishment: string
}

interface AppState {
  currentView: AppView
  sidebarOpen: boolean
  user: User
  setCurrentView: (view: AppView) => void
  setSidebarOpen: (open: boolean) => void
}

export const useStore = create<AppState>((set) => ({
  currentView: 'landing',
  sidebarOpen: true,
  user: {
    name: 'Dr. Mamadou Diallo',
    role: 'Médecin',
    establishment: 'Hôpital Donka',
  },
  setCurrentView: (view) => set({ currentView: view }),
  setSidebarOpen: (open) => set({ sidebarOpen: open }),
}))
