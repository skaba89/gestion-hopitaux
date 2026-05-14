import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { emergencyCaseCreateSchema } from '@/lib/validations/hospitalization'

// GET /api/emergencies - List emergency cases
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const patientId = searchParams.get('patientId') || ''
      const status = searchParams.get('status') || ''
      const triageLevel = searchParams.get('triageLevel') || ''
      const establishmentId = searchParams.get('establishmentId') || ''
      const dateFrom = searchParams.get('dateFrom') || ''
      const dateTo = searchParams.get('dateTo') || ''

      const where: Record<string, unknown> = {}

      if (patientId) where.patientId = patientId
      if (status) where.status = status
      if (triageLevel) where.triageLevel = triageLevel
      if (establishmentId) where.establishmentId = establishmentId

      if (dateFrom || dateTo) {
        const dateFilter: Record<string, Date> = {}
        if (dateFrom) dateFilter.gte = new Date(dateFrom)
        if (dateTo) dateFilter.lte = new Date(dateTo)
        where.arrivalDate = dateFilter
      }

      const [emergencyCases, total] = await Promise.all([
        db.emergencyCase.findMany({
          where,
          skip,
          take,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true, phone: true, qrCode: true, bloodType: true, dateOfBirth: true } },
            doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
            triageAssessments: {
              take: 1,
              orderBy: { assessmentDate: 'desc' },
              include: {
                assessedBy: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { arrivalDate: 'desc' },
        }),
        db.emergencyCase.count({ where }),
      ])

      return paginatedResponse(emergencyCases, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch emergency cases'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'emergencies', action: 'READ' },
  })(request)
}

// POST /api/emergencies - Create emergency case
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()

      // Zod validation
      const validated = emergencyCaseCreateSchema.parse(body)
      const crypto = require('crypto')
      const caseNumber = `ERG-${Date.now()}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`

      const emergencyCase = await db.emergencyCase.create({
        data: {
          caseNumber,
          patientId: validated.patientId,
          establishmentId: validated.establishmentId,
          attendingDoctorId: validated.attendingDoctorId,
          arrivalDate: validated.arrivalDate,
          arrivalMode: validated.arrivalMode || 'WALK_IN',
          chiefComplaint: validated.chiefComplaint,
          triageLevel: validated.triageLevel || 'GREEN',
          triageScore: validated.triageScore,
          vitalSigns: validated.vitalSigns,
          status: validated.status || 'TRIAGE',
          diagnosis: validated.diagnosis,
          treatmentProvided: validated.treatmentProvided,
          notes: validated.notes,
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
        },
      })

      // Create triage assessment if provided
      if (body.triageAssessment) {
        await db.triageAssessment.create({
          data: {
            emergencyCaseId: emergencyCase.id,
            assessedById: body.triageAssessment.assessedById,
            chiefComplaint: body.chiefComplaint,
            painLevel: body.triageAssessment.painLevel,
            consciousness: body.triageAssessment.consciousness,
            temperature: body.triageAssessment.temperature,
            bloodPressureSystolic: body.triageAssessment.bloodPressureSystolic,
            bloodPressureDiastolic: body.triageAssessment.bloodPressureDiastolic,
            heartRate: body.triageAssessment.heartRate,
            respiratoryRate: body.triageAssessment.respiratoryRate,
            oxygenSaturation: body.triageAssessment.oxygenSaturation,
            triageLevel: body.triageLevel || 'GREEN',
            triageNotes: body.triageAssessment.triageNotes,
          },
        })
      }

      return paginatedResponse([emergencyCase], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Données invalides', details: err.errors },
          { status: 400 }
        )
      }
      // SECURITY: Don't leak internal error details
      console.error('[Emergencies] Create error:', err)
      return errorResponse('Erreur lors de la création du cas d\'urgence', 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'emergencies', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
