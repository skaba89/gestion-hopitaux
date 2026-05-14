import {
  guineaPhone,
  optionalGuineaPhone,
  paginationSchema,
  paginationWithOffsetSchema,
  idParamSchema,
  dateRangeSchema,
  sortSchema,
  searchSchema,
  gnfPriceSchema,
  optionalGnfPriceSchema,
  positiveIntSchema,
  idRefSchema,
  timeStringSchema,
  emailSchema,
  optionalEmailSchema,
  severitySchema,
  actionSchema,
  statusSchema,
  listQuerySchema,
} from '@/lib/validations/common'

// ============================================================================
// HealthFlow Guinea - Common Validation Schema Tests
// ============================================================================

describe('guineaPhone', () => {
  it('should accept +224 followed by 8 digits', () => {
    const result = guineaPhone.safeParse('+22462112345')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('+22462112345')
    }
  })

  it('should accept just 8 digits and transform to +224 format', () => {
    const result = guineaPhone.safeParse('62112345')
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toBe('+22462112345')
    }
  })

  it('should reject phone with wrong country code', () => {
    const result = guineaPhone.safeParse('+22562112345')
    expect(result.success).toBe(false)
  })

  it('should reject phone with too few digits after +224', () => {
    const result = guineaPhone.safeParse('+2246211234')
    expect(result.success).toBe(false)
  })

  it('should reject phone with too many digits after +224', () => {
    const result = guineaPhone.safeParse('+224621123456')
    expect(result.success).toBe(false)
  })

  it('should reject phone with letters', () => {
    const result = guineaPhone.safeParse('+224abcd1234')
    expect(result.success).toBe(false)
  })

  it('should reject empty string', () => {
    const result = guineaPhone.safeParse('')
    expect(result.success).toBe(false)
  })

  it('should reject 7 digits without country code', () => {
    const result = guineaPhone.safeParse('6211234')
    expect(result.success).toBe(false)
  })

  it('should reject 9 digits without country code', () => {
    const result = guineaPhone.safeParse('621123456')
    expect(result.success).toBe(false)
  })
})

describe('optionalGuineaPhone', () => {
  it('should accept valid +224 phone', () => {
    const result = optionalGuineaPhone.safeParse('+22462112345')
    expect(result.success).toBe(true)
  })

  it('should accept undefined', () => {
    const result = optionalGuineaPhone.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should accept empty string', () => {
    const result = optionalGuineaPhone.safeParse('')
    expect(result.success).toBe(true)
  })

  it('should reject invalid phone', () => {
    const result = optionalGuineaPhone.safeParse('+1234567890')
    expect(result.success).toBe(false)
  })
})

describe('paginationSchema', () => {
  it('should use default values when no input provided', () => {
    const result = paginationSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(20)
    }
  })

  it('should coerce string values to numbers', () => {
    const result = paginationSchema.safeParse({ page: '3', pageSize: '50' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(3)
      expect(result.data.pageSize).toBe(50)
    }
  })

  it('should reject page less than 1', () => {
    const result = paginationSchema.safeParse({ page: 0 })
    expect(result.success).toBe(false)
  })

  it('should reject pageSize less than 1', () => {
    const result = paginationSchema.safeParse({ pageSize: 0 })
    expect(result.success).toBe(false)
  })

  it('should reject pageSize greater than 100', () => {
    const result = paginationSchema.safeParse({ pageSize: 101 })
    expect(result.success).toBe(false)
  })

  it('should accept pageSize of 100', () => {
    const result = paginationSchema.safeParse({ pageSize: 100 })
    expect(result.success).toBe(true)
  })

  it('should accept page of 1', () => {
    const result = paginationSchema.safeParse({ page: 1 })
    expect(result.success).toBe(true)
  })
})

describe('paginationWithOffsetSchema', () => {
  it('should compute offset correctly for page 1', () => {
    const result = paginationWithOffsetSchema.safeParse({ page: 1, pageSize: 20 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.offset).toBe(0)
    }
  })

  it('should compute offset correctly for page 3 with pageSize 10', () => {
    const result = paginationWithOffsetSchema.safeParse({ page: 3, pageSize: 10 })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.offset).toBe(20)
    }
  })

  it('should compute offset with defaults', () => {
    const result = paginationWithOffsetSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.offset).toBe(0)
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(20)
    }
  })
})

describe('idParamSchema', () => {
  it('should accept a non-empty string id', () => {
    const result = idParamSchema.safeParse({ id: 'abc-123' })
    expect(result.success).toBe(true)
  })

  it('should reject empty string id', () => {
    const result = idParamSchema.safeParse({ id: '' })
    expect(result.success).toBe(false)
  })

  it('should reject missing id', () => {
    const result = idParamSchema.safeParse({})
    expect(result.success).toBe(false)
  })
})

describe('dateRangeSchema', () => {
  it('should validate with both dates', () => {
    const result = dateRangeSchema.safeParse({
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.startDate).toBeInstanceOf(Date)
      expect(result.data.endDate).toBeInstanceOf(Date)
    }
  })

  it('should validate with only startDate', () => {
    const result = dateRangeSchema.safeParse({
      startDate: '2025-01-01',
    })
    expect(result.success).toBe(true)
  })

  it('should validate with no dates', () => {
    const result = dateRangeSchema.safeParse({})
    expect(result.success).toBe(true)
  })
})

