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
  email: string
  phone: string
}

interface AppState {
  currentView: AppView
  sidebarOpen: boolean
  user: User
  searchQuery: string
  notificationsOpen: boolean
  setCurrentView: (view: AppView) => void
  setSidebarOpen: (open: boolean) => void
  setSearchQuery: (query: string) => void
  setNotificationsOpen: (open: boolean) => void
  updateUser: (data: Partial<User>) => void
}

export const useStore = create<AppState>((set) => ({
  currentView: 'landing',
  sidebarOpen: true,
  searchQuery: '',
  notificationsOpen: false,
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
}))
