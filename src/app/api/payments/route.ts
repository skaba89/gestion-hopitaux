import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { paymentCreateSchema } from '@/lib/validations/billing'
import { generateSecureToken } from '@/lib/security'

// GET /api/payments - List payments
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const { page, limit, skip, take } = getPaginationParams(searchParams)
      const patientId = searchParams.get('patientId') || ''
      const invoiceId = searchParams.get('invoiceId') || ''
      const status = searchParams.get('status') || ''
      const paymentMethod = searchParams.get('paymentMethod') || ''
      const establishmentId = searchParams.get('establishmentId') || ''
      const dateFrom = searchParams.get('dateFrom') || ''
      const dateTo = searchParams.get('dateTo') || ''

      const where: Record<string, unknown> = {}

      if (patientId) where.patientId = patientId
      if (invoiceId) where.invoiceId = invoiceId
      if (status) where.status = status
      if (paymentMethod) where.paymentMethod = paymentMethod
      if (establishmentId) where.establishmentId = establishmentId

      if (dateFrom || dateTo) {
        const dateFilter: Record<string, Date> = {}
        if (dateFrom) dateFilter.gte = new Date(dateFrom)
        if (dateTo) dateFilter.lte = new Date(dateTo)
        where.createdAt = dateFilter
      }

      const [payments, total] = await Promise.all([
        db.payment.findMany({
          where,
          skip,
          take,
          include: {
            patient: { select: { id: true, firstName: true, lastName: true, qrCode: true } },
            invoice: { select: { id: true, invoiceNumber: true, totalAmount: true, status: true } },
            establishment: { select: { id: true, name: true } },
          },
          orderBy: { createdAt: 'desc' },
        }),
        db.payment.count({ where }),
      ])

      return paginatedResponse(payments, total, page, limit)
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to fetch payments'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'payments', action: 'READ' },
  })(request)
}

// POST /api/payments - Record a payment
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()

      // Zod validation — uses paymentCreateSchema from validations/billing.ts
      const validated = paymentCreateSchema.parse(body)

      const paymentNumber = `PAY-${Date.now()}-${generateSecureToken(4).toUpperCase()}`

      const payment = await db.payment.create({
        data: {
          paymentNumber,
          invoiceId: validated.invoiceId,
          patientId: validated.patientId,
          establishmentId: validated.establishmentId,
          amount: validated.amount,
          paymentMethod: validated.paymentMethod,
          mobileMoneyProvider: validated.mobileMoneyProvider,
          mobileMoneyTransactionId: validated.mobileMoneyTransactionId,
          currency: validated.currency,
          referenceNumber: validated.referenceNumber,
          status: validated.status,
          processedById: validated.processedById,
          notes: validated.notes,
        },
        include: {
          patient: { select: { id: true, firstName: true, lastName: true } },
          invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } },
          establishment: { select: { id: true, name: true } },
        },
      })

      // Update invoice status if payment is completed
      if (validated.status === 'COMPLETED') {
        const invoice = await db.invoice.findUnique({
          where: { id: validated.invoiceId },
          include: { payments: { where: { status: 'COMPLETED' } } },
        })

        if (invoice) {
          const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + validated.amount
          let newStatus = invoice.status
          if (totalPaid >= invoice.totalAmount) {
            newStatus = 'PAID'
          } else if (totalPaid > 0) {
            newStatus = 'PARTIALLY_PAID'
          }
          await db.invoice.update({
            where: { id: validated.invoiceId },
            data: { status: newStatus },
          })
        }
      }

      return paginatedResponse([payment], 1, 1, 1)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return errorResponse('Données invalides: ' + err.errors.map((e: any) => e.message).join(', '), 400)
      }
      console.error('[Payments] Create error:', err)
      return errorResponse('Erreur lors de l\'enregistrement du paiement', 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'billing' as any, action: 'create' as any },
    audit: { resource: 'payments', action: 'CREATE' },
  })(request)
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
