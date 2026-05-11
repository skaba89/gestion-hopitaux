import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/billing - List invoices
export async function GET(request: NextRequest) {
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
}

// POST /api/billing - Create invoice
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const invoiceNumber = `INV-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    // Calculate totals from items
    const items = body.items || []
    const subtotal = items.reduce((sum: number, item: { totalPrice: number }) => sum + (item.totalPrice || 0), 0)
    const taxAmount = body.taxAmount || 0
    const discountAmount = body.discountAmount || 0
    const totalAmount = subtotal + taxAmount - discountAmount

    const invoice = await db.invoice.create({
      data: {
        invoiceNumber,
        patientId: body.patientId,
        establishmentId: body.establishmentId,
        admissionId: body.admissionId,
        consultationId: body.consultationId,
        invoiceDate: body.invoiceDate ? new Date(body.invoiceDate) : undefined,
        dueDate: body.dueDate ? new Date(body.dueDate) : undefined,
        subtotal,
        taxAmount,
        discountAmount,
        totalAmount,
        insuranceCoverageAmount: body.insuranceCoverageAmount || 0,
        patientResponsibility: totalAmount - (body.insuranceCoverageAmount || 0),
        status: body.status || 'DRAFT',
        insuranceId: body.insuranceId,
        notes: body.notes,
        issuedById: body.issuedById,
        items: {
          create: items.map((item: {
            description: string
            category: string
            quantity?: number
            unitPrice: number
            totalPrice: number
            discountPercent?: number
            notes?: string
            relatedEntityId?: string
            relatedEntityType?: string
          }) => ({
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
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create invoice'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
