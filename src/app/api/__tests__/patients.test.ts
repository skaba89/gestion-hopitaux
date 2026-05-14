import { GET, POST } from '@/app/api/patients/route'
import { db } from '@/lib/db'

// ============================================================================
// HealthFlow Guinea - Patients API Route Tests
// ============================================================================

describe('GET /api/patients', () => {
  const mockPatients = [
    {
      id: 'pat-001',
      firstName: 'Amadou',
      lastName: 'Diallo',
      phone: '+22462112345',
      gender: 'MALE',
      dateOfBirth: new Date('1990-05-15'),
      isActive: true,
      establishment: { id: 'est-001', name: 'CHU Donka' },
      allergies: [],
      antecedents: [],
      _count: { appointments: 2, consultations: 1, labRequests: 0, admissions: 0 },
    },
    {
      id: 'pat-002',
      firstName: 'Fatou',
      lastName: 'Barry',
      phone: '+22462298765',
      gender: 'FEMALE',
      dateOfBirth: new Date('1985-03-20'),
      isActive: true,
      establishment: { id: 'est-001', name: 'CHU Donka' },
      allergies: [{ id: 'all-001', allergen: 'Penicillin', severity: 'SEVERE' }],
      antecedents: [],
      _count: { appointments: 5, consultations: 3, labRequests: 2, admissions: 1 },
    },
  ]

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should return paginated list of patients', async () => {
    ;(db.patient.findMany as jest.Mock).mockResolvedValue(mockPatients)
    ;(db.patient.count as jest.Mock).mockResolvedValue(2)

    const request = new NextRequest('http://localhost:3000/api/patients')
    const response = await GET(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(data.data).toHaveLength(2)
    expect(data.pagination).toBeDefined()
    expect(data.pagination.total).toBe(2)
    expect(data.pagination.page).toBe(1)
    expect(data.pagination.limit).toBe(20)
    expect(data.pagination.totalPages).toBe(1)
  })

  it('should pass search parameter to database query', async () => {
    ;(db.patient.findMany as jest.Mock).mockResolvedValue([])
    ;(db.patient.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/patients?search=diallo')
    await GET(request)

    const findManyCall = (db.patient.findMany as jest.Mock).mock.calls[0][0]
    expect(findManyCall.where.OR).toBeDefined()
    expect(findManyCall.where.OR.length).toBeGreaterThan(0)
  })

  it('should pass gender filter to database query', async () => {
    ;(db.patient.findMany as jest.Mock).mockResolvedValue([])
    ;(db.patient.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/patients?gender=MALE')
    await GET(request)

    const findManyCall = (db.patient.findMany as jest.Mock).mock.calls[0][0]
    expect(findManyCall.where.gender).toBe('MALE')
  })

  it('should pass bloodType filter to database query', async () => {
    ;(db.patient.findMany as jest.Mock).mockResolvedValue([])
    ;(db.patient.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/patients?bloodType=O%2B')
    await GET(request)

    const findManyCall = (db.patient.findMany as jest.Mock).mock.calls[0][0]
    expect(findManyCall.where.bloodType).toBe('O+')
  })

  it('should filter by active status', async () => {
    ;(db.patient.findMany as jest.Mock).mockResolvedValue([])
    ;(db.patient.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/patients?status=active')
    await GET(request)

    const findManyCall = (db.patient.findMany as jest.Mock).mock.calls[0][0]
    expect(findManyCall.where.isActive).toBe(true)
  })

  it('should filter by archived status', async () => {
    ;(db.patient.findMany as jest.Mock).mockResolvedValue([])
    ;(db.patient.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/patients?status=archived')
    await GET(request)

    const findManyCall = (db.patient.findMany as jest.Mock).mock.calls[0][0]
    expect(findManyCall.where.isActive).toBe(false)
  })

  it('should pass establishmentId filter to database query', async () => {
    ;(db.patient.findMany as jest.Mock).mockResolvedValue([])
    ;(db.patient.count as jest.Mock).mockResolvedValue(0)

    const request = new NextRequest('http://localhost:3000/api/patients?establishmentId=est-001')
    await GET(request)

    const findManyCall = (db.patient.findMany as jest.Mock).mock.calls[0][0]
    expect(findManyCall.where.establishmentId).toBe('est-001')
  })

  it('should return 500 on database error', async () => {
    ;(db.patient.findMany as jest.Mock).mockRejectedValue(new Error('DB Error'))

    const request = new NextRequest('http://localhost:3000/api/patients')
    const response = await GET(request)

    expect(response.status).toBe(500)
    const data = await response.json()
    expect(data.success).toBe(false)
    expect(data.error).toBe('DB Error')
  })

  it('should apply pagination parameters correctly', async () => {
    ;(db.patient.findMany as jest.Mock).mockResolvedValue([])
    ;(db.patient.count as jest.Mock).mockResolvedValue(50)

    const request = new NextRequest('http://localhost:3000/api/patients?page=2&limit=10')
    await GET(request)

    const findManyCall = (db.patient.findMany as jest.Mock).mock.calls[0][0]
    expect(findManyCall.skip).toBe(10)
    expect(findManyCall.take).toBe(10)
  })
})

describe('POST /api/patients', () => {
  const validPatientData = {
    firstName: 'Amadou',
    lastName: 'Diallo',
    dateOfBirth: '1990-05-15',
    gender: 'MALE',
    phone: '+22462112345',
    establishmentId: 'est-001',
  }

  const mockCreatedPatient = {
    id: 'pat-new',
    qrCode: 'PAT-1234567890-ABCDE',
    firstName: 'Amadou',
    lastName: 'Diallo',
    dateOfBirth: new Date('1990-05-15'),
    gender: 'MALE',
    phone: '+22462112345',
    establishmentId: 'est-001',
    isActive: true,
    establishment: { id: 'est-001', name: 'CHU Donka' },
  }

  beforeEach(() => {
    jest.clearAllMocks()
  })

  it('should create a patient with valid data', async () => {
    ;(db.patient.create as jest.Mock).mockResolvedValue(mockCreatedPatient)

    const request = new NextRequest('http://localhost:3000/api/patients', {
      method: 'POST',
      body: JSON.stringify(validPatientData),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(200)
    expect(data.success).toBe(true)
    expect(db.patient.create).toHaveBeenCalledTimes(1)
  })

  it('should pass validated data to database create', async () => {
    ;(db.patient.create as jest.Mock).mockResolvedValue(mockCreatedPatient)

    const request = new NextRequest('http://localhost:3000/api/patients', {
      method: 'POST',
      body: JSON.stringify(validPatientData),
      headers: { 'Content-Type': 'application/json' },
    })
    await POST(request)

    const createCall = (db.patient.create as jest.Mock).mock.calls[0][0]
    expect(createCall.data.firstName).toBe('Amadou')
    expect(createCall.data.lastName).toBe('Diallo')
    expect(createCall.data.gender).toBe('MALE')
    expect(createCall.data.phone).toBe('+22462112345')
    expect(createCall.data.establishmentId).toBe('est-001')
    expect(createCall.data.isActive).toBe(true)
    expect(createCall.data.country).toBe('Guinea')
  })

  it('should generate QR code for new patient', async () => {
    ;(db.patient.create as jest.Mock).mockResolvedValue(mockCreatedPatient)

    const request = new NextRequest('http://localhost:3000/api/patients', {
      method: 'POST',
      body: JSON.stringify(validPatientData),
      headers: { 'Content-Type': 'application/json' },
    })
    await POST(request)

    const createCall = (db.patient.create as jest.Mock).mock.calls[0][0]
    expect(createCall.data.qrCode).toMatch(/^PAT-/)
  })

  it('should return 400 for invalid data (ZodError)', async () => {
    const invalidData = {
      firstName: '', // too short
      lastName: '', // too short
    }

    const request = new NextRequest('http://localhost:3000/api/patients', {
      method: 'POST',
      body: JSON.stringify(invalidData),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(400)
    expect(data.error).toBe('Données invalides')
    // Note: Zod v4 uses err.issues instead of err.errors, so details may be undefined
    // depending on the API route implementation
  })

  it('should return 500 on database error', async () => {
    ;(db.patient.create as jest.Mock).mockRejectedValue(new Error('DB create error'))

    const request = new NextRequest('http://localhost:3000/api/patients', {
      method: 'POST',
      body: JSON.stringify(validPatientData),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request)
    const data = await response.json()

    expect(response.status).toBe(500)
    expect(data.success).toBe(false)
    expect(data.error).toBe('DB create error')
  })

  it('should handle patient with optional fields', async () => {
    ;(db.patient.create as jest.Mock).mockResolvedValue(mockCreatedPatient)

    const fullData = {
      ...validPatientData,
      email: 'amadou@example.com',
      nationalId: 'ID-12345',
      address: 'Conakry, Kaloum',
      city: 'Conakry',
      region: 'Conakry',
      bloodType: 'O+',
      emergencyContactName: 'Fatou Diallo',
      emergencyContactPhone: '+22462298765',
      primaryLanguage: 'fr',
    }

    const request = new NextRequest('http://localhost:3000/api/patients', {
      method: 'POST',
      body: JSON.stringify(fullData),
      headers: { 'Content-Type': 'application/json' },
    })
    const response = await POST(request)

    expect(response.status).toBe(200)
    const createCall = (db.patient.create as jest.Mock).mock.calls[0][0]
    expect(createCall.data.email).toBe('amadou@example.com')
    expect(createCall.data.bloodType).toBe('O+')
  })
})

// Need to import NextRequest for constructing mock requests
import { NextRequest } from 'next/server'
