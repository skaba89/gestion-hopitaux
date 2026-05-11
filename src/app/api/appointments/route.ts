import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/appointments - List appointments by doctor/date/status
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip, take } = getPaginationParams(searchParams)
    const doctorId = searchParams.get('doctorId') || ''
    const patientId = searchParams.get('patientId') || ''
    const status = searchParams.get('status') || ''
    const date = searchParams.get('date') || ''
    const dateFrom = searchParams.get('dateFrom') || ''
    const dateTo = searchParams.get('dateTo') || ''
    const type = searchParams.get('type') || ''

    const where: Record<string, unknown> = {}

    if (doctorId) where.doctorId = doctorId
    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (type) where.type = type

    if (date) {
      const startOfDay = new Date(date)
      startOfDay.setHours(0, 0, 0, 0)
      const endOfDay = new Date(date)
      endOfDay.setHours(23, 59, 59, 999)
      where.appointmentDate = { gte: startOfDay, lte: endOfDay }
    } else if (dateFrom || dateTo) {
      const dateFilter: Record<string, Date> = {}
      if (dateFrom) dateFilter.gte = new Date(dateFrom)
      if (dateTo) dateFilter.lte = new Date(dateTo)
      where.appointmentDate = dateFilter
    }

    const [appointments, total] = await Promise.all([
      db.appointment.findMany({
        where,
        skip,
        take,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, phone: true, qrCode: true } },
          doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
        },
        orderBy: { appointmentDate: 'desc' },
      }),
      db.appointment.count({ where }),
    ])

    return paginatedResponse(appointments, total, page, limit)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch appointments'
    return errorResponse(message, 500)
  }
}

// POST /api/appointments - Create appointment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const appointment = await db.appointment.create({
      data: {
        patientId: body.patientId,
        doctorId: body.doctorId,
        establishmentId: body.establishmentId,
        appointmentDate: new Date(body.appointmentDate),
        startTime: body.startTime,
        endTime: body.endTime,
        duration: body.duration,
        type: body.type || 'CONSULTATION',
        status: body.status || 'SCHEDULED',
        reason: body.reason,
        notes: body.notes,
        reminderType: body.reminderType,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true, phone: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
      },
    })

    return paginatedResponse([appointment], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create appointment'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
