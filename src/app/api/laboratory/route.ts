import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { labRequestCreateSchema } from '@/lib/validations/laboratory'
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

      // Zod validation — uses labRequestCreateSchema from validations/laboratory.ts
      const validated = labRequestCreateSchema.parse(body)

      const requestCode = `LAB-${Date.now()}-${generateSecureToken(4).toUpperCase()}`

      const labRequest = await db.labRequest.create({
        data: {
          requestCode,
          patientId: validated.patientId,
          requestingDoctorId: validated.requestingDoctorId,
          consultationId: validated.consultationId,
          establishmentId: validated.establishmentId,
          priority: validated.priority,
          status: 'REQUESTED',
          clinicalInfo: validated.clinicalInfo,
          notes: validated.notes,
          items: {
            create: validated.testCatalogIds.map((testCatalogId: string) => ({
              testCatalogId,
              status: 'PENDING',
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
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return errorResponse('Données invalides: ' + err.errors.map((e: any) => e.message).join(', '), 400)
      }
      console.error('[Laboratory] Create error:', err)
      return errorResponse('Erreur lors de la création de la demande de laboratoire', 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'laboratory' as any, action: 'create' as any },
    audit: { resource: 'laboratory', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
