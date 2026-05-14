import { z } from 'zod'
import {
  patientRegistrationSchema,
  patientAccountRegistrationSchema,
  patientAccountLoginSchema,
  patientAccountVerifySchema,
  patientUpdateSchema,
  notificationPrefsSchema,
} from '@/lib/validations/patient'

// ============================================================================
// HealthFlow Guinea - Patient Validation Schema Tests
// ============================================================================

describe('patientRegistrationSchema', () => {
  const validData = {
    firstName: 'Amadou',
    lastName: 'Diallo',
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    phone: '+22462112345',
    email: 'amadou@example.com',
    nationalId: 'ID123456',
    address: 'Conakry, Kaloum',
    city: 'Conakry',
    region: 'Conakry',
    bloodType: 'O+',
    emergencyContactName: 'Fatou Diallo',
    emergencyContactPhone: '+22462198765',
    primaryLanguage: 'fr',
    establishmentId: 'est-001',
  }

  it('should validate a complete valid patient registration', () => {
    const result = patientRegistrationSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.firstName).toBe('Amadou')
      expect(result.data.lastName).toBe('Diallo')
      expect(result.data.gender).toBe('MALE')
      expect(result.data.phone).toBe('+22462112345')
      expect(result.data.establishmentId).toBe('est-001')
      expect(result.data.dateOfBirth).toBeInstanceOf(Date)
    }
  })

  it('should validate with minimum required fields', () => {
    const minimal = {
      firstName: 'Am',
      lastName: 'Di',
      dateOfBirth: '1990-01-01',
      gender: 'FEMALE',
      phone: '+22462112345',
      establishmentId: 'est-001',
    }
    const result = patientRegistrationSchema.safeParse(minimal)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.primaryLanguage).toBe('fr') // default
    }
  })

  it('should transform 8-digit phone to +224 format', () => {
    const data = {
      ...validData,
      phone: '62112345',
    }
    const result = patientRegistrationSchema.safeParse(data)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('+22462112345')
    }
  })

  it('should reject firstName shorter than 2 characters', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      firstName: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('should reject lastName shorter than 2 characters', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      lastName: 'D',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid gender values', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      gender: 'UNKNOWN',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid phone format', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      phone: '+1234567890',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid email format', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      email: 'not-an-email',
    })
    expect(result.success).toBe(false)
  })

  it('should allow empty string for email', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('should allow undefined email', () => {
    const { email, ...withoutEmail } = validData
    const result = patientRegistrationSchema.safeParse(withoutEmail)
    expect(result.success).toBe(true)
  })

  it('should accept valid blood types', () => {
    const bloodTypes = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
    for (const bt of bloodTypes) {
      const result = patientRegistrationSchema.safeParse({
        ...validData,
        bloodType: bt,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid blood type', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      bloodType: 'C+',
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid primary languages', () => {
    const languages = ['fr', 'en', 'msk', 'sus', 'ff']
    for (const lang of languages) {
      const result = patientRegistrationSchema.safeParse({
        ...validData,
        primaryLanguage: lang,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid primary language', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      primaryLanguage: 'de',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing establishmentId', () => {
    const { establishmentId, ...without } = validData
    const result = patientRegistrationSchema.safeParse(without)
    expect(result.success).toBe(false)
  })

  it('should reject empty establishmentId', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      establishmentId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should allow empty string for emergencyContactPhone', () => {
    const result = patientRegistrationSchema.safeParse({
      ...validData,
      emergencyContactPhone: '',
    })
    expect(result.success).toBe(true)
  })
})

describe('patientAccountRegistrationSchema', () => {
  const validData = {
    phone: '+22462112345',
    firstName: 'Amadou',
    lastName: 'Diallo',
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    preferredLanguage: 'fr',
    establishmentId: 'est-001',
  }

  it('should validate valid account registration', () => {
    const result = patientAccountRegistrationSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should transform 8-digit phone to +224 format', () => {
    const result = patientAccountRegistrationSchema.safeParse({
      ...validData,
      phone: '62112345',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('+22462112345')
    }
  })

  it('should default preferredLanguage to fr', () => {
    const { preferredLanguage, ...without } = validData
    const result = patientAccountRegistrationSchema.safeParse(without)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.preferredLanguage).toBe('fr')
    }
  })

  it('should reject invalid phone', () => {
    const result = patientAccountRegistrationSchema.safeParse({
      ...validData,
      phone: '1234',
    })
    expect(result.success).toBe(false)
  })

  it('should reject short firstName', () => {
    const result = patientAccountRegistrationSchema.safeParse({
      ...validData,
      firstName: 'A',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing establishmentId', () => {
    const { establishmentId, ...without } = validData
    const result = patientAccountRegistrationSchema.safeParse(without)
    expect(result.success).toBe(false)
  })
})

describe('patientAccountLoginSchema', () => {
  it('should validate valid login data', () => {
    const result = patientAccountLoginSchema.safeParse({
      phone: '+22462112345',
      otpCode: '123456',
    })
    expect(result.success).toBe(true)
  })

  it('should transform 8-digit phone to +224 format', () => {
    const result = patientAccountLoginSchema.safeParse({
      phone: '62112345',
      otpCode: '123456',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.phone).toBe('+22462112345')
    }
  })

  it('should reject OTP code shorter than 6 digits', () => {
    const result = patientAccountLoginSchema.safeParse({
      phone: '+22462112345',
      otpCode: '12345',
    })
    expect(result.success).toBe(false)
  })

  it('should reject OTP code longer than 6 digits', () => {
    const result = patientAccountLoginSchema.safeParse({
      phone: '+22462112345',
      otpCode: '1234567',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid phone', () => {
    const result = patientAccountLoginSchema.safeParse({
      phone: '123',
      otpCode: '123456',
    })
    expect(result.success).toBe(false)
  })
})

describe('patientAccountVerifySchema', () => {
  it('should validate valid verify data', () => {
    const result = patientAccountVerifySchema.safeParse({
      phone: '+22462112345',
      otpCode: '654321',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid OTP', () => {
    const result = patientAccountVerifySchema.safeParse({
      phone: '+22462112345',
      otpCode: 'abc',
    })
    expect(result.success).toBe(false)
  })
})

describe('patientUpdateSchema', () => {
  it('should validate a partial update', () => {
    const result = patientUpdateSchema.safeParse({
      firstName: 'Updated',
    })
    expect(result.success).toBe(true)
  })

  it('should validate updating multiple fields', () => {
    const result = patientUpdateSchema.safeParse({
      firstName: 'New',
      lastName: 'Name',
      address: 'New Address',
      city: 'Kankan',
      region: 'Kankan',
      emergencyContactName: 'Emergency',
      emergencyContactPhone: '+22462198765',
      primaryLanguage: 'en',
    })
    expect(result.success).toBe(true)
  })

  it('should allow empty update object', () => {
    const result = patientUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should reject firstName shorter than 2 characters', () => {
    const result = patientUpdateSchema.safeParse({
      firstName: 'X',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid email in update', () => {
    const result = patientUpdateSchema.safeParse({
      email: 'bad-email',
    })
    expect(result.success).toBe(false)
  })

  it('should allow empty string for email in update', () => {
    const result = patientUpdateSchema.safeParse({
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('should reject invalid primaryLanguage', () => {
    const result = patientUpdateSchema.safeParse({
      primaryLanguage: 'zh',
    })
    expect(result.success).toBe(false)
  })
})

describe('notificationPrefsSchema', () => {
  it('should validate with all default values', () => {
    const result = notificationPrefsSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sms).toBe(true)
      expect(result.data.whatsapp).toBe(false)
      expect(result.data.email).toBe(false)
      expect(result.data.appointmentReminder).toBe(true)
      expect(result.data.labResults).toBe(true)
      expect(result.data.vaccination).toBe(true)
    }
  })

  it('should validate explicit preferences', () => {
    const result = notificationPrefsSchema.safeParse({
      sms: false,
      whatsapp: true,
      email: true,
      appointmentReminder: false,
      labResults: false,
      vaccination: false,
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sms).toBe(false)
      expect(result.data.whatsapp).toBe(true)
    }
  })

  it('should reject non-boolean values', () => {
    const result = notificationPrefsSchema.safeParse({
      sms: 'yes',
    })
    expect(result.success).toBe(false)
  })
})
