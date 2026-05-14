// ============================================================================
// HealthFlow Guinea - Auth API Route Tests
// Tests: /api/auth/login, /api/auth/otp, /api/patient-auth/*
// ============================================================================

import { NextRequest } from 'next/server'
import bcryptjs from 'bcryptjs'

// Mocks are already set up in src/test/setup.ts

describe('Auth API Routes', () => {
  describe('POST /api/auth/login', () => {
    it('should reject missing email', async () => {
      const { POST } = await import('@/app/api/auth/login/route')
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ password: 'TestPass123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)

      const data = await response.json()
      expect(data.error).toBeDefined()
    })

    it('should reject missing password', async () => {
      const { POST } = await import('@/app/api/auth/login/route')
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'admin@healthflow.gn' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should reject invalid email format', async () => {
      const { POST } = await import('@/app/api/auth/login/route')
      const request = new NextRequest('http://localhost:3000/api/auth/login', {
        method: 'POST',
        body: JSON.stringify({ email: 'not-an-email', password: 'TestPass123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/auth/otp', () => {
    it('should reject invalid phone format', async () => {
      const { POST } = await import('@/app/api/auth/otp/route')
      const request = new NextRequest('http://localhost:3000/api/auth/otp', {
        method: 'POST',
        body: JSON.stringify({ phone: '123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })

    it('should accept valid phone and return OTP info without the code', async () => {
      const { POST } = await import('@/app/api/auth/otp/route')
      const request = new NextRequest('http://localhost:3000/api/auth/otp', {
        method: 'POST',
        body: JSON.stringify({ phone: '+22462000000' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(200)

      const data = await response.json()
      expect(data.success).toBe(true)
      // OTP should NEVER be in the response
      expect(data.otp).toBeUndefined()
      expect(data.otpCode).toBeUndefined()
      expect(data.code).toBeUndefined()
      expect(data.data.phoneLast4).toBeDefined()
      expect(data.data.expiresIn).toBeDefined()
    })
  })

  describe('POST /api/patient-auth/register', () => {
    it('should reject invalid registration data', async () => {
      const { POST } = await import('@/app/api/patient-auth/register/route')
      const request = new NextRequest('http://localhost:3000/api/patient-auth/register', {
        method: 'POST',
        body: JSON.stringify({
          // Missing required fields
          phone: 'invalid',
        }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })

  describe('POST /api/patient-auth/otp', () => {
    it('should reject invalid phone format', async () => {
      const { POST } = await import('@/app/api/patient-auth/otp/route')
      const request = new NextRequest('http://localhost:3000/api/patient-auth/otp', {
        method: 'POST',
        body: JSON.stringify({ phone: '123' }),
        headers: { 'Content-Type': 'application/json' },
      })

      const response = await POST(request)
      expect(response.status).toBe(400)
    })
  })
})

describe('Password Security', () => {
  it('should hash password with 12 salt rounds', async () => {
    const password = 'AdminPass123'
    const hash = await bcryptjs.hash(password, 12)
    expect(hash.startsWith('$2b$12$')).toBe(true)
  })

  it('should verify correct password against hash', async () => {
    const password = 'AdminPass123'
    const hash = await bcryptjs.hash(password, 12)
    const isValid = await bcryptjs.compare(password, hash)
    expect(isValid).toBe(true)
  })

  it('should reject wrong password against hash', async () => {
    const password = 'AdminPass123'
    const hash = await bcryptjs.hash(password, 12)
    const isValid = await bcryptjs.compare('WrongPass456', hash)
    expect(isValid).toBe(false)
  })
})
