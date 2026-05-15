import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { generateSecureToken } from '@/lib/security'

// GET /api/hospitalizations - List admissions
export async function GET(request: NextRequest) {
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
}

// POST /api/hospitalizations - Create admission
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const admissionNumber = `ADM-${Date.now()}-${generateSecureToken(4).toUpperCase()}`

    const admission = await db.admission.create({
      data: {
        admissionNumber,
        patientId: body.patientId,
        establishmentId: body.establishmentId,
        bedId: body.bedId,
        departmentId: body.departmentId,
        attendingDoctorId: body.attendingDoctorId,
        admittingDoctorId: body.admittingDoctorId,
        admissionDate: body.admissionDate ? new Date(body.admissionDate) : undefined,
        expectedDischargeDate: body.expectedDischargeDate ? new Date(body.expectedDischargeDate) : undefined,
        admissionType: body.admissionType || 'PLANNED',
        admissionReason: body.admissionReason,
        diagnosisAtAdmission: body.diagnosisAtAdmission,
        status: 'ADMITTED',
        notes: body.notes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        bed: { select: { id: true, number: true, room: { select: { number: true, name: true } } } },
      },
    })

    // Update bed status if bed assigned
    if (body.bedId) {
      await db.bed.update({
        where: { id: body.bedId },
        data: { status: 'OCCUPIED', currentAdmissionId: admission.id },
      })
    }

    return paginatedResponse([admission], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create admission'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
