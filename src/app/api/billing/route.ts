import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { invoiceCreateSchema } from '@/lib/validations/billing'
import { generateSecureToken } from '@/lib/security'

// GET /api/billing - List invoices
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const patientId = searchParams.get('patientId') || ''
      const status = searchParams.get('status') || ''
      const establishmentId = searchParams.get('establishmentId') || ''
      const dateFrom = searchParams.get('dateFrom') || ''
      const dateTo = searchParams.get('dateTo') || ''

      const where: Record<string, unknown> = {}

      if (patientId) where.patientId = patientId
      if (status) where.status = status
      if (establishmentId) where.establishmentId = establishmentId

      if (dateFrom || dateTo) {
        const dateFilter: Record<string, Date> = {}
        if (dateFrom) dateFilter.gte = new Date(dateFrom)
        if (dateTo) dateFilter.lte = new Date(dateTo)
        where.invoiceDate = dateFilter
      }

      const [invoices, total] = await Promise.all([
        db.invoice.findMany({
          where,
          skip,
          take,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true, qrCode: true } },
            establishment: { select: { id: true, name: true, code: true } },
            items: true,
            payments: {
              orderBy: { createdAt: 'desc' },
              take: 5,
            },
            _count: { select: { payments: true } },
          },
          orderBy: { invoiceDate: 'desc' },
        }),
        db.invoice.count({ where }),
      ])

      return paginatedResponse(invoices, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch invoices'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'billing', action: 'READ' },
  })(request)
}

// POST /api/billing - Create invoice
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()

      // Zod validation — uses invoiceCreateSchema from validations/billing.ts
      const validated = invoiceCreateSchema.parse(body)

      // SEC FIX: Use crypto-based secure token instead of Math.random()
      const invoiceNumber = `INV-${Date.now()}-${generateSecureToken(4).toUpperCase()}`

      // Calculate totals from validated items
      const subtotal = validated.items.reduce((sum, item) => sum + (item.totalPrice || 0), 0)
      const taxAmount = validated.taxAmount
      const discountAmount = validated.discountAmount
      const totalAmount = subtotal + taxAmount - discountAmount

      const invoice = await db.invoice.create({
        data: {
          invoiceNumber,
          patientId: validated.patientId,
          establishmentId: validated.establishmentId,
          admissionId: validated.admissionId,
          consultationId: validated.consultationId,
          invoiceDate: validated.invoiceDate,
          dueDate: validated.dueDate,
          subtotal,
          taxAmount,
          discountAmount,
          totalAmount,
          insuranceCoverageAmount: validated.insuranceCoverageAmount,
          patientResponsibility: totalAmount - validated.insuranceCoverageAmount,
          status: validated.status,
          insuranceId: validated.insuranceId,
          notes: validated.notes,
          issuedById: validated.issuedById,
          items: {
            create: validated.items.map((item) => ({
              description: item.description,
              category: item.category,
              quantity: item.quantity || 1,
              unitPrice: item.unitPrice,
              totalPrice: item.totalPrice,
              discountPercent: item.discountPercent || 0,
              notes: item.notes,
              relatedEntityId: item.relatedEntityId,
              relatedEntityType: item.relatedEntityType,
            })),
          },
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          establishment: { select: { id: true, name: true } },
          items: true,
        },
      })

      return paginatedResponse([invoice], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return errorResponse('Données invalides: ' + err.errors.map((e: any) => e.message).join(', '), 400)
      }
      const message = err instanceof Error ? err.message : 'Failed to create invoice'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'billing' as any, action: 'create' as any },
    audit: { resource: 'billing', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
