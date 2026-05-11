import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/pharmacy - Stock levels, alerts, medications
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip, take } = getPaginationParams(searchParams)
    const establishmentId = searchParams.get('establishmentId') || ''
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
}

// POST /api/pharmacy - Add stock entry
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const entryNumber = `SE-${Date.now()}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`

    const stockEntry = await db.stockEntry.create({
      data: {
        entryNumber,
        establishmentId: body.establishmentId,
        supplier: body.supplier,
        invoiceNumber: body.invoiceNumber,
        entryDate: body.entryDate ? new Date(body.entryDate) : undefined,
        totalAmount: body.totalAmount,
        receivedById: body.receivedById,
        notes: body.notes,
        status: 'PENDING',
        items: {
          create: (body.items || []).map((item: {
            medicationId: string
            batchNumber: string
            quantity: number
            unitPrice?: number
            expiryDate?: string
            manufacturingDate?: string
            notes?: string
          }) => ({
            medicationId: item.medicationId,
            batchNumber: item.batchNumber,
            quantity: item.quantity,
            unitPrice: item.unitPrice,
            expiryDate: item.expiryDate ? new Date(item.expiryDate) : undefined,
            manufacturingDate: item.manufacturingDate ? new Date(item.manufacturingDate) : undefined,
            notes: item.notes,
          })),
        },
      },
      include: {
        items: { include: { medication: { select: { id: true, name: true, code: true } } } },
      },
    })

    return paginatedResponse([stockEntry], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to add stock entry'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
