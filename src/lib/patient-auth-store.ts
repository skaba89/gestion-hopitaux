'use client'
import { create } from 'zustand'
import { persist } from 'zustand/middleware'

interface PatientUser {
  id: string
  phone: string
  preferredLanguage: string
  patient: {
    id: string
    firstName: string
    lastName: string
    qrCode: string
    bloodType: string | null
    dateOfBirth: string
    gender: string
  } | null
}

interface PatientAuthState {
  token: string | null
  user: PatientUser | null
  isAuthenticated: boolean
  setAuth: (token: string, user: PatientUser) => void
  logout: () => void
  updateUser: (user: Partial<PatientUser>) => void
}

export const usePatientAuthStore = create<PatientAuthState>()(
  persist(
    (set) => ({
      token: null,
      user: null,
      isAuthenticated: false,
      setAuth: (token, user) => set({ token, user, isAuthenticated: true }),
      logout: () => set({ token: null, user: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    { name: 'healthflow-patient-auth' }
  )
)
