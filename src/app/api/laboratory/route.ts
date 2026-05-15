import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { generateSecureToken } from '@/lib/security'

// GET /api/laboratory - List lab requests and results
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const patientId = searchParams.get('patientId') || ''
      const status = searchParams.get('status') || ''
      const priority = searchParams.get('priority') || ''
      const dateFrom = searchParams.get('dateFrom') || ''
      const dateTo = searchParams.get('dateTo') || ''
      const category = searchParams.get('category') || ''

      // If requesting test catalog
      if (searchParams.get('catalog') === 'true') {
        const catalogWhere: Record<string, unknown> = { isActive: true }
        if (category) catalogWhere.category = category

        const catalog = await db.labTestCatalog.findMany({
          where: catalogWhere,
          orderBy: { name: 'asc' },
        })

        return paginatedResponse(catalog, catalog.length, 1, 100)
      }

      const where: Record<string, unknown> = {}

      if (patientId) where.patientId = patientId
      if (status) where.status = status
      if (priority) where.priority = priority

      if (dateFrom || dateTo) {
        const dateFilter: Record<string, Date> = {}
        if (dateFrom) dateFilter.gte = new Date(dateFrom)
        if (dateTo) dateFilter.lte = new Date(dateTo)
        where.requestedAt = dateFilter
      }

      const [labRequests, total] = await Promise.all([
        db.labRequest.findMany({
          where,
          skip,
          take,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true, qrCode: true } },
            requestingDoctor: { select: { id: true, firstName: true, lastName: true } },
            items: {
              include: {
                testCatalog: { select: { id: true, name: true, code: true, category: true, unit: true, normalRangeMin: true, normalRangeMax: true } },
              },
            },
            results: {
              include: {
                testCatalog: { select: { name: true, code: true, unit: true } },
                validatedBy: { select: { id: true, firstName: true, lastName: true } },
              },
            },
          },
          orderBy: { requestedAt: 'desc' },
        }),
        db.labRequest.count({ where }),
      ])

      return paginatedResponse(labRequests, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch lab data'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'laboratory', action: 'READ' },
  })(request)
}

// POST /api/laboratory - Create lab request
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()

      const requestCode = `LAB-${Date.now()}-${generateSecureToken(4).toUpperCase()}`

      const labRequest = await db.labRequest.create({
        data: {
          requestCode,
          patientId: body.patientId,
          requestingDoctorId: body.requestingDoctorId,
          consultationId: body.consultationId,
          establishmentId: body.establishmentId,
          priority: body.priority || 'ROUTINE',
          status: 'REQUESTED',
          clinicalInfo: body.clinicalInfo,
          notes: body.notes,
          items: {
            create: (body.tests || []).map((test: { testCatalogId: string; notes?: string }) => ({
              testCatalogId: test.testCatalogId,
              status: 'PENDING',
              notes: test.notes,
            })),
          },
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          requestingDoctor: { select: { id: true, firstName: true, lastName: true } },
          items: { include: { testCatalog: true } },
        },
      })

      return paginatedResponse([labRequest], 1, 1, 1)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to create lab request'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'laboratory', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
