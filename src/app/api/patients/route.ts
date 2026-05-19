import { NextRequest, NextResponse } from 'next/server'
import crypto from 'crypto'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { patientRegistrationSchema } from '@/lib/validations/patient'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'

// GET /api/patients - List patients with search/filter/pagination
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const search = searchParams.get('search') || ''
      const gender = searchParams.get('gender') || ''
      const bloodType = searchParams.get('bloodType') || ''
      const establishmentId = searchParams.get('establishmentId') || ''
      const status = searchParams.get('status') || ''

      const where: Record<string, unknown> = {}

      if (search) {
        where.OR = [
          { firstName: { contains: search } },
          { lastName: { contains: search } },
          { phone: { contains: search } },
          { qrCode: { contains: search } },
          { nationalId: { contains: search } },
          { email: { contains: search } },
        ]
      }

      if (gender) where.gender = gender
      if (bloodType) where.bloodType = bloodType
      if (establishmentId) where.establishmentId = establishmentId
      if (status === 'active') where.isActive = true
      if (status === 'archived') where.isActive = false

      const [patients, total] = await Promise.all([
        db.patient.findMany({
          where,
          skip,
          take,
          include: {
            establishment: { select: { id: true, name: true } },
            allergies: { select: { id: true, allergen: true, severity: true } },
            antecedents: { select: { id: true, type: true, description: true, isChronic: true } },
            _count: {
              select: {
                appointments: true,
                consultations: true,
                labRequests: true,
                admissions: true,
              },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        db.patient.count({ where }),
      ])

      return paginatedResponse(patients, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch patients'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'patients', action: 'READ' },
  })(request)
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()
      const validated = patientRegistrationSchema.parse(body)

      // Generate QR code using crypto (imported at top)
      const qrCode = `PAT-${Date.now()}-${crypto.randomBytes(3).toString('hex').toUpperCase()}`

      const patient = await db.patient.create({
        data: {
          qrCode,
          firstName: validated.firstName,
          lastName: validated.lastName,
          dateOfBirth: validated.dateOfBirth,
          gender: validated.gender,
          nationalId: validated.nationalId,
          phone: validated.phone,
          email: validated.email || undefined,
          address: validated.address,
          city: validated.city,
          region: validated.region,
          country: 'Guinea',
          bloodType: validated.bloodType,
          emergencyContactName: validated.emergencyContactName,
          emergencyContactPhone: validated.emergencyContactPhone || undefined,
          primaryLanguage: validated.primaryLanguage,
          establishmentId: validated.establishmentId,
          isActive: true,
        },
        include: {
          establishment: { select: { id: true, name: true } },
        },
      })

      return paginatedResponse([patient], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Données invalides', details: err.errors },
          { status: 400 }
        )
      }
      const message = err instanceof Error ? err.message : 'Failed to create patient'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'patients', action: 'CREATE' },
  })(request)
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
