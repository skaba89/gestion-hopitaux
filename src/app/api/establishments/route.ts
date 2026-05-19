import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, successResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { secureApiHandler, ApiHandlerContext } from '@/lib/api-middleware'
import { establishmentCreateSchema, establishmentUpdateSchema } from '@/lib/validations/establishment'

// GET /api/establishments - List establishments (with stats & map-data sub-routes)
export async function GET(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const pathname = request.nextUrl.pathname

      // Sub-route: /api/establishments/stats
      if (pathname.endsWith('/stats')) {
        return handleStats()
      }

      // Sub-route: /api/establishments/map-data
      if (pathname.endsWith('/map-data')) {
        return handleMapData(searchParams)
      }

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
      const message = err instanceof Error ? err.message : 'Échec du chargement des établissements'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    audit: { resource: 'establishments', action: 'READ' },
  })(request)
}

// POST /api/establishments - Create establishment
export async function POST(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()
      const validated = establishmentCreateSchema.parse(body)

      const establishment = await db.establishment.create({
        data: {
          name: validated.name,
          type: validated.type,
          code: validated.code,
          address: validated.address,
          city: validated.city,
          region: validated.region,
          country: validated.country,
          phone: validated.phone,
          email: validated.email,
          logoUrl: validated.logoUrl,
          isActive: validated.isActive,
          parentId: validated.parentId,
        },
        include: {
          parent: { select: { id: true, name: true, code: true } },
          children: { select: { id: true, name: true, code: true } },
        },
      })

      return successResponse(establishment, 'Établissement créé avec succès', 201)
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Données invalides', details: err.errors },
          { status: 400 }
        )
      }
      const message = err instanceof Error ? err.message : 'Échec de la création de l\'établissement'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'admin', action: 'write' },
    audit: { resource: 'establishments', action: 'CREATE' },
  })(request)
}

// PUT /api/establishments - Update establishment
export async function PUT(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const body = await request.json()
      const { id, ...data } = body

      if (!id) {
        return errorResponse('ID de l\'établissement requis', 400)
      }

      // Validate the update data
      const validated = establishmentUpdateSchema.parse(data)

      // Check existence
      const existing = await db.establishment.findUnique({ where: { id } })
      if (!existing) {
        return errorResponse('Établissement non trouvé', 404)
      }

      const updated = await db.establishment.update({
        where: { id },
        data: validated,
        include: {
          parent: { select: { id: true, name: true, code: true } },
          children: { select: { id: true, name: true, code: true } },
        },
      })

      return successResponse(updated, 'Établissement mis à jour')
    } catch (err: any) {
      if (err.name === 'ZodError') {
        return NextResponse.json(
          { error: 'Données invalides', details: err.errors },
          { status: 400 }
        )
      }
      const message = err instanceof Error ? err.message : 'Échec de la mise à jour de l\'établissement'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'admin', action: 'write' },
    audit: { resource: 'establishments', action: 'UPDATE' },
  })(request)
}

// DELETE /api/establishments - Soft delete (set isActive: false) — admin only
export async function DELETE(request: NextRequest) {
  return secureApiHandler(async (request: NextRequest, context: ApiHandlerContext) => {
    try {
      const { searchParams } = new URL(request.url)
      const id = searchParams.get('id')

      if (!id) {
        return errorResponse('ID de l\'établissement requis', 400)
      }

      const existing = await db.establishment.findUnique({ where: { id } })
      if (!existing) {
        return errorResponse('Établissement non trouvé', 404)
      }

      // Soft delete — set isActive to false
      const updated = await db.establishment.update({
        where: { id },
        data: { isActive: false },
      })

      return successResponse(updated, 'Établissement désactivé (suppression logique)')
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Échec de la suppression de l\'établissement'
      return errorResponse(message, 500)
    }
  }, {
    requireAuth: true,
    permission: { resource: 'admin', action: 'write' },
    audit: { resource: 'establishments', action: 'DELETE' },
  })(request)
}

