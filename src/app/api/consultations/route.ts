import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { consultationCreateSchema } from '@/lib/validations/consultation'

// GET /api/consultations - List consultations
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const patientId = searchParams.get('patientId') || ''
      const doctorId = searchParams.get('doctorId') || ''
      const status = searchParams.get('status') || ''
      const dateFrom = searchParams.get('dateFrom') || ''
      const dateTo = searchParams.get('dateTo') || ''

      const where: Record<string, unknown> = {}

      if (patientId) where.patientId = patientId
      if (doctorId) where.doctorId = doctorId
      if (status) where.status = status

      if (dateFrom || dateTo) {
        const dateFilter: Record<string, Date> = {}
        if (dateFrom) dateFilter.gte = new Date(dateFrom)
        if (dateTo) dateFilter.lte = new Date(dateTo)
        where.consultationDate = dateFilter
      }

      const [consultations, total] = await Promise.all([
        db.consultation.findMany({
          where,
          skip,
          take,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true, phone: true, qrCode: true } },
            doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
            prescriptions: {
              include: { items: true },
              take: 5,
              orderBy: { prescriptionDate: 'desc' },
            },
            labRequests: {
              take: 5,
              orderBy: { requestedAt: 'desc' },
              include: { items: { include: { testCatalog: true } } },
            },
            _count: { select: { reports: true } },
          },
          orderBy: { consultationDate: 'desc' },
        }),
        db.consultation.count({ where }),
      ])

      return paginatedResponse(consultations, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch consultations'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'consultations', action: 'READ' },
  })(request)
}

// POST /api/consultations - Create consultation
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()

      // Zod validation
      const validated = consultationCreateSchema.parse(body)

      const consultation = await db.consultation.create({
        data: {
          appointmentId: validated.appointmentId,
          patientId: validated.patientId,
          doctorId: validated.doctorId,
          establishmentId: validated.establishmentId,
          consultationDate: validated.consultationDate,
          chiefComplaint: validated.chiefComplaint,
          historyOfPresentIllness: validated.historyOfPresentIllness,
          physicalExamination: validated.physicalExamination,
          diagnosis: validated.diagnosis,
          differentialDiagnosis: validated.differentialDiagnosis,
          treatmentPlan: validated.treatmentPlan,
          followUpInstructions: validated.followUpInstructions,
          notes: validated.notes,
          vitals: validated.vitals,
          status: validated.status,
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
        },
      })

      return paginatedResponse([consultation], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Données invalides', details: err.errors },
          { status: 400 }
        )
      }
      // SECURITY: Don't leak internal error details
      console.error('[Consultations] Create error:', err)
      return errorResponse('Erreur lors de la création de la consultation', 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'consultations', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
