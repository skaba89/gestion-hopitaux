// HealthFlow Africa - Auth Store (Zustand) — SECURITY FIX v2
// SEC FIX: Token is NO LONGER persisted to localStorage.
// JWT tokens are managed server-side via NextAuth httpOnly cookies.
// Only non-sensitive display data (name, role) is persisted for UX.

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
  // Token is kept in memory ONLY — never persisted to localStorage
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
        // Token is set in memory but will NOT be persisted (see partialize below)
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
      // SECURITY FIX: Only persist non-sensitive display data.
      // Token is EXCLUDED from localStorage — it lives in httpOnly cookies only.
      partialize: (state) => ({
        user: state.user ? {
          id: state.user.id,
          name: state.user.name,
          email: state.user.email,
          phone: state.user.phone,
          role: state.user.role,
          establishmentId: state.user.establishmentId,
          avatarUrl: state.user.avatarUrl,
        } : null,
        isAuthenticated: state.isAuthenticated,
        // ⚠️ token is INTENTIONALLY EXCLUDED from persistence
      }),
    }
  )
)
