import {
  appointmentCreateSchema,
  appointmentUpdateSchema,
  doctorSlotsQuerySchema,
} from '@/lib/validations/appointment'

// ============================================================================
// HealthFlow Guinea - Appointment Validation Schema Tests
// ============================================================================

describe('appointmentCreateSchema', () => {
  const validData = {
    patientId: 'patient-001',
    doctorId: 'doctor-001',
    appointmentDate: '2025-07-15',
    startTime: '09:00',
    reason: 'Consultation générale',
    type: 'CONSULTATION',
  }

  it('should validate a complete valid appointment creation', () => {
    const result = appointmentCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.patientId).toBe('patient-001')
      expect(result.data.doctorId).toBe('doctor-001')
      expect(result.data.appointmentDate).toBeInstanceOf(Date)
      expect(result.data.type).toBe('CONSULTATION')
    }
  })

  it('should default type to CONSULTATION', () => {
    const { type, ...withoutType } = validData
    const result = appointmentCreateSchema.safeParse(withoutType)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.type).toBe('CONSULTATION')
    }
  })

  it('should validate with all optional fields', () => {
    const fullData = {
      ...validData,
      establishmentId: 'est-001',
      endTime: '10:00',
      duration: 60,
      notes: 'Patient notes here',
      reminderType: 'SMS',
    }
    const result = appointmentCreateSchema.safeParse(fullData)
    expect(result.success).toBe(true)
  })

  it('should accept all valid appointment types', () => {
    const types = ['CONSULTATION', 'FOLLOW_UP', 'EMERGENCY', 'TELECONSULTATION', 'CHECKUP']
    for (const type of types) {
      const result = appointmentCreateSchema.safeParse({ ...validData, type })
      expect(result.success).toBe(true)
    }
  })

  it('should accept all valid reminder types', () => {
    const reminderTypes = ['SMS', 'EMAIL', 'BOTH']
    for (const rt of reminderTypes) {
      const result = appointmentCreateSchema.safeParse({ ...validData, reminderType: rt })
      expect(result.success).toBe(true)
    }
  })

  it('should reject missing patientId', () => {
    const { patientId, ...without } = validData
    const result = appointmentCreateSchema.safeParse(without)
    expect(result.success).toBe(false)
  })

  it('should reject empty patientId', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      patientId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing doctorId', () => {
    const { doctorId, ...without } = validData
    const result = appointmentCreateSchema.safeParse(without)
    expect(result.success).toBe(false)
  })

  it('should reject empty doctorId', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      doctorId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid startTime format', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      startTime: '9:00 AM',
    })
    expect(result.success).toBe(false)
  })

  it('should accept valid HH:mm startTime formats', () => {
    const times = ['00:00', '09:00', '12:30', '23:59', '9:00']
    for (const time of times) {
      const result = appointmentCreateSchema.safeParse({
        ...validData,
        startTime: time,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid endTime format', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      endTime: '25:00',
    })
    expect(result.success).toBe(false)
  })

  it('should reject reason shorter than 3 characters', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      reason: 'AB',
    })
    expect(result.success).toBe(false)
  })

  it('should reject reason longer than 500 characters', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      reason: 'A'.repeat(501),
    })
    expect(result.success).toBe(false)
  })

  it('should reject duration less than 5', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      duration: 4,
    })
    expect(result.success).toBe(false)
  })

  it('should reject duration greater than 480', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      duration: 481,
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid appointment type', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      type: 'INVALID',
    })
    expect(result.success).toBe(false)
  })

  it('should reject notes longer than 1000 characters', () => {
    const result = appointmentCreateSchema.safeParse({
      ...validData,
      notes: 'N'.repeat(1001),
    })
    expect(result.success).toBe(false)
  })
})

describe('appointmentUpdateSchema', () => {
  it('should validate updating status only', () => {
    const result = appointmentUpdateSchema.safeParse({
      status: 'CONFIRMED',
    })
    expect(result.success).toBe(true)
  })

  it('should validate updating multiple fields', () => {
    const result = appointmentUpdateSchema.safeParse({
      status: 'RESCHEDULED',
      appointmentDate: '2025-08-01',
      startTime: '14:00',
      reason: 'Follow-up needed',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.appointmentDate).toBeInstanceOf(Date)
    }
  })

  it('should allow empty update object', () => {
    const result = appointmentUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should accept all valid status values', () => {
    const statuses = [
      'SCHEDULED', 'CONFIRMED', 'IN_PROGRESS', 'COMPLETED',
      'CANCELLED', 'NO_SHOW', 'RESCHEDULED',
    ]
    for (const status of statuses) {
      const result = appointmentUpdateSchema.safeParse({ status })
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid status', () => {
    const result = appointmentUpdateSchema.safeParse({
      status: 'PENDING',
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid startTime format', () => {
    const result = appointmentUpdateSchema.safeParse({
      startTime: 'not-a-time',
    })
    expect(result.success).toBe(false)
  })

  it('should validate cancellationReason', () => {
    const result = appointmentUpdateSchema.safeParse({
      status: 'CANCELLED',
      cancellationReason: 'Patient request',
    })
    expect(result.success).toBe(true)
  })

  it('should reject cancellationReason shorter than 3 characters', () => {
    const result = appointmentUpdateSchema.safeParse({
      cancellationReason: 'AB',
    })
    expect(result.success).toBe(false)
  })

  it('should reject duration out of range in update', () => {
    const result = appointmentUpdateSchema.safeParse({
      duration: 500,
    })
    expect(result.success).toBe(false)
  })
})

describe('doctorSlotsQuerySchema', () => {
  it('should validate valid query params', () => {
    const result = doctorSlotsQuerySchema.safeParse({
      doctorId: 'doctor-001',
      date: '2025-07-15',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.date).toBeInstanceOf(Date)
    }
  })

  it('should validate with optional establishmentId', () => {
    const result = doctorSlotsQuerySchema.safeParse({
      doctorId: 'doctor-001',
      date: '2025-07-15',
      establishmentId: 'est-001',
    })
    expect(result.success).toBe(true)
  })

  it('should reject missing doctorId', () => {
    const result = doctorSlotsQuerySchema.safeParse({
      date: '2025-07-15',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty doctorId', () => {
    const result = doctorSlotsQuerySchema.safeParse({
      doctorId: '',
      date: '2025-07-15',
    })
    expect(result.success).toBe(false)
  })

  it('should reject missing date', () => {
    const result = doctorSlotsQuerySchema.safeParse({
      doctorId: 'doctor-001',
    })
    expect(result.success).toBe(false)
  })
})
