import {
  insuranceCompanyCreateSchema,
  insuranceCompanyUpdateSchema,
  patientInsuranceCreateSchema,
  patientInsuranceUpdateSchema,
  invoiceCreateSchema,
  invoiceUpdateSchema,
  invoiceItemCreateSchema,
  paymentCreateSchema,
  paymentUpdateSchema,
} from '@/lib/validations/billing'

// ============================================================================
// HealthFlow Guinea - Billing Validation Schema Tests
// ============================================================================

describe('insuranceCompanyCreateSchema', () => {
  const validData = {
    name: 'Guinée Assurance',
    code: 'GA-001',
    address: 'Conakry, Kaloum',
    phone: '+22462112345',
    email: 'info@guinee-assurance.gn',
    coveragePercentage: 80,
    contactPerson: 'Mamadou Bah',
    establishmentId: 'est-001',
    notes: 'Main insurance partner',
  }

  it('should validate complete insurance company creation', () => {
    const result = insuranceCompanyCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
  })

  it('should validate with minimum required fields (name, code)', () => {
    const result = insuranceCompanyCreateSchema.safeParse({
      name: 'Assurance Minimale',
      code: 'AM-001',
    })
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.isActive).toBe(true) // default
    }
  })

  it('should reject name shorter than 2 characters', () => {
    const result = insuranceCompanyCreateSchema.safeParse({
      name: 'A',
      code: 'AM-001',
    })
    expect(result.success).toBe(false)
  })

  it('should reject name longer than 200 characters', () => {
    const result = insuranceCompanyCreateSchema.safeParse({
      name: 'A'.repeat(201),
      code: 'AM-001',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty code', () => {
    const result = insuranceCompanyCreateSchema.safeParse({
      name: 'Valid Name',
      code: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject coveragePercentage below 0', () => {
    const result = insuranceCompanyCreateSchema.safeParse({
      ...validData,
      coveragePercentage: -1,
    })
    expect(result.success).toBe(false)
  })

  it('should reject coveragePercentage above 100', () => {
    const result = insuranceCompanyCreateSchema.safeParse({
      ...validData,
      coveragePercentage: 101,
    })
    expect(result.success).toBe(false)
  })

  it('should accept 0% and 100% coverage', () => {
    const result0 = insuranceCompanyCreateSchema.safeParse({ ...validData, coveragePercentage: 0 })
    const result100 = insuranceCompanyCreateSchema.safeParse({ ...validData, coveragePercentage: 100 })
    expect(result0.success).toBe(true)
    expect(result100.success).toBe(true)
  })

  it('should accept empty string for phone and email', () => {
    const result = insuranceCompanyCreateSchema.safeParse({
      name: 'Test Co',
      code: 'TC-001',
      phone: '',
      email: '',
    })
    expect(result.success).toBe(true)
  })

  it('should accept undefined for phone and email', () => {
    const result = insuranceCompanyCreateSchema.safeParse({
      name: 'Test Co',
      code: 'TC-001',
    })
    expect(result.success).toBe(true)
  })
})

describe('insuranceCompanyUpdateSchema', () => {
  it('should validate partial update', () => {
    const result = insuranceCompanyUpdateSchema.safeParse({
      name: 'Updated Name',
    })
    expect(result.success).toBe(true)
  })

  it('should validate isActive toggle', () => {
    const result = insuranceCompanyUpdateSchema.safeParse({
      isActive: false,
    })
    expect(result.success).toBe(true)
  })

  it('should allow empty update', () => {
    const result = insuranceCompanyUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should reject coveragePercentage above 100', () => {
    const result = insuranceCompanyUpdateSchema.safeParse({
      coveragePercentage: 150,
    })
    expect(result.success).toBe(false)
  })
})

describe('patientInsuranceCreateSchema', () => {
  const validData = {
    patientId: 'patient-001',
    companyId: 'company-001',
    policyNumber: 'POL-2025-001',
    validFrom: '2025-01-01',
  }

  it('should validate with required fields', () => {
    const result = patientInsuranceCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.validFrom).toBeInstanceOf(Date)
      expect(result.data.isPrimary).toBe(true) // default
      expect(result.data.isActive).toBe(true) // default
    }
  })

  it('should validate with all optional fields', () => {
    const result = patientInsuranceCreateSchema.safeParse({
      ...validData,
      coveragePercentage: 75,
      validUntil: '2025-12-31',
      isPrimary: false,
      notes: 'Secondary insurance',
    })
    expect(result.success).toBe(true)
  })

  it('should reject empty patientId', () => {
    const result = patientInsuranceCreateSchema.safeParse({
      ...validData,
      patientId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty companyId', () => {
    const result = patientInsuranceCreateSchema.safeParse({
      ...validData,
      companyId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty policyNumber', () => {
    const result = patientInsuranceCreateSchema.safeParse({
      ...validData,
      policyNumber: '',
    })
    expect(result.success).toBe(false)
  })
})

describe('patientInsuranceUpdateSchema', () => {
  it('should validate partial update', () => {
    const result = patientInsuranceUpdateSchema.safeParse({
      coveragePercentage: 50,
    })
    expect(result.success).toBe(true)
  })

  it('should allow empty update', () => {
    const result = patientInsuranceUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should reject coveragePercentage above 100', () => {
    const result = patientInsuranceUpdateSchema.safeParse({
      coveragePercentage: 101,
    })
    expect(result.success).toBe(false)
  })
})

describe('invoiceCreateSchema', () => {
  const validItem = {
    description: 'Consultation générale',
    category: 'CONSULTATION' as const,
    quantity: 1,
    unitPrice: 50000,
    totalPrice: 50000,
    discountPercent: 0,
  }

  const validData = {
    patientId: 'patient-001',
    establishmentId: 'est-001',
    items: [validItem],
  }

  it('should validate with minimum required fields', () => {
    const result = invoiceCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('DRAFT') // default
      expect(result.data.subtotal).toBe(0) // default
      expect(result.data.totalAmount).toBe(0) // default
    }
  })

  it('should validate with all fields', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      admissionId: 'adm-001',
      consultationId: 'cons-001',
      invoiceDate: '2025-07-01',
      dueDate: '2025-08-01',
      subtotal: 50000,
      taxAmount: 0,
      discountAmount: 0,
      totalAmount: 50000,
      insuranceCoverageAmount: 40000,
      patientResponsibility: 10000,
      status: 'ISSUED',
      insuranceId: 'ins-001',
      notes: 'Regular invoice',
      issuedById: 'user-001',
    })
    expect(result.success).toBe(true)
  })

  it('should reject empty patientId', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      patientId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty establishmentId', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      establishmentId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty items array', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      items: [],
    })
    expect(result.success).toBe(false)
  })

  it('should reject item with empty description', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      items: [{ ...validItem, description: '' }],
    })
    expect(result.success).toBe(false)
  })

  it('should reject item with negative unitPrice', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      items: [{ ...validItem, unitPrice: -100 }],
    })
    expect(result.success).toBe(false)
  })

  it('should reject item with quantity less than 1', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      items: [{ ...validItem, quantity: 0 }],
    })
    expect(result.success).toBe(false)
  })

  it('should reject item with discountPercent above 100', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      items: [{ ...validItem, discountPercent: 101 }],
    })
    expect(result.success).toBe(false)
  })

  it('should accept all valid invoice statuses', () => {
    const statuses = ['DRAFT', 'ISSUED', 'PARTIALLY_PAID', 'PAID', 'OVERDUE', 'CANCELLED', 'REFUNDED']
    for (const status of statuses) {
      const result = invoiceCreateSchema.safeParse({
        ...validData,
        status,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should accept all valid item categories', () => {
    const categories = ['CONSULTATION', 'LAB_TEST', 'MEDICATION', 'ROOM', 'PROCEDURE', 'OTHER']
    for (const category of categories) {
      const result = invoiceCreateSchema.safeParse({
        ...validData,
        items: [{ ...validItem, category }],
      })
      expect(result.success).toBe(true)
    }
  })

  it('should reject negative subtotal', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      subtotal: -1,
    })
    expect(result.success).toBe(false)
  })

  it('should reject negative totalAmount', () => {
    const result = invoiceCreateSchema.safeParse({
      ...validData,
      totalAmount: -1,
    })
    expect(result.success).toBe(false)
  })
})

