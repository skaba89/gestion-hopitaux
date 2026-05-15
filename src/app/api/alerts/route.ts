import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { generateSecureToken } from '@/lib/security'

// GET /api/alerts - List health alerts
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip, take } = getPaginationParams(searchParams)
    const status = searchParams.get('status') || ''
    const alertType = searchParams.get('alertType') || ''
    const severity = searchParams.get('severity') || ''
    const establishmentId = searchParams.get('establishmentId') || ''
    const region = searchParams.get('region') || ''
    const view = searchParams.get('view') || 'alerts' // alerts, anomalies, surveillance, reports

    // View: health anomalies
    if (view === 'anomalies') {
      const anomWhere: Record<string, unknown> = {}
      if (status) anomWhere.status = status
      if (establishmentId) anomWhere.establishmentId = establishmentId

      const [anomalies, total] = await Promise.all([
        db.healthAnomaly.findMany({
          where: anomWhere,
          skip,
          take,
          include: {
            alert: { select: { id: true, diseaseName: true, alertType: true, severity: true } },
          },
          orderBy: { detectedDate: 'desc' },
        }),
        db.healthAnomaly.count({ where: anomWhere }),
      ])

      return paginatedResponse(anomalies, total, page, limit)
    }

    // View: disease surveillance
    if (view === 'surveillance') {
      const survWhere: Record<string, unknown> = {}
      if (establishmentId) survWhere.establishmentId = establishmentId
      if (region) survWhere.region = region

      const [surveillance, total] = await Promise.all([
        db.diseaseSurveillance.findMany({
          where: survWhere,
          skip,
          take,
          orderBy: { reportDate: 'desc' },
        }),
        db.diseaseSurveillance.count({ where: survWhere }),
      ])

      return paginatedResponse(surveillance, total, page, limit)
    }

    // View: health reports
    if (view === 'reports') {
      const repWhere: Record<string, unknown> = {}
      if (status) repWhere.status = status
      if (establishmentId) repWhere.establishmentId = establishmentId

      const [reports, total] = await Promise.all([
        db.healthReport.findMany({
          where: repWhere,
          skip,
          take,
          include: {
            establishment: { select: { id: true, name: true } },
            _count: { select: { items: true } },
          },
          orderBy: { generatedAt: 'desc' },
        }),
        db.healthReport.count({ where: repWhere }),
      ])

      return paginatedResponse(reports, total, page, limit)
    }

    // Default view: epidemiological alerts
    const where: Record<string, unknown> = {}

    if (status) where.status = status
    else where.status = 'ACTIVE'
    if (alertType) where.alertType = alertType
    if (severity) where.severity = severity
    if (establishmentId) where.establishmentId = establishmentId
    if (region) where.region = region

    const [alerts, total] = await Promise.all([
      db.epidemiologicalAlert.findMany({
        where,
        skip,
        take,
        include: {
          establishment: { select: { id: true, name: true, code: true } },
          anomalies: {
            take: 5,
            orderBy: { detectedDate: 'desc' },
          },
          _count: { select: { anomalies: true } },
        },
        orderBy: { startDate: 'desc' },
      }),
      db.epidemiologicalAlert.count({ where }),
    ])

    return paginatedResponse(alerts, total, page, limit)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch health alerts'
    return errorResponse(message, 500)
  }
}

// POST /api/alerts - Create epidemiological alert
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const alertCode = `ALT-${Date.now()}-${generateSecureToken(4).toUpperCase()}`

    const alert = await db.epidemiologicalAlert.create({
      data: {
        alertCode,
        diseaseName: body.diseaseName,
        diseaseCode: body.diseaseCode,
        alertType: body.alertType,
        severity: body.severity || 'MODERATE',
        status: 'ACTIVE',
        establishmentId: body.establishmentId,
        region: body.region,
        affectedCount: body.affectedCount || 0,
        suspectedCount: body.suspectedCount || 0,
        confirmedCount: body.confirmedCount || 0,
        deceasedCount: body.deceasedCount || 0,
        recoveredCount: body.recoveredCount || 0,
        startDate: new Date(body.startDate),
        description: body.description,
        source: body.source,
        geographicArea: body.geographicArea,
        measuresTaken: body.measuresTaken ? JSON.stringify(body.measuresTaken) : undefined,
        reportedById: body.reportedById,
        whoNotified: body.whoNotified || false,
        notes: body.notes,
      },
      include: {
        establishment: { select: { id: true, name: true } },
      },
    })

    return paginatedResponse([alert], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create alert'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
