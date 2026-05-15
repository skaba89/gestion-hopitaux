import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { stockEntryCreateSchema } from '@/lib/validations/pharmacy'
import { generateSecureToken } from '@/lib/security'

// GET /api/pharmacy - Stock levels, alerts, medications
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const establishmentId = searchParams.get('establishmentId') || context.establishmentId || ''
      const category = searchParams.get('category') || ''
      const alertType = searchParams.get('alertType') || ''
      const search = searchParams.get('search') || ''
      const view = searchParams.get('view') || 'stock' // stock, alerts, expirations, medications

      // View: shortage alerts
      if (view === 'alerts') {
        const alertWhere: Record<string, unknown> = {}
        if (establishmentId) alertWhere.establishmentId = establishmentId
        if (alertType) alertWhere.alertType = alertType
        else alertWhere.status = 'ACTIVE'

        const [alerts, total] = await Promise.all([
          db.shortageAlert.findMany({
            where: alertWhere,
            skip,
            take,
            include: {
              medication: { select: { id: true, name: true, code: true, genericName: true, category: true, form: true } },
            },
            orderBy: { createdAt: 'desc' },
          }),
          db.shortageAlert.count({ where: alertWhere }),
        ])

        return paginatedResponse(alerts, total, page, limit)
      }

      // View: expiration tracking
      if (view === 'expirations') {
        const expWhere: Record<string, unknown> = {}
        if (establishmentId) expWhere.establishmentId = establishmentId

        const [expirations, total] = await Promise.all([
          db.expirationTracking.findMany({
            where: expWhere,
            skip,
            take,
            include: {
              medication: { select: { id: true, name: true, code: true, form: true } },
            },
            orderBy: { expiryDate: 'asc' },
          }),
          db.expirationTracking.count({ where: expWhere }),
        ])

        return paginatedResponse(expirations, total, page, limit)
      }

      // View: medications catalog
      if (view === 'medications') {
        const medWhere: Record<string, unknown> = { isActive: true }
        if (category) medWhere.category = category
        if (search) {
          medWhere.OR = [
            { name: { contains: search } },
            { genericName: { contains: search } },
            { code: { contains: search } },
          ]
        }

        const [medications, total] = await Promise.all([
          db.medication.findMany({
            where: medWhere,
            skip,
            take,
            orderBy: { name: 'asc' },
          }),
          db.medication.count({ where: medWhere }),
        ])

        return paginatedResponse(medications, total, page, limit)
      }

      // Default view: stock levels
      const stockWhere: Record<string, unknown> = {}
      if (establishmentId) stockWhere.establishmentId = establishmentId
      if (category) {
        stockWhere.medication = { category }
      }
      if (search) {
        stockWhere.medication = {
          ...(stockWhere.medication as Record<string, unknown> || {}),
          OR: [
            { name: { contains: search } },
            { genericName: { contains: search } },
          ],
        }
      }

      const [stocks, total] = await Promise.all([
        db.medicationStock.findMany({
          where: stockWhere,
          skip,
          take,
          include: {
            medication: { select: { id: true, name: true, code: true, genericName: true, category: true, form: true, strength: true, minimumStockLevel: true, unitPrice: true, sellingPrice: true } },
            establishment: { select: { id: true, name: true } },
          },
          orderBy: { currentQuantity: 'asc' },
        }),
        db.medicationStock.count({ where: stockWhere }),
      ])

      return paginatedResponse(stocks, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch pharmacy data'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'pharmacy', action: 'READ' },
  })(request)
}

// POST /api/pharmacy - Add stock entry (with Zod validation + secure ID generation)
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()

      // Zod validation — uses stockEntryCreateSchema from validations/pharmacy.ts
      const validated = stockEntryCreateSchema.parse(body)

      // SEC FIX: Use crypto.randomBytes instead of Math.random()
      const entryNumber = `SE-${Date.now()}-${generateSecureToken(4).toUpperCase()}`

      const stockEntry = await db.stockEntry.create({
        data: {
          entryNumber,
          establishmentId: validated.establishmentId,
          supplier: validated.supplier,
          invoiceNumber: validated.invoiceNumber,
          entryDate: validated.entryDate,
          totalAmount: validated.totalAmount,
          receivedById: validated.receivedById,
          notes: validated.notes,
          status: validated.status,
          items: {
            create: validated.items.map((item) => ({
              medicationId: item.medicationId,
              batchNumber: item.batchNumber,
              quantity: item.quantity,
              unitPrice: item.unitPrice,
              expiryDate: item.expiryDate,
              manufacturingDate: item.manufacturingDate,
              notes: item.notes,
            })),
          },
        },
        include: {
          items: { include: { medication: { select: { id: true, name: true, code: true } } } },
        },
      })

      return paginatedResponse([stockEntry], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return errorResponse('Données invalides: ' + err.errors.map((e: any) => e.message).join(', '), 400)
      }
      const message = err instanceof Error ? err.message : 'Failed to add stock entry'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'pharmacy' as any, action: 'create' as any },
    audit: { resource: 'pharmacy', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