// Handler: Aggregated stats per establishment
async function handleStats() {
  try {
    const establishments = await db.establishment.findMany({
      where: { isActive: true },
      select: {
        id: true,
        name: true,
        type: true,
        region: true,
        city: true,
        _count: {
          select: {
            patients: true,
            beds: true,
            departments: true,
          },
        },
      },
      orderBy: { name: 'asc' },
    })

    // Get bed occupancy stats
    const statsWithBeds = await Promise.all(
      establishments.map(async (estab) => {
        const [totalBeds, availableBeds] = await Promise.all([
          db.bed.count({ where: { establishmentId: estab.id } }),
          db.bed.count({ where: { establishmentId: estab.id, status: 'AVAILABLE' } }),
        ])
        return {
          id: estab.id,
          name: estab.name,
          type: estab.type,
          region: estab.region,
          city: estab.city,
          totalPatients: estab._count.patients,
          totalBeds,
          availableBeds,
          occupiedBeds: totalBeds - availableBeds,
          bedOccupancyRate: totalBeds > 0 ? Math.round(((totalBeds - availableBeds) / totalBeds) * 1000) / 10 : 0,
          totalDepartments: estab._count.departments,
        }
      })
    )

    return successResponse(statsWithBeds)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec du chargement des statistiques'
    return errorResponse(message, 500)
  }
}

// Handler: GeoJSON data for map visualization
async function handleMapData(searchParams: URLSearchParams) {
  try {
    const region = searchParams.get('region') || ''
    const type = searchParams.get('type') || ''

    const where: Record<string, unknown> = { isActive: true }
    if (region) where.region = region
    if (type) where.type = type

    const establishments = await db.establishment.findMany({
      where,
      select: {
        id: true,
        name: true,
        type: true,
        region: true,
        city: true,
        address: true,
        phone: true,
      },
      orderBy: { name: 'asc' },
    })

    // Map known Guinean hospitals to their coordinates
    const coordinatesMap: Record<string, { lat: number; lng: number }> = {
      'CHU Donka': { lat: 9.5092, lng: -13.7122 },
      'CHU Ignace Deen': { lat: 9.5150, lng: -13.7050 },
      'Hôpital Amitié sino-guinéenne de Kipé': { lat: 9.5600, lng: -13.6400 },
      'HGR de Kindia': { lat: 10.0589, lng: -12.8589 },
      'CHU de Kankan': { lat: 10.3833, lng: -9.3000 },
      'CHU de N\'Zérékoré': { lat: 7.7500, lng: -8.8167 },
      'HGR de Labé': { lat: 11.3167, lng: -12.2833 },
      'HGR de Boké': { lat: 10.9333, lng: -14.3000 },
      'HGR de Mamou': { lat: 10.5167, lng: -12.0833 },
      'HGR de Faranah': { lat: 10.0333, lng: -10.7500 },
    }

    // Region-based default coordinates
    const regionCoords: Record<string, { lat: number; lng: number }> = {
      'Conakry': { lat: 9.5092, lng: -13.7122 },
      'Kindia': { lat: 10.0589, lng: -12.8589 },
      'Boké': { lat: 10.9333, lng: -14.3000 },
      'Labé': { lat: 11.3167, lng: -12.2833 },
      'Mamou': { lat: 10.5167, lng: -12.0833 },
      'Faranah': { lat: 10.0333, lng: -10.7500 },
      'Kankan': { lat: 10.3833, lng: -9.3000 },
      'Nzérékoré': { lat: 7.7500, lng: -8.8167 },
    }

    // Build GeoJSON FeatureCollection
    const features = establishments.map(estab => {
      const coords = coordinatesMap[estab.name] || regionCoords[estab.region || ''] || { lat: 10.0, lng: -12.0 }
      return {
        type: 'Feature' as const,
        geometry: {
          type: 'Point' as const,
          coordinates: [coords.lng, coords.lat],
        },
        properties: {
          id: estab.id,
          name: estab.name,
          type: estab.type,
          region: estab.region,
          city: estab.city,
          address: estab.address,
          phone: estab.phone,
        },
      }
    })

    const geoJson = {
      type: 'FeatureCollection' as const,
      features,
    }

    return successResponse(geoJson)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec du chargement des données cartographiques'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
