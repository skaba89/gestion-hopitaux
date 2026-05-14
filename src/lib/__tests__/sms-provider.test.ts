// ============================================================================
// HealthFlow Guinea - SMS Provider Tests
// Tests: normalizeGuineaPhone, DemoSMSProvider, SMSService
// ============================================================================

import { normalizeGuineaPhone } from '@/lib/sms-provider'

// Mock audit logger
jest.mock('@/lib/audit-logger', () => ({
  addSimpleAuditEntry: jest.fn().mockResolvedValue(undefined),
}))

describe('SMS Provider', () => {
  describe('normalizeGuineaPhone', () => {
    it('should normalize +224 prefix', () => {
      expect(normalizeGuineaPhone('+22462000000')).toBe('+22462000000')
    })

    it('should normalize 224 prefix (no +)', () => {
      expect(normalizeGuineaPhone('22462000000')).toBe('+22462000000')
    })

    it('should normalize bare 8-digit number', () => {
      expect(normalizeGuineaPhone('62000000')).toBe('+22462000000')
    })

    it('should normalize number starting with 0', () => {
      // In Guinea, phone numbers are 8 digits. '062000000' (9 chars with leading 0) → +22462000000
      expect(normalizeGuineaPhone('062000000')).toBe('+22462000000')
    })

    it('should handle numbers with spaces', () => {
      expect(normalizeGuineaPhone('+224 620 00 00 00')).toBe('+224620000000')
    })

    it('should handle numbers with dashes', () => {
      expect(normalizeGuineaPhone('+224-620-00-00-00')).toBe('+224620000000')
    })

    it('should handle already normalized numbers', () => {
      expect(normalizeGuineaPhone('+22462000000')).toBe('+22462000000')
    })
  })

  describe('DemoSMSProvider', () => {
    let smsService: any

    beforeEach(async () => {
      jest.clearAllMocks()
      // Reset the singleton by reimporting
      jest.resetModules()

      process.env.SMS_PROVIDER = 'demo'
      const mod = await import('@/lib/sms-provider')
      smsService = mod.smsService
    })

    it('should send SMS in demo mode (logs to console)', async () => {
      const consoleSpy = jest.spyOn(console, 'log').mockImplementation()
      const result = await smsService.send('+22462000000', 'Test message')
      expect(result.success).toBe(true)
      expect(result.provider).toBe('demo')
      expect(result.messageId).toBeDefined()
      consoleSpy.mockRestore()
    })

    it('should send OTP via sendOTP method', async () => {
      const result = await smsService.sendOTP('+22462000000', '123456', 5)
      expect(result.success).toBe(true)
    })
  })
})
