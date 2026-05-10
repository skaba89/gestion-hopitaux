import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/payments - List payments
export async function GET(request: NextRequest) {
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
}

// POST /api/payments - Record a payment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const paymentNumber = `PAY-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const payment = await db.payment.create({
      data: {
        paymentNumber,
        invoiceId: body.invoiceId,
        patientId: body.patientId,
        establishmentId: body.establishmentId,
        amount: body.amount,
        paymentMethod: body.paymentMethod,
        mobileMoneyProvider: body.mobileMoneyProvider,
        mobileMoneyTransactionId: body.mobileMoneyTransactionId,
        currency: body.currency || 'GNF',
        referenceNumber: body.referenceNumber,
        status: body.status || 'PENDING',
        processedById: body.processedById,
        notes: body.notes,
      },
      include: {
        patient: { select: { id: true, firstName: true, lastName: true } },
        invoice: { select: { id: true, invoiceNumber: true, totalAmount: true } },
        establishment: { select: { id: true, name: true } },
      },
    })

    // Update invoice status if payment is completed
    if (body.status === 'COMPLETED' || !body.status) {
      const invoice = await db.invoice.findUnique({
        where: { id: body.invoiceId },
        include: { payments: { where: { status: 'COMPLETED' } } },
      })

      if (invoice) {
        const totalPaid = invoice.payments.reduce((sum, p) => sum + p.amount, 0) + body.amount
        let newStatus = invoice.status
        if (totalPaid >= invoice.totalAmount) {
          newStatus = 'PAID'
        } else if (totalPaid > 0) {
          newStatus = 'PARTIALLY_PAID'
        }
        await db.invoice.update({
          where: { id: body.invoiceId },
          data: { status: newStatus },
        })
      }
    }

    return paginatedResponse([payment], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to record payment'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