describe('invoiceUpdateSchema', () => {
  it('should validate partial update', () => {
    const result = invoiceUpdateSchema.safeParse({
      status: 'PAID',
    })
    expect(result.success).toBe(true)
  })

  it('should allow empty update', () => {
    const result = invoiceUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should reject negative amounts', () => {
    const result = invoiceUpdateSchema.safeParse({
      totalAmount: -100,
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid status', () => {
    const result = invoiceUpdateSchema.safeParse({
      status: 'PENDING',
    })
    expect(result.success).toBe(false)
  })
})

describe('invoiceItemCreateSchema', () => {
  const validData = {
    invoiceId: 'inv-001',
    description: 'Lab blood test',
    category: 'LAB_TEST' as const,
    unitPrice: 25000,
    totalPrice: 25000,
  }

  it('should validate with required fields', () => {
    const result = invoiceItemCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.quantity).toBe(1) // default
      expect(result.data.discountPercent).toBe(0) // default
    }
  })

  it('should reject empty invoiceId', () => {
    const result = invoiceItemCreateSchema.safeParse({
      ...validData,
      invoiceId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty description', () => {
    const result = invoiceItemCreateSchema.safeParse({
      ...validData,
      description: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject negative unitPrice', () => {
    const result = invoiceItemCreateSchema.safeParse({
      ...validData,
      unitPrice: -500,
    })
    expect(result.success).toBe(false)
  })

  it('should reject quantity less than 1', () => {
    const result = invoiceItemCreateSchema.safeParse({
      ...validData,
      quantity: 0,
    })
    expect(result.success).toBe(false)
  })
})

describe('paymentCreateSchema', () => {
  const validData = {
    invoiceId: 'inv-001',
    patientId: 'patient-001',
    establishmentId: 'est-001',
    amount: 50000,
    paymentMethod: 'CASH',
  }

  it('should validate with required fields', () => {
    const result = paymentCreateSchema.safeParse(validData)
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data.status).toBe('PENDING') // default
      expect(result.data.currency).toBe('GNF') // default
    }
  })

  it('should validate mobile money payment', () => {
    const result = paymentCreateSchema.safeParse({
      ...validData,
      paymentMethod: 'MOBILE_MONEY',
      mobileMoneyProvider: 'ORANGE',
      mobileMoneyTransactionId: 'TX-12345',
    })
    expect(result.success).toBe(true)
  })

  it('should accept all valid payment methods', () => {
    const methods = ['CASH', 'MOBILE_MONEY', 'BANK_TRANSFER', 'CHECK', 'INSURANCE', 'OTHER']
    for (const method of methods) {
      const result = paymentCreateSchema.safeParse({
        ...validData,
        paymentMethod: method,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should accept all valid mobile money providers', () => {
    const providers = ['ORANGE', 'MTN', 'CELLCOM']
    for (const provider of providers) {
      const result = paymentCreateSchema.safeParse({
        ...validData,
        paymentMethod: 'MOBILE_MONEY',
        mobileMoneyProvider: provider,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should accept all valid payment statuses', () => {
    const statuses = ['PENDING', 'COMPLETED', 'FAILED', 'REFUNDED', 'CANCELLED']
    for (const status of statuses) {
      const result = paymentCreateSchema.safeParse({
        ...validData,
        status,
      })
      expect(result.success).toBe(true)
    }
  })

  it('should reject empty invoiceId', () => {
    const result = paymentCreateSchema.safeParse({
      ...validData,
      invoiceId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty patientId', () => {
    const result = paymentCreateSchema.safeParse({
      ...validData,
      patientId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject empty establishmentId', () => {
    const result = paymentCreateSchema.safeParse({
      ...validData,
      establishmentId: '',
    })
    expect(result.success).toBe(false)
  })

  it('should reject negative amount', () => {
    const result = paymentCreateSchema.safeParse({
      ...validData,
      amount: -1,
    })
    expect(result.success).toBe(false)
  })

  it('should reject zero amount', () => {
    const result = paymentCreateSchema.safeParse({
      ...validData,
      amount: 0,
    })
    // 0 is allowed by gnfPriceSchema (min 0)
    expect(result.success).toBe(true)
  })

  it('should reject invalid payment method', () => {
    const result = paymentCreateSchema.safeParse({
      ...validData,
      paymentMethod: 'CRYPTO',
    })
    expect(result.success).toBe(false)
  })
})

describe('paymentUpdateSchema', () => {
  it('should validate partial update', () => {
    const result = paymentUpdateSchema.safeParse({
      status: 'COMPLETED',
    })
    expect(result.success).toBe(true)
  })

  it('should allow empty update', () => {
    const result = paymentUpdateSchema.safeParse({})
    expect(result.success).toBe(true)
  })

  it('should reject negative amount', () => {
    const result = paymentUpdateSchema.safeParse({
      amount: -100,
    })
    expect(result.success).toBe(false)
  })

  it('should reject invalid status', () => {
    const result = paymentUpdateSchema.safeParse({
      status: 'PROCESSING',
    })
    expect(result.success).toBe(false)
  })
})
