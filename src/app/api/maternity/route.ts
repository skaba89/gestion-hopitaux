import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/maternity - List pregnancies
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip, take } = getPaginationParams(searchParams)
    const patientId = searchParams.get('patientId') || ''
    const status = searchParams.get('status') || ''
    const riskLevel = searchParams.get('riskLevel') || ''
    const establishmentId = searchParams.get('establishmentId') || ''
    const view = searchParams.get('view') || 'pregnancies' // pregnancies, deliveries, children

    // View: deliveries
    if (view === 'deliveries') {
      const delWhere: Record<string, unknown> = {}
      if (patientId) delWhere.pregnancy = { patientId }
      if (establishmentId) delWhere.establishmentId = establishmentId

      const [deliveries, total] = await Promise.all([
        db.delivery.findMany({
          where: delWhere,
          skip,
          take,
          include: {
            pregnancy: { include: { patient: { select: { id: true, firstName: true, lastName: true } } } },
            doctor: { select: { id: true, firstName: true, lastName: true } },
            children: true,
          },
          orderBy: { deliveryDate: 'desc' },
        }),
        db.delivery.count({ where: delWhere }),
      ])

      return paginatedResponse(deliveries, total, page, limit)
    }

    // View: children
    if (view === 'children') {
      const childWhere: Record<string, unknown> = {}
      if (patientId) childWhere.motherId = patientId

      const [children, total] = await Promise.all([
        db.child.findMany({
          where: childWhere,
          skip,
          take,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true } },
            delivery: { select: { id: true, deliveryDate: true, deliveryType: true } },
            vaccinations: {
              include: { schedule: { select: { name: true, vaccineName: true } } },
              orderBy: { vaccinationDate: 'desc' },
            },
          },
          orderBy: { createdAt: 'desc' },
        }),
        db.child.count({ where: childWhere }),
      ])

      return paginatedResponse(children, total, page, limit)
    }

    // Default view: pregnancies
    const where: Record<string, unknown> = {}

    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (riskLevel) where.riskLevel = riskLevel
    if (establishmentId) where.establishmentId = establishmentId

    const [pregnancies, total] = await Promise.all([
      db.pregnancyTracking.findMany({
        where,
        skip,
        take,
        include: {
          patient: { select: { id: true, firstName: true, lastName: true, phone: true, dateOfBirth: true } },
          visits: {
            take: 5,
            orderBy: { visitDate: 'desc' },
          },
          deliveries: {
            include: { children: true },
          },
          _count: { select: { visits: true, deliveries: true } },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.pregnancyTracking.count({ where }),
    ])

    return paginatedResponse(pregnancies, total, page, limit)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch maternity data'
    return errorResponse(message, 500)
  }
}

// POST /api/maternity - Create pregnancy tracking
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const pregnancy = await db.pregnancyTracking.create({
      data: {
        patientId: body.patientId,
        establishmentId: body.establishmentId,
        startDate: new Date(body.startDate),
        expectedDueDate: new Date(body.expectedDueDate),
        gravida: body.gravida || 1,
        para: body.para || 0,
        miscarriages: body.miscarriages || 0,
        livingChildren: body.livingChildren || 0,
        bloodType: body.bloodType,
        rhFactor: body.rhFactor,
        riskLevel: body.riskLevel || 'LOW',
        riskFactors: body.riskFactors ? JSON.stringify(body.riskFactors) : undefined,
        attendingDoctorId: body.attendingDoctorId,
        status: 'ACTIVE',
        notes: body.notes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
      },
    })

    return paginatedResponse([pregnancy], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create pregnancy record'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
