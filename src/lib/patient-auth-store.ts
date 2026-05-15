'use client'
// HealthFlow Guinea - Patient Auth Store — SECURITY FIX v2
// SEC FIX: Token is NO LONGER persisted to localStorage.
// JWT tokens are managed server-side via httpOnly cookies.
// Only non-sensitive display data is persisted for UX.

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
  // Token is kept in memory ONLY — never persisted to localStorage
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
    {
      name: 'healthflow-patient-auth',
      // SECURITY FIX: Only persist non-sensitive user info.
      // Token is EXCLUDED from localStorage — it lives in httpOnly cookies only.
      partialize: (state) => ({
        user: state.user ? {
          id: state.user.id,
          phone: state.user.phone,
          preferredLanguage: state.user.preferredLanguage,
          // Include patient display info but NOT sensitive data
          patient: state.user.patient ? {
            id: state.user.patient.id,
            firstName: state.user.patient.firstName,
            lastName: state.user.patient.lastName,
            qrCode: state.user.patient.qrCode,
            // bloodType and dateOfBirth are needed for medical context
            bloodType: state.user.patient.bloodType,
            dateOfBirth: state.user.patient.dateOfBirth,
            gender: state.user.patient.gender,
          } : null,
        } : null,
        isAuthenticated: state.isAuthenticated,
        // ⚠️ token is INTENTIONALLY EXCLUDED from persistence
      }),
    }
  )
)
