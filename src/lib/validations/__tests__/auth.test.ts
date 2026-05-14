import {
  otpSendSchema,
  otpVerifySchema,
  csrfTokenSchema,
  loginSchema,
  patientLoginSchema,
  mfaSetupSchema,
  mfaVerifySchema,
  mfaBackupCodeSchema,
  passwordResetRequestSchema,
  passwordResetSchema,
  authUserCreateSchema,
  authUserUpdateSchema,
} from '@/lib/validations/auth'

// ============================================================================
// HealthFlow Guinea - Authentication Validation Schema Tests
// ============================================================================

describe('otpSendSchema', () => {
  it('should validate valid phone for OTP send', () => {
    const result = otpSendSchema.safeParse({
      phone: '+22462112345',
    })
    expect(result.success).toBe(true)
  })

  it('should transform 8-digit phone to +224 format', () => {
    const result = otpSendSchema.safeParse({
      phone: '62112345',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('+22462112345')
    }
  })

  it('should reject invalid phone format', () => {
    const result = otpSendSchema.safeParse({
      phone: '+1234567890',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing phone', () => {
    const result = otpSendSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('otpVerifySchema', () => {
  it('should validate valid OTP verification', () => {
    const result = otpVerifySchema.safeParse({
      phone: '+22462112345',
      otpCode: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('should transform 8-digit phone to +224 format', () => {
    const result = otpVerifySchema.safeParse({
      phone: '62112345',
      otpCode: '123456',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('+22462112345')
    }
  })

  it('should reject OTP code shorter than 6 digits', () => {
    const result = otpVerifySchema.safeParse({
      phone: '+22462112345',
      otpCode: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('should reject OTP code longer than 6 digits', () => {
    const result = otpVerifySchema.safeParse({
      phone: '+22462112345',
      otpCode: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing otpCode', () => {
    const result = otpVerifySchema.safeParse({
      phone: '+22462112345',
    })
    expect(result.success).toBe(false)
  })
})

describe('csrfTokenSchema', () => {
  it('should validate non-empty CSRF token', () => {
    const result = csrfTokenSchema.safeParse({
      csrfToken: 'abc-123-csrf-token',
    })
    expect(result.success).toBe(true)
  })

  it('should reject empty CSRF token', () => {
    const result = csrfTokenSchema.safeParse({
      csrfToken: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing CSRF token', () => {
    const result = csrfTokenSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('loginSchema', () => {
  it('should validate valid login credentials', () => {
    const result = loginSchema.safeParse({
      email: 'admin@healthflow.gn',
      password: 'SecurePass1',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = loginSchema.safeParse({
      email: 'not-an-email',
      password: 'SecurePass1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password shorter than 8 characters', () => {
    const result = loginSchema.safeParse({
      email: 'admin@healthflow.gn',
      password: 'Short1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password longer than 128 characters', () => {
    const result = loginSchema.safeParse({
      email: 'admin@healthflow.gn',
      password: 'A'.repeat(129) + '1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing email', () => {
    const result = loginSchema.safeParse({
      password: 'SecurePass1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing password', () => {
    const result = loginSchema.safeParse({
      email: 'admin@healthflow.gn',
    })
    expect(result.success).toBe(false)
  })
})

describe('patientLoginSchema', () => {
  it('should validate valid patient login', () => {
    const result = patientLoginSchema.safeParse({
      phone: '+22462112345',
      otpCode: '654321',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid phone', () => {
    const result = patientLoginSchema.safeParse({
      phone: '123',
      otpCode: '654321',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid OTP', () => {
    const result = patientLoginSchema.safeParse({
      phone: '+22462112345',
      otpCode: 'abc',
    })
    expect(result.success).toBe(false)
  })
})

describe('mfaSetupSchema', () => {
  it('should validate TOTP MFA setup', () => {
    const result = mfaSetupSchema.safeParse({
      method: 'TOTP',
    })
    expect(result.success).toBe(true)
  })

  it('should validate SMS MFA setup with phone', () => {
    const result = mfaSetupSchema.safeParse({
      method: 'SMS',
      phoneNumber: '+22462112345',
    })
    expect(result.success).toBe(true)
  })

  it('should validate EMAIL MFA setup', () => {
    const result = mfaSetupSchema.safeParse({
      method: 'EMAIL',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid MFA method', () => {
    const result = mfaSetupSchema.safeParse({
      method: 'INVALID',
    })
    expect(result.success).toBe(false)
  })
})

describe('mfaVerifySchema', () => {
  it('should validate valid MFA verification', () => {
    const result = mfaVerifySchema.safeParse({
      code: '123456',
      method: 'TOTP',
    })
    expect(result.success).toBe(true)
  })

  it('should reject code not exactly 6 characters', () => {
    const result = mfaVerifySchema.safeParse({
      code: '12345',
      method: 'TOTP',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid method', () => {
    const result = mfaVerifySchema.safeParse({
      code: '123456',
      method: 'PUSH',
    })
    expect(result.success).toBe(false)
  })
})

describe('mfaBackupCodeSchema', () => {
  it('should accept valid backup code (8-16 chars)', () => {
    const result = mfaBackupCodeSchema.safeParse({
      backupCode: 'ABCD1234',
    })
    expect(result.success).toBe(true)
  })

  it('should reject backup code shorter than 8 characters', () => {
    const result = mfaBackupCodeSchema.safeParse({
      backupCode: 'ABC123',
    })
    expect(result.success).toBe(false)
  })

  it('should reject backup code longer than 16 characters', () => {
    const result = mfaBackupCodeSchema.safeParse({
      backupCode: 'ABCDEFGHIJKLMNOPQ',
    })
    expect(result.success).toBe(false)
  })
})

describe('passwordResetRequestSchema', () => {
  it('should validate valid email', () => {
    const result = passwordResetRequestSchema.safeParse({
      email: 'admin@healthflow.gn',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = passwordResetRequestSchema.safeParse({
      email: 'bad-email',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing email', () => {
    const result = passwordResetRequestSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('passwordResetSchema', () => {
  const validData = {
    token: 'reset-token-abc',
    newPassword: 'NewSecure1',
    confirmPassword: 'NewSecure1',
  }

  it('should validate matching passwords with complexity requirements', () => {
    const result = passwordResetSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should reject when passwords do not match', () => {
    const result = passwordResetSchema.safeParse({
      ...validData,
      confirmPassword: 'Different1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without uppercase', () => {
    const result = passwordResetSchema.safeParse({
      ...validData,
      newPassword: 'nolower1',
      confirmPassword: 'nolower1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without lowercase', () => {
    const result = passwordResetSchema.safeParse({
      ...validData,
      newPassword: 'NOLOWER1',
      confirmPassword: 'NOLOWER1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without digit', () => {
    const result = passwordResetSchema.safeParse({
      ...validData,
      newPassword: 'NoDigitHere',
      confirmPassword: 'NoDigitHere',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password shorter than 8 characters', () => {
    const result = passwordResetSchema.safeParse({
      ...validData,
      newPassword: 'Sh1',
      confirmPassword: 'Sh1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty token', () => {
    const result = passwordResetSchema.safeParse({
      ...validData,
      token: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing confirmPassword', () => {
    const { confirmPassword, ...without } = validData
    const result = passwordResetSchema.safeParse(without)
    expect(result.success).toBe(false)
  })
})

describe('authUserCreateSchema', () => {
  const validData = {
    email: 'staff@healthflow.gn',
    password: 'StaffPass1',
    firstName: 'Amadou',
    lastName: 'Diallo',
    phone: '+22462112345',
    roleId: 'role-001',
    establishmentId: 'est-001',
  }

  it('should validate complete user creation data', () => {
    const result = authUserCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should validate without optional phone', () => {
    const { phone, ...without } = validData
    const result = authUserCreateSchema.safeParse(without)
    expect(result.success).toBe(true)
  })

  it('should accept empty string for phone', () => {
    const result = authUserCreateSchema.safeParse({
      ...validData,
      phone: '',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = authUserCreateSchema.safeParse({
      ...validData,
      email: 'not-email',
    })
    expect(result.success).toBe(false)
  })

  it('should reject password without uppercase', () => {
    const result = authUserCreateSchema.safeParse({
      ...validData,
      password: 'alllower1',
    })
    expect(result.success).toBe(false)
  })

  it('should reject short firstName', () => {
    const result = authUserCreateSchema.safeParse({
      ...validData,
      firstName: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('should reject short lastName', () => {
    const result = authUserCreateSchema.safeParse({
      ...validData,
      lastName: 'D',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing roleId', () => {
    const { roleId, ...without } = validData
    const result = authUserCreateSchema.safeParse(without)
    expect(result.success).toBe(false)
  })

  it('should reject missing establishmentId', () => {
    const { establishmentId, ...without } = validData
    const result = authUserCreateSchema.safeParse(without)
    expect(result.success).toBe(false)
  })
})

describe('authUserUpdateSchema', () => {
  it('should validate partial update', () => {
    const result = authUserUpdateSchema.safeParse({
      firstName: 'Updated',
    })
    expect(result.success).toBe(true)
  })

  it('should validate setting isActive', () => {
    const result = authUserUpdateSchema.safeParse({
      isActive: false,
    })
    expect(result.success).toBe(true)
  })

  it('should validate with phone as empty string', () => {
    const result = authUserUpdateSchema.safeParse({
      phone: '',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = authUserUpdateSchema.safeParse({
      email: 'not-valid',
    })
    expect(result.success).toBe(false)
  })

  it('should reject short firstName', () => {
    const result = authUserUpdateSchema.safeParse({
      firstName: 'X',
    })
    expect(result.success).toBe(false)
  })

  it('should allow empty update object', () => {
    const result = authUserUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})