describe('sortSchema', () => {
  it('should default sortOrder to desc', () => {
    const result = sortSchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sortOrder).toBe('desc')
    }
  })

  it('should accept ascending sort order', () => {
    const result = sortSchema.safeParse({ sortOrder: 'asc' })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.sortOrder).toBe('asc')
    }
  })

  it('should accept sortBy field', () => {
    const result = sortSchema.safeParse({ sortBy: 'createdAt', sortOrder: 'desc' })
    expect(result.success).toBe(true)
  })

  it('should reject invalid sortOrder', () => {
    const result = sortSchema.safeParse({ sortOrder: 'random' })
    expect(result.success).toBe(false)
  })

  it('should reject empty sortBy', () => {
    const result = sortSchema.safeParse({ sortBy: '' })
    expect(result.success).toBe(false)
  })
})

describe('searchSchema', () => {
  it('should accept valid search string', () => {
    const result = searchSchema.safeParse({ search: 'diallo' })
    expect(result.success).toBe(true)
  })

  it('should accept empty object (optional)', () => {
    const result = searchSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should reject search longer than 200 characters', () => {
    const result = searchSchema.safeParse({ search: 'A'.repeat(201) })
    expect(result.success).toBe(false)
  })
})

describe('gnfPriceSchema', () => {
  it('should accept zero price', () => {
    const result = gnfPriceSchema.safeParse(0)
    expect(result.success).toBe(true)
  })

  it('should accept positive price', () => {
    const result = gnfPriceSchema.safeParse(50000)
    expect(result.success).toBe(true)
  })

  it('should reject negative price', () => {
    const result = gnfPriceSchema.safeParse(-1)
    expect(result.success).toBe(false)
  })
})

describe('optionalGnfPriceSchema', () => {
  it('should accept undefined', () => {
    const result = optionalGnfPriceSchema.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should accept positive price', () => {
    const result = optionalGnfPriceSchema.safeParse(1000)
    expect(result.success).toBe(true)
  })

  it('should reject negative price', () => {
    const result = optionalGnfPriceSchema.safeParse(-100)
    expect(result.success).toBe(false)
  })
})

describe('positiveIntSchema', () => {
  it('should accept zero', () => {
    const result = positiveIntSchema.safeParse(0)
    expect(result.success).toBe(true)
  })

  it('should accept positive integer', () => {
    const result = positiveIntSchema.safeParse(42)
    expect(result.success).toBe(true)
  })

  it('should reject negative integer', () => {
    const result = positiveIntSchema.safeParse(-1)
    expect(result.success).toBe(false)
  })

  it('should reject non-integer', () => {
    const result = positiveIntSchema.safeParse(3.5)
    expect(result.success).toBe(false)
  })
})

describe('idRefSchema', () => {
  it('should accept non-empty string', () => {
    const result = idRefSchema.safeParse('ref-123')
    expect(result.success).toBe(true)
  })

  it('should reject empty string', () => {
    const result = idRefSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('timeStringSchema', () => {
  it('should accept valid HH:mm format', () => {
    const times = ['00:00', '09:30', '12:00', '23:59']
    for (const time of times) {
      const result = timeStringSchema.safeParse(time)
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid time format', () => {
    const invalid = ['24:00', '12:60', '9:00 AM', 'abc', '12']
    for (const time of invalid) {
      const result = timeStringSchema.safeParse(time)
      expect(result.success).toBe(false)
    }
  })
})

describe('emailSchema', () => {
  it('should accept valid email', () => {
    const result = emailSchema.safeParse('test@example.com')
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = emailSchema.safeParse('not-an-email')
    expect(result.success).toBe(false)
  })
})

describe('optionalEmailSchema', () => {
  it('should accept valid email', () => {
    const result = optionalEmailSchema.safeParse('test@example.com')
    expect(result.success).toBe(true)
  })

  it('should accept undefined', () => {
    const result = optionalEmailSchema.safeParse(undefined)
    expect(result.success).toBe(true)
  })

  it('should accept empty string', () => {
    const result = optionalEmailSchema.safeParse('')
    expect(result.success).toBe(true)
  })

  it('should reject invalid email', () => {
    const result = optionalEmailSchema.safeParse('bad-email')
    expect(result.success).toBe(false)
  })
})

describe('severitySchema', () => {
  it('should accept valid severity levels', () => {
    const levels = ['INFO', 'WARNING', 'CRITICAL']
    for (const level of levels) {
      const result = severitySchema.safeParse(level)
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid severity', () => {
    const result = severitySchema.safeParse('DEBUG')
    expect(result.success).toBe(false)
  })
})

describe('actionSchema', () => {
  it('should accept valid actions', () => {
    const actions = ['CREATE', 'READ', 'UPDATE', 'DELETE', 'LOGIN', 'LOGOUT', 'PRINT', 'EXPORT']
    for (const action of actions) {
      const result = actionSchema.safeParse(action)
      expect(result.success).toBe(true)
    }
  })

  it('should reject invalid action', () => {
    const result = actionSchema.safeParse('PATCH')
    expect(result.success).toBe(false)
  })
})

describe('statusSchema', () => {
  it('should accept non-empty string', () => {
    const result = statusSchema.safeParse('ACTIVE')
    expect(result.success).toBe(true)
  })

  it('should reject empty string', () => {
    const result = statusSchema.safeParse('')
    expect(result.success).toBe(false)
  })
})

describe('listQuerySchema', () => {
  it('should validate with all fields', () => {
    const result = listQuerySchema.safeParse({
      page: 2,
      pageSize: 50,
      sortBy: 'createdAt',
      sortOrder: 'asc',
      search: 'test',
      startDate: '2025-01-01',
      endDate: '2025-12-31',
    })
    expect(result.success).toBe(true)
  })

  it('should validate with default values', () => {
    const result = listQuerySchema.safeParse({})
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.page).toBe(1)
      expect(result.data.pageSize).toBe(20)
      expect(result.data.sortOrder).toBe('desc')
    }
  })
})
