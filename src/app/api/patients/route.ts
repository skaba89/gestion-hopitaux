import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/patients - List patients with search/filter/pagination
export async function GET(request: NextRequest) {
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
}

// POST /api/patients - Create a new patient
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Generate QR code
    const qrCode = `PAT-${Date.now()}-${Math.random().toString(36).substring(2, 7).toUpperCase()}`

    const patient = await db.patient.create({
      data: {
        qrCode,
        firstName: body.firstName,
        lastName: body.lastName,
        dateOfBirth: new Date(body.dateOfBirth),
        gender: body.gender,
        nationalId: body.nationalId,
        phone: body.phone,
        email: body.email,
        address: body.address,
        city: body.city,
        region: body.region,
        country: body.country || 'Guinea',
        bloodType: body.bloodType,
        rhFactor: body.rhFactor,
        maritalStatus: body.maritalStatus,
        occupation: body.occupation,
        emergencyContactName: body.emergencyContactName,
        emergencyContactPhone: body.emergencyContactPhone,
        emergencyContactRelation: body.emergencyContactRelation,
        primaryLanguage: body.primaryLanguage || 'French',
        profilePhotoUrl: body.profilePhotoUrl,
        notes: body.notes,
        establishmentId: body.establishmentId,
        registeredById: body.registeredById,
        isActive: true,
      },
      include: {
        establishment: { select: { id: true, name: true } },
      },
    })

    return paginatedResponse([patient], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create patient'
    return errorResponse(message, 500)
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
