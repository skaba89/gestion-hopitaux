// ============================================================================
// HealthFlow Guinea - OTP Service Tests
// Tests: generateSecureOtp, sendOtpToPhone, verifyOtp
// ============================================================================

import { generateSecureOtp } from '@/lib/otp-service'

// Mock the SMS provider and Redis
jest.mock('@/lib/sms-provider', () => ({
  sendOTP: jest.fn().mockResolvedValue({ success: true, provider: 'demo', messageId: 'test-123' }),
  normalizeGuineaPhone: (phone: string) => {
    const cleaned = phone.replace(/[\s\-()]/g, '')
    if (cleaned.startsWith('+224')) return cleaned
    if (cleaned.startsWith('224')) return `+${cleaned}`
    return `+224${cleaned}`
  },
}))

jest.mock('@/lib/audit-logger', () => ({
  addSimpleAuditEntry: jest.fn().mockResolvedValue(undefined),
}))

describe('OTP Service', () => {
  describe('generateSecureOtp', () => {
    it('should generate a 6-digit OTP by default', () => {
      const otp = generateSecureOtp()
      expect(otp).toMatch(/^\d{6}$/)
    })

    it('should generate OTP of specified length', () => {
      const otp4 = generateSecureOtp(4)
      expect(otp4).toMatch(/^\d{4}$/)

      const otp8 = generateSecureOtp(8)
      expect(otp8).toMatch(/^\d{8}$/)
    })

    it('should generate different OTPs on successive calls (non-deterministic)', () => {
      const otps = new Set<string>()
      for (let i = 0; i < 100; i++) {
        otps.add(generateSecureOtp())
      }
      // With 100 draws from 900,000 possibilities, collisions should be rare
      expect(otps.size).toBeGreaterThan(90)
    })

    it('should not start with 0 for 6-digit OTP', () => {
      // Our implementation uses randomInt(100000, 1000000) so it should never start with 0
      for (let i = 0; i < 100; i++) {
        const otp = generateSecureOtp()
        expect(otp[0]).not.toBe('0')
      }
    })

    it('should only contain digits', () => {
      for (let i = 0; i < 50; i++) {
        const otp = generateSecureOtp()
        expect(otp).toMatch(/^[0-9]+$/)
      }
    })
  })

  describe('sendOtpToPhone', () => {
    // We need to re-import to get the mocked version
    let sendOtpToPhone: any
    let verifyOtp: any

    beforeEach(async () => {
      jest.clearAllMocks()
      // Dynamic import to reset module state
      const otpService = await import('@/lib/otp-service')
      sendOtpToPhone = otpService.sendOtpToPhone
      verifyOtp = otpService.verifyOtp
    })

    it('should send OTP and return success with phone last 4 digits', async () => {
      const result = await sendOtpToPhone('+22462000000')
      expect(result.success).toBe(true)
      expect(result.phoneLast4).toBe('0000')
      expect(result.expiresIn).toBe(300)
    })

    it('should normalize phone number without country code', async () => {
      const result = await sendOtpToPhone('62000000')
      expect(result.success).toBe(true)
    })

    it('should NOT include OTP code in response', async () => {
      const result = await sendOtpToPhone('+22462000000')
      expect((result as any).otp).toBeUndefined()
      expect((result as any).otpCode).toBeUndefined()
      expect((result as any).code).toBeUndefined()
    })

    it('should enforce rate limiting after 5 requests', async () => {
      // Send 5 OTPs (should succeed)
      for (let i = 0; i < 5; i++) {
        const result = await sendOtpToPhone('+22462000001')
        expect(result.success).toBe(true)
      }
      // 6th should be rate limited
      const result = await sendOtpToPhone('+22462000001')
      expect(result.success).toBe(false)
      expect(result.error).toContain('Trop de demandes')
    }, 10000)
  })

  describe('verifyOtp', () => {
    let sendOtpToPhone: any
    let verifyOtp: any

    beforeEach(async () => {
      jest.clearAllMocks()
      const otpService = await import('@/lib/otp-service')
      sendOtpToPhone = otpService.sendOtpToPhone
      verifyOtp = otpService.verifyOtp
    })

    it('should return invalid for wrong OTP', async () => {
      await sendOtpToPhone('+22462000002')
      const result = await verifyOtp('+22462000002', '000000')
      expect(result.valid).toBe(false)
    })

    it('should return invalid for non-existent phone', async () => {
      const result = await verifyOtp('+22469999999', '123456')
      expect(result.valid).toBe(false)
    })
  })
})
