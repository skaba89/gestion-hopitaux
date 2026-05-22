// HealthFlow Africa - Auth Store (Zustand) — DEMO MODE FIX
// In DEMO_MODE: Token IS persisted to localStorage (needed because there's
//   no server-side httpOnly cookie session — the app runs entirely client-side).
// In PRODUCTION: Token is NOT persisted (httpOnly cookies handle auth).

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
  // In demo mode, token is persisted to localStorage for cross-refresh survival.
  // In production, token lives in httpOnly cookies only (never persisted here).
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

/**
 * Detect demo mode on the client side.
 * Falls back to checking localStorage for a demo marker set during login.
 */
function isDemoModeClient(): boolean {
  if (typeof window === 'undefined') return false
  // Check the NEXT_PUBLIC env var (set by next.config.ts from DEMO_MODE)
  if (process.env.NEXT_PUBLIC_DEMO_MODE === 'true') return true
  // Also check if a demo token was previously stored
  try {
    const stored = localStorage.getItem('healthflow-auth')
    if (stored) {
      const parsed = JSON.parse(stored)
      return parsed?.state?.token?.startsWith('demo.') ?? false
    }
  } catch {}
  return false
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
        // CRITICAL FIX: Store the token! In demo mode it's a demo token.
        // In production, this would be a real JWT (but not persisted — see partialize).
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
      // In demo mode, persist the token so it survives page refreshes.
      // In production, exclude the token (it lives in httpOnly cookies).
      partialize: (state) => {
        const demoMode = isDemoModeClient()
        return {
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
          // DEMO MODE FIX: Include token in localStorage for demo mode
          // so API calls work after page refresh
          ...(demoMode ? { token: state.token } : {}),
        }
      },
    }
  )
)
