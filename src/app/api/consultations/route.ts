import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/consultations - List consultations
export async function GET(request: NextRequest) {
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
}

// POST /api/consultations - Create consultation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const consultation = await db.consultation.create({
      data: {
        appointmentId: body.appointmentId,
        patientId: body.patientId,
        doctorId: body.doctorId,
        establishmentId: body.establishmentId,
        consultationDate: body.consultationDate ? new Date(body.consultationDate) : undefined,
        chiefComplaint: body.chiefComplaint,
        historyOfPresentIllness: body.historyOfPresentIllness,
        physicalExamination: body.physicalExamination,
        diagnosis: body.diagnosis,
        differentialDiagnosis: body.differentialDiagnosis,
        treatmentPlan: body.treatmentPlan,
        followUpInstructions: body.followUpInstructions,
        notes: body.notes,
        vitals: body.vitals ? JSON.stringify(body.vitals) : undefined,
        status: body.status || 'IN_PROGRESS',
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        doctor: { select: { id: true, firstName: true, lastName: true, specialization: true } },
      },
    })

    return paginatedResponse([consultation], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create consultation'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
