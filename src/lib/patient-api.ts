'use client'
import { usePatientAuthStore } from './patient-auth-store'

const API_BASE = '/api'

class PatientAPI {
  private getToken(): string | null {
    if (typeof window === 'undefined') return null
    return usePatientAuthStore.getState().token
  }

  private async request(endpoint: string, options: RequestInit = {}) {
    const token = this.getToken()
    const headers: Record<string, string> = {
      'Content-Type': 'application/json',
      ...((options.headers as Record<string, string>) || {}),
    }
    if (token) {
      headers['Authorization'] = `Bearer ${token}`
    }
    // CSRF protection: add x-requested-with header for mutating requests
    // This allows the server to distinguish AJAX requests from form submissions
    if (options.method && ['POST', 'PUT', 'DELETE', 'PATCH'].includes(options.method)) {
      headers['X-Requested-With'] = 'XMLHttpRequest'
    }

    const res = await fetch(`${API_BASE}${endpoint}`, { ...options, headers })
    const data = await res.json()
    if (!res.ok) throw new Error(data.error || 'Erreur serveur')
    return data
  }

  async register(data: { phone: string; firstName: string; lastName: string; dateOfBirth: string; gender: string; preferredLanguage: string; establishmentId: string }) {
    return this.request('/patient-auth/register', { method: 'POST', body: JSON.stringify(data) })
  }

  async requestOTP(phone: string) {
    return this.request('/patient-auth/otp', { method: 'POST', body: JSON.stringify({ phone }) })
  }

  async verifyOTP(phone: string, otpCode: string) {
    return this.request('/patient-auth/verify', { method: 'POST', body: JSON.stringify({ phone, otpCode }) })
  }

  async getProfile() {
    return this.request('/patient-auth/me')
  }

  async updateProfile(data: Record<string, unknown>) {
    return this.request('/patient-auth/me', { method: 'PUT', body: JSON.stringify(data) })
  }

  async getAvailableSlots(doctorId: string, date: string) {
    return this.request(`/appointments/availability?doctorId=${encodeURIComponent(doctorId)}&date=${encodeURIComponent(date)}`)
  }

  async getAppointments(params?: Record<string, string>) {
    const query = params ? '?' + new URLSearchParams(params).toString() : ''
    return this.request(`/appointments${query}`)
  }

  async createAppointment(data: Record<string, unknown>) {
    return this.request('/appointments', { method: 'POST', body: JSON.stringify(data) })
  }

  async updateAppointment(id: string, data: Record<string, unknown>) {
    return this.request(`/appointments/${id}`, { method: 'PUT', body: JSON.stringify(data) })
  }

  async cancelAppointment(id: string) {
    return this.request(`/appointments/${id}`, { method: 'DELETE' })
  }

  async getEstablishments() {
    return this.request('/establishments?limit=100&isActive=true')
  }
}

export const patientAPI = new PatientAPI()
