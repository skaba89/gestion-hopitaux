import { NextRequest, NextResponse } from 'next/server'
import { z } from 'zod'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { generateSecureToken } from '@/lib/security'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { teleconsultationCreateSchema } from '@/lib/validations/telemedicine'
import { optionalDateTransform } from '@/lib/validations/common'

// Extended schema for POST — includes followUp fields not in base create schema
const teleconsultationInputSchema = teleconsultationCreateSchema.extend({
  followUpNeeded: z.boolean().default(false),
  followUpDate: optionalDateTransform,
})

// GET /api/teleconsultation - List teleconsultation sessions
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const patientId = searchParams.get('patientId') || ''
      const doctorId = searchParams.get('doctorId') || ''
      const status = searchParams.get('status') || ''
      const type = searchParams.get('type') || ''
      const dateFrom = searchParams.get('dateFrom') || ''
      const dateTo = searchParams.get('dateTo') || ''

      const where: Record<string, unknown> = {}

      if (patientId) where.patientId = patientId
      if (doctorId) where.doctorId = doctorId
      if (status) where.status = status
      if (type) where.type = type

      if (dateFrom || dateTo) {
        const dateFilter: Record<string, Date> = {}
        if (dateFrom) dateFilter.gte = new Date(dateFrom)
        if (dateTo) dateFilter.lte = new Date(dateTo)
        where.scheduledAt = dateFilter
      }

      const [sessions, total] = await Promise.all([
        db.teleconsultation.findMany({
          where,
          skip,
          take,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
            doctor: { select: { id: true, firstName: true, lastName: true, specialization: true, avatarUrl: true } },
            sharedDocuments: {
              select: { id: true, fileName: true, fileUrl: true, accessLevel: true, createdAt: true },
            },
          },
          orderBy: { scheduledAt: 'desc' },
        }),
        db.teleconsultation.count({ where }),
      ])

      return paginatedResponse(sessions, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch teleconsultations'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'teleconsultations', action: 'READ' },
  })(request)
}

// POST /api/teleconsultation - Create teleconsultation session
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()
      const validated = teleconsultationInputSchema.parse(body)
      const meetingId = `TC-${Date.now()}`

      const session = await db.teleconsultation.create({
        data: {
          patientId: validated.patientId,
          doctorId: validated.doctorId,
          establishmentId: validated.establishmentId,
          scheduledAt: validated.scheduledAt,
          type: validated.type,
          status: validated.status,
          meetingUrl: validated.meetingUrl,
          meetingId,
          meetingPassword: validated.meetingPassword || generateSecureToken(4),
          chiefComplaint: validated.chiefComplaint,
          followUpNeeded: validated.followUpNeeded,
          followUpDate: validated.followUpDate,
          notes: validated.notes,
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
          doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
        },
      })

      return paginatedResponse([session], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Données invalides', details: err.errors },
          { status: 400 }
        )
      }
      const message = err instanceof Error ? err.message : 'Failed to create teleconsultation'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'teleconsultations', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
