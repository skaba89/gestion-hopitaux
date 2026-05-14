// ============================================================================
// HealthFlow Guinea - Validation Schemas Tests
// Tests: Zod validation schemas for auth, patient, common
// ============================================================================

import {
  otpSendSchema,
  otpVerifySchema,
  loginSchema,
  patientLoginSchema,
  passwordResetSchema,
  authUserCreateSchema,
} from '@/lib/validations/auth'

import {
  patientRegistrationSchema,
  patientAccountRegistrationSchema,
  patientUpdateSchema,
} from '@/lib/validations/patient'

describe('Auth Validation Schemas', () => {
  describe('otpSendSchema', () => {
    it('should accept valid Guinea phone number', () => {
      const result = otpSendSchema.safeParse({ phone: '+22462000000' })
      expect(result.success).toBe(true)
    })

    it('should reject empty phone', () => {
      const result = otpSendSchema.safeParse({ phone: '' })
      expect(result.success).toBe(false)
    })

    it('should reject invalid phone format', () => {
      const result = otpSendSchema.safeParse({ phone: '123' })
      expect(result.success).toBe(false)
    })

    it('should reject missing phone field', () => {
      const result = otpSendSchema.safeParse({})
      expect(result.success).toBe(false)
    })
  })

  describe('otpVerifySchema', () => {
    it('should accept valid phone and 6-digit OTP', () => {
      const result = otpVerifySchema.safeParse({ phone: '+22462000000', otpCode: '123456' })
      expect(result.success).toBe(true)
    })

    it('should reject OTP shorter than 6 digits', () => {
      const result = otpVerifySchema.safeParse({ phone: '+22462000000', otpCode: '12345' })
      expect(result.success).toBe(false)
    })

    it('should reject OTP longer than 6 digits', () => {
      const result = otpVerifySchema.safeParse({ phone: '+22462000000', otpCode: '1234567' })
      expect(result.success).toBe(false)
    })

    it('should accept any 6-character string (validation is length-only, content checked at verify)', () => {
      // The schema validates length only; actual OTP value is verified against Redis
      const result = otpVerifySchema.safeParse({ phone: '+22462000000', otpCode: 'abcdef' })
      expect(result.success).toBe(true) // Schema allows 6-char strings; verification will reject
    })
  })

  describe('loginSchema', () => {
    it('should accept valid email and password', () => {
      const result = loginSchema.safeParse({
        email: 'admin@healthflow.gn',
        password: 'SecurePass123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid email', () => {
      const result = loginSchema.safeParse({
        email: 'not-an-email',
        password: 'SecurePass123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject short password (< 8 chars)', () => {
      const result = loginSchema.safeParse({
        email: 'admin@healthflow.gn',
        password: 'Short1',
      })
      expect(result.success).toBe(false)
    })

    it('should reject too long password (> 128 chars)', () => {
      const result = loginSchema.safeParse({
        email: 'admin@healthflow.gn',
        password: 'A'.repeat(129) + '1',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('passwordResetSchema', () => {
    it('should accept valid reset data', () => {
      const result = passwordResetSchema.safeParse({
        token: 'some-reset-token',
        newPassword: 'NewSecurePass1',
        confirmPassword: 'NewSecurePass1',
      })
      expect(result.success).toBe(true)
    })

    it('should reject mismatched passwords', () => {
      const result = passwordResetSchema.safeParse({
        token: 'some-reset-token',
        newPassword: 'NewSecurePass1',
        confirmPassword: 'DifferentPass1',
      })
      expect(result.success).toBe(false)
    })

    it('should reject password without uppercase', () => {
      const result = passwordResetSchema.safeParse({
        token: 'token',
        newPassword: 'nouppercase1',
        confirmPassword: 'nouppercase1',
      })
      expect(result.success).toBe(false)
    })

    it('should reject password without digit', () => {
      const result = passwordResetSchema.safeParse({
        token: 'token',
        newPassword: 'NoDigitPass',
        confirmPassword: 'NoDigitPass',
      })
      expect(result.success).toBe(false)
    })
  })

  describe('authUserCreateSchema', () => {
    it('should accept valid user creation data', () => {
      const result = authUserCreateSchema.safeParse({
        email: 'doctor@healthflow.gn',
        password: 'SecurePass123',
        firstName: 'Mamadou',
        lastName: 'Diallo',
        phone: '+22462000000',
        roleId: 'role-123',
        establishmentId: 'est-123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject missing required fields', () => {
      const result = authUserCreateSchema.safeParse({
        email: 'doctor@healthflow.gn',
        // missing password, firstName, lastName, roleId, establishmentId
      })
      expect(result.success).toBe(false)
    })

    it('should accept without optional phone', () => {
      const result = authUserCreateSchema.safeParse({
        email: 'doctor@healthflow.gn',
        password: 'SecurePass123',
        firstName: 'Mamadou',
        lastName: 'Diallo',
        roleId: 'role-123',
        establishmentId: 'est-123',
      })
      expect(result.success).toBe(true)
    })
  })
})

describe('Patient Validation Schemas', () => {
  describe('patientAccountRegistrationSchema', () => {
    it('should accept valid registration data', () => {
      const result = patientAccountRegistrationSchema.safeParse({
        phone: '+22462000000',
        firstName: 'Aminata',
        lastName: 'Bah',
        dateOfBirth: '1990-05-15',
        gender: 'FEMALE',
        preferredLanguage: 'fr',
        establishmentId: 'est-123',
      })
      expect(result.success).toBe(true)
    })

    it('should reject invalid gender', () => {
      const result = patientAccountRegistrationSchema.safeParse({
        phone: '+22462000000',
        firstName: 'Aminata',
        lastName: 'Bah',
        dateOfBirth: '1990-05-15',
        gender: 'INVALID',
        preferredLanguage: 'fr',
        establishmentId: 'est-123',
      })
      expect(result.success).toBe(false)
    })

    it('should reject short first name', () => {
      const result = patientAccountRegistrationSchema.safeParse({
        phone: '+22462000000',
        firstName: 'A',
        lastName: 'Bah',
        dateOfBirth: '1990-05-15',
        gender: 'FEMALE',
        preferredLanguage: 'fr',
        establishmentId: 'est-123',
      })
      expect(result.success).toBe(false)
    })

    it('should accept all supported languages', () => {
      const languages = ['fr', 'en', 'msk', 'sus', 'ff']
      for (const lang of languages) {
        const result = patientAccountRegistrationSchema.safeParse({
          phone: '+22462000000',
          firstName: 'Aminata',
          lastName: 'Bah',
          dateOfBirth: '1990-05-15',
          gender: 'FEMALE',
          preferredLanguage: lang,
          establishmentId: 'est-123',
        })
        expect(result.success).toBe(true)
      }
    })
  })

  describe('patientUpdateSchema', () => {
    it('should accept partial update', () => {
      const result = patientUpdateSchema.safeParse({
        firstName: 'NewName',
      })
      expect(result.success).toBe(true)
    })

    it('should accept empty object (no-op update)', () => {
      const result = patientUpdateSchema.safeParse({})
      expect(result.success).toBe(true)
    })

    it('should reject short first name', () => {
      const result = patientUpdateSchema.safeParse({
        firstName: 'X',
      })
      expect(result.success).toBe(false)
    })

    it('should reject invalid email', () => {
      const result = patientUpdateSchema.safeParse({
        email: 'not-an-email',
      })
      expect(result.success).toBe(false)
    })
  })
})
