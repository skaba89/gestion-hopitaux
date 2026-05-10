// HealthFlow Africa - API Client
// Centralized HTTP client with auth, error handling, and offline support

import { useAuthStore } from '@/lib/auth-store'

export interface ApiResponse<T = unknown> {
  success: boolean
  data: T
  pagination?: {
    total: number
    page: number
    limit: number
    totalPages: number
  }
  error?: string
  message?: string
}

export interface ApiError {
  success: false
  error: string
  status?: number
}

interface RequestOptions extends RequestInit {
  params?: Record<string, string | number | boolean | undefined>
  timeout?: number
}

const DEFAULT_TIMEOUT = 30000
const MAX_RETRIES = 2

class ApiClient {
  private baseUrl: string

  constructor() {
    this.baseUrl = '' // Relative URLs for same-origin requests
  }

  private getAuthHeaders(): Record<string, string> {
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
    }

    // Add auth token from store
    if (typeof window !== 'undefined') {
      const token = useAuthStore.getState().token
      if (token) {
        headers['Authorization'] = `Bearer ${token}`
      }
    }

    return headers
  }

  private buildUrl(path: string, params?: Record<string, string | number | boolean | undefined>): string {
    const url = new URL(path, window.location.origin)

    if (params) {
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined && value !== null) {
          url.searchParams.set(key, String(value))
        }
      })
    }

    return url.toString()
  }

  private async request<T>(
    path: string,
    options: RequestOptions = {},
    retryCount = 0
  ): Promise<ApiResponse<T>> {
    const { params, timeout = DEFAULT_TIMEOUT, ...fetchOptions } = options
    const url = this.buildUrl(path, params)

    // Check if offline
    if (typeof window !== 'undefined' && !navigator.onLine) {
      throw {
        success: false,
        error: 'Vous êtes hors ligne. Cette action sera synchronisée lors de la reconnexion.',
      } as ApiError
    }

    const controller = new AbortController()
    const timeoutId = setTimeout(() => controller.abort(), timeout)

    try {
      const response = await fetch(url, {
        ...fetchOptions,
        signal: controller.signal,
        headers: {
          ...this.getAuthHeaders(),
          ...fetchOptions.headers,
        },
      })

      clearTimeout(timeoutId)

      const data = await response.json()

      if (!response.ok) {
        // Handle 401 - session expired
        if (response.status === 401 && typeof window !== 'undefined') {
          useAuthStore.getState().logout()
        }

        throw {
          success: false,
          error: data.error || `Erreur serveur (${response.status})`,
          status: response.status,
        } as ApiError
      }

      return data as ApiResponse<T>
    } catch (error) {
      clearTimeout(timeoutId)

      // Retry on network errors
      if (
        retryCount < MAX_RETRIES &&
        error instanceof TypeError &&
        error.message === 'Failed to fetch'
      ) {
        await new Promise((resolve) => setTimeout(resolve, 1000 * (retryCount + 1)))
        return this.request<T>(path, options, retryCount + 1)
      }

      if ((error as ApiError).success === false) {
        throw error
      }

      throw {
        success: false,
        error: error instanceof DOMException && error.name === 'AbortError'
          ? 'La requête a expiré. Veuillez réessayer.'
          : 'Erreur de connexion au serveur.',
      } as ApiError
    }
  }

  async get<T = unknown>(path: string, params?: Record<string, string | number | boolean | undefined>): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'GET', params })
  }

  async post<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'POST',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async put<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PUT',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async patch<T = unknown>(path: string, body?: unknown): Promise<ApiResponse<T>> {
    return this.request<T>(path, {
      method: 'PATCH',
      body: body ? JSON.stringify(body) : undefined,
    })
  }

  async delete<T = unknown>(path: string): Promise<ApiResponse<T>> {
    return this.request<T>(path, { method: 'DELETE' })
  }
}

// Singleton instance
export const apiClient = new ApiClient()
