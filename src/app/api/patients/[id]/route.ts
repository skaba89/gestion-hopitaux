import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { successResponse, errorResponse, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { patientUpdateSchema } from '@/lib/validations/patient'

// GET /api/patients/[id] - Get patient detail (requires auth)
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
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
  }, {
    requireAuth: true,
    audit: { resource: 'patient', action: 'READ' },
  })(request)
}

// PUT /api/patients/[id] - Update patient (with Zod validation)
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { id } = await params
      const body = await request.json()

      // Zod validation — uses patientUpdateSchema from validations/patient.ts
      const validated = patientUpdateSchema.parse(body)

      const existingPatient = await db.patient.findUnique({ where: { id } })
      if (!existingPatient) {
        return errorResponse('Patient not found', 404)
      }

      // Build update data from validated fields only (no arbitrary field injection)
      const updateData: Record<string, unknown> = {}
      if (validated.firstName !== undefined) updateData.firstName = validated.firstName
      if (validated.lastName !== undefined) updateData.lastName = validated.lastName
      if (validated.email !== undefined) updateData.email = validated.email
      if (validated.address !== undefined) updateData.address = validated.address
      if (validated.city !== undefined) updateData.city = validated.city
      if (validated.region !== undefined) updateData.region = validated.region
      if (validated.emergencyContactName !== undefined) updateData.emergencyContactName = validated.emergencyContactName
      if (validated.emergencyContactPhone !== undefined) updateData.emergencyContactPhone = validated.emergencyContactPhone
      if (validated.primaryLanguage !== undefined) updateData.primaryLanguage = validated.primaryLanguage

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
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return errorResponse('Données invalides: ' + err.errors.map((e: any) => e.message).join(', '), 400)
      }
      const message = err instanceof Error ? err.message : 'Failed to update patient'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'patient' as any, action: 'update' as any },
    audit: { resource: 'patient', action: 'UPDATE' },
  })(request)
}

// DELETE /api/patients/[id] - Archive patient (soft delete) (requires admin)
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
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
  }, {
    requireAuth: true,
    permission: { resource: 'patient' as any, action: 'delete' as any },
    audit: { resource: 'patient', action: 'DELETE' },
  })(request)
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
