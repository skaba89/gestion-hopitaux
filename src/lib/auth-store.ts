// HealthFlow Africa - Auth Store (Zustand)
// Manages authentication state on the client side

import { create } from 'zustand'
import { persist } from 'zustand/middleware'

export interface AuthUser {
  id: string
  name: string
  email: string
  phone: string
  role: string
  establishmentId: string
  avatarUrl?: string
}

interface AuthState {
  user: AuthUser | null
  isAuthenticated: boolean
  token: string | null
  isLoading: boolean
  error: string | null

  // Actions
  setUser: (user: AuthUser) => void
  setToken: (token: string | null) => void
  login: (user: AuthUser, token?: string) => void
  logout: () => void
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
  updateUser: (data: Partial<AuthUser>) => void
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      isAuthenticated: false,
      token: null,
      isLoading: false,
      error: null,

      setUser: (user) => set({ user, isAuthenticated: !!user }),

      setToken: (token) => set({ token }),

      login: (user, token) => set({
        user,
        isAuthenticated: true,
        token: token || null,
        error: null,
        isLoading: false,
      }),

      logout: () => set({
        user: null,
        isAuthenticated: false,
        token: null,
        error: null,
        isLoading: false,
      }),

      setLoading: (isLoading) => set({ isLoading }),

      setError: (error) => set({ error, isLoading: false }),

      updateUser: (data) => set((s) => ({
        user: s.user ? { ...s.user, ...data } : null,
      })),
    }),
    {
      name: 'healthflow-auth',
      partialize: (state) => ({
        user: state.user,
        isAuthenticated: state.isAuthenticated,
        token: state.token,
      }),
    }
  )
)
