import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/teleconsultation - List teleconsultation sessions
export async function GET(request: NextRequest) {
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
}

// POST /api/teleconsultation - Create teleconsultation session
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const meetingId = `TC-${Date.now()}`

    const session = await db.teleconsultation.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        establishmentId: body.establishmentId,
        scheduledAt: new Date(body.scheduledAt),
        type: body.type || 'VIDEO',
        status: body.status || 'SCHEDULED',
        meetingUrl: body.meetingUrl,
        meetingId,
        meetingPassword: body.meetingPassword || Math.random().toString(36).substring(2, 10),
        chiefComplaint: body.chiefComplaint,
        followUpNeeded: body.followUpNeeded || false,
        followUpDate: body.followUpDate ? new Date(body.followUpDate) : undefined,
        notes: body.notes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true, email: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
      },
    })

    return paginatedResponse([session], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create teleconsultation'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
