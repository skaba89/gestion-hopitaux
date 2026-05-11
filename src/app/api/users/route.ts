import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'

// GET /api/users - List users
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const { page, limit, skip, take } = getPaginationParams(searchParams)
    const search = searchParams.get('search') || ''
    const role = searchParams.get('role') || ''
    const specialization = searchParams.get('specialization') || ''
    const isActive = searchParams.get('isActive')

    const where: Record<string, unknown> = {}

    if (search) {
      where.OR = [
        { firstName: { contains: search } },
        { lastName: { contains: search } },
        { email: { contains: search } },
        { phone: { contains: search } },
        { professionalId: { contains: search } },
      ]
    }

    if (specialization) where.specialization = specialization
    if (isActive !== null && isActive !== undefined && isActive !== '') {
      where.isActive = isActive === 'true'
    }

    if (role) {
      where.roles = { some: { role: { name: role } } }
    }

    const [users, total] = await Promise.all([
      db.user.findMany({
        where,
        skip,
        take,
        select: {
          id: true,
          email: true,
          firstName: true,
          lastName: true,
          phone: true,
          avatarUrl: true,
          professionalId: true,
          specialization: true,
          isActive: true,
          lastLoginAt: true,
          mfaEnabled: true,
          createdAt: true,
          roles: {
            include: {
              role: { select: { id: true, name: true, description: true } },
            },
          },
          establishments: {
            include: {
              establishment: { select: { id: true, name: true, code: true } },
            },
          },
          _count: {
            select: {
              appointmentsAsDoctor: true,
              consultations: true,
              labRequests: true,
            },
          },
        },
        orderBy: { createdAt: 'desc' },
      }),
      db.user.count({ where }),
    ])

    // Remove sensitive fields
    const sanitizedUsers = users.map(({ ...user }) => user)

    return paginatedResponse(sanitizedUsers, total, page, limit)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to fetch users'
    return errorResponse(message, 500)
  }
}

// POST /api/users - Create user
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    // Hash password (in production, use bcrypt or similar)
    const passwordHash = `hashed_${body.password}`

    const user = await db.user.create({
      data: {
        email: body.email,
        passwordHash,
        firstName: body.firstName,
        lastName: body.lastName,
        phone: body.phone,
        avatarUrl: body.avatarUrl,
        professionalId: body.professionalId,
        specialization: body.specialization,
        isActive: body.isActive !== undefined ? body.isActive : true,
        mfaEnabled: false,
      },
      select: {
        id: true,
        email: true,
        firstName: true,
        lastName: true,
        phone: true,
        avatarUrl: true,
        professionalId: true,
        specialization: true,
        isActive: true,
        createdAt: true,
      },
    })

    // Assign role if provided
    if (body.roleId) {
      await db.userRole.create({
        data: {
          userId: user.id,
          roleId: body.roleId,
          establishmentId: body.establishmentId,
        },
      })
    }

    // Assign to establishment if provided
    if (body.establishmentId) {
      await db.userEstablishment.create({
        data: {
          userId: user.id,
          establishmentId: body.establishmentId,
          isDefault: true,
        },
      })
    }

    return paginatedResponse([user], 1, 1, 1)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Failed to create user'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
