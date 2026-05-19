import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { admissionCreateSchema } from '@/lib/validations/hospitalization'
import { generateSecureToken } from '@/lib/security'

// GET /api/hospitalizations - List admissions
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const patientId = searchParams.get('patientId') || ''
      const status = searchParams.get('status') || ''
      const departmentId = searchParams.get('departmentId') || ''
      const establishmentId = searchParams.get('establishmentId') || ''
      const admissionType = searchParams.get('admissionType') || ''
      const dateFrom = searchParams.get('dateFrom') || ''
      const dateTo = searchParams.get('dateTo') || ''

      const where: Record<string, unknown> = {}

      if (patientId) where.patientId = patientId
      if (status) where.status = status
      if (departmentId) where.departmentId = departmentId
      if (establishmentId) where.establishmentId = establishmentId
      if (admissionType) where.admissionType = admissionType

      if (dateFrom || dateTo) {
        const dateFilter: Record<string, Date> = {}
        if (dateFrom) dateFilter.gte = new Date(dateFrom)
        if (dateTo) dateFilter.lte = new Date(dateTo)
        where.admissionDate = dateFilter
      }

      const [admissions, total] = await Promise.all([
        db.admission.findMany({
          where,
          skip,
          take,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true, phone: true, qrCode: true, bloodType: true } },
            bed: {
              select: { id: true, number: true, type: true, status: true, room: { select: { number: true, name: true, type: true } } },
            },
            trackingRecords: {
              take: 10,
              orderBy: { trackingDate: 'desc' },
            },
            _count: { select: { trackingRecords: true } },
          },
          orderBy: { admissionDate: 'desc' },
        }),
        db.admission.count({ where }),
      ])

      return paginatedResponse(admissions, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch hospitalizations'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'hospitalizations', action: 'READ' },
  })(request)
}

// POST /api/hospitalizations - Create admission
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()

      // Zod validation — uses admissionCreateSchema from validations/hospitalization.ts
      const validated = admissionCreateSchema.parse(body)

      const admissionNumber = `ADM-${Date.now()}-${generateSecureToken(4).toUpperCase()}`

      const admission = await db.admission.create({
        data: {
          admissionNumber,
          patientId: validated.patientId,
          establishmentId: validated.establishmentId,
          bedId: validated.bedId,
          departmentId: validated.departmentId,
          attendingDoctorId: validated.attendingDoctorId,
          admittingDoctorId: validated.admittingDoctorId,
          admissionDate: validated.admissionDate,
          expectedDischargeDate: validated.expectedDischargeDate,
          admissionType: validated.admissionType,
          admissionReason: validated.admissionReason,
          diagnosisAtAdmission: validated.diagnosisAtAdmission,
          status: 'ADMITTED',
          notes: validated.notes,
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          bed: { select: { id: true, number: true, room: { select: { number: true, name: true } } } },
        },
      })

      // Update bed status if bed assigned
      if (validated.bedId) {
        await db.bed.update({
          where: { id: validated.bedId },
          data: { status: 'OCCUPIED', currentAdmissionId: admission.id },
        })
      }

      return paginatedResponse([admission], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return errorResponse('Données invalides: ' + err.errors.map((e: any) => e.message).join(', '), 400)
      }
      console.error('[Hospitalizations] Create error:', err)
      return errorResponse('Erreur lors de la création de l\'admission', 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'hospitalizations' as any, action: 'create' as any },
    audit: { resource: 'hospitalizations', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
