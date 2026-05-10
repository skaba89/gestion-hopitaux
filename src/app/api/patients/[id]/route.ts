import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, corsHeaders } from '@/lib/api-utils'

// GET /api/patients/[id] - Get patient detail
export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        establishment: { select: { id: true, name: true, code: true } },
        allergies: { orderBy: { createdAt: 'desc' } },
        antecedents: { orderBy: { createdAt: 'desc' } },
        medicalDocuments: { orderBy: { createdAt: 'desc' } },
        appointments: {
          take: 10,
          orderBy: { appointmentDate: 'desc' },
          include: { doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } } },
        },
        consultations: {
          take: 10,
          orderBy: { consultationDate: 'desc' },
          include: { doctor: { select: { id: true, firstName: true, lastName: true } } },
        },
        labRequests: {
          take: 10,
          orderBy: { requestedAt: 'desc' },
          include: { requestingDoctor: { select: { id: true, firstName: true, lastName: true } } },
        },
        admissions: {
          take: 5,
          orderBy: { admissionDate: 'desc' },
        },
        emergencyCases: {
          take: 5,
          orderBy: { arrivalDate: 'desc' },
        },
        insurances: {
          include: { company: { select: { id: true, name: true, code: true } } },
        },
        invoices: {
          take: 10,
          orderBy: { invoiceDate: 'desc' },
        },
        pregnancies: {
          take: 5,
          orderBy: { createdAt: 'desc' },
        },
        teleconsultations: {
          take: 5,
          orderBy: { scheduledAt: 'desc' },
        },
        _count: {
          select: {
            appointments: true,
            consultations: true,
            labRequests: true,
            admissions: true,
            invoices: true,
            payments: true,
          },
        },
      },
    })

    if (!patient) {
      return errorResponse('Patient not found', 404)
    }

    return successResponse(patient)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch patient'
    return errorResponse(message, 500)
  }
}

// PUT /api/patients/[id] - Update patient
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const body = await request.json()

    const existingPatient = await db.patient.findUnique({ where: { id } })
    if (!existingPatient) {
      return errorResponse('Patient not found', 404)
    }

    const updateData: Record<string, unknown> = {}
    const updatableFields = [
      'firstName', 'lastName', 'dateOfBirth', 'gender', 'nationalId',
      'phone', 'email', 'address', 'city', 'region', 'country',
      'bloodType', 'rhFactor', 'maritalStatus', 'occupation',
      'emergencyContactName', 'emergencyContactPhone', 'emergencyContactRelation',
      'primaryLanguage', 'profilePhotoUrl', 'notes',
    ]

    for (const field of updatableFields) {
      if (body[field] !== undefined) {
        updateData[field] = field === 'dateOfBirth' ? new Date(body[field]) : body[field]
      }
    }

    const patient = await db.patient.update({
      where: { id },
      data: updateData,
      include: {
        establishment: { select: { id: true, name: true } },
        allergies: true,
        antecedents: true,
      },
    })

    return successResponse(patient, 'Patient updated successfully')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to update patient'
    return errorResponse(message, 500)
  }
}

// DELETE /api/patients/[id] - Archive patient (soft delete)
export async function DELETE(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params

    const existingPatient = await db.patient.findUnique({ where: { id } })
    if (!existingPatient) {
      return errorResponse('Patient not found', 404)
    }

    const patient = await db.patient.update({
      where: { id },
      data: { isActive: false },
    })

    return successResponse(patient, 'Patient archived successfully')
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to archive patient'
    return errorResponse(message, 500)
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
