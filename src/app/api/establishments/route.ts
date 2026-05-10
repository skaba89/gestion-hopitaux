import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/establishments - List establishments
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip, take } = getPaginationParams(searchParams)
    const type = searchParams.get('type') || ''
    const city = searchParams.get('city') || ''
    const region = searchParams.get('region') || ''
    const search = searchParams.get('search') || ''
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}

    if (type) where.type = type
    if (city) where.city = city
    if (region) where.region = region
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }
    if (search) {
      where.OR = [
        { name: { contains: search } },
        { code: { contains: search } },
        { city: { contains: search } },
      ]
    }

    const [establishments, total] = await Promise.all([
      db.establishment.findMany({
        where,
        skip,
        take,
        include: {
          parent: { select: { id: true, name: true, code: true } },
          children: { select: { id: true, name: true, code: true, type: true } },
          departments: {
            select: { id: true, name: true, code: true, type: true, isActive: true },
          },
          _count: {
            select: {
              patients: true,
              beds: true,
              departments: true,
            },
          },
        },
        orderBy: { name: 'asc' },
      }),
      db.establishment.count({ where }),
    ])

    return paginatedResponse(establishments, total, page, limit)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch establishments'
    return errorResponse(message, 500)
  }
}

// POST /api/establishments - Create establishment
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const establishment = await db.establishment.create({
      data: {
        name: body.name,
        type: body.type || 'HOSPITAL',
        code: body.code,
        address: body.address,
        city: body.city,
        region: body.region,
        country: body.country || 'Guinea',
        phone: body.phone,
        email: body.email,
        logoUrl: body.logoUrl,
        isActive: body.isActive !== undefined ? body.isActive : true,
        parentId: body.parentId,
      },
      include: {
        parent: { select: { id: true, name: true, code: true } },
        children: { select: { id: true, name: true, code: true } },
      },
    })

    return paginatedResponse([establishment], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create establishment'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
