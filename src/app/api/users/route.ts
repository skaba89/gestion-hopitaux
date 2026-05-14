import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { paginatedResponse, errorResponse, getPaginationParams, corsHeaders } from '@/lib/api-utils'
import { userCreateSchema, userUpdateSchema } from '@/lib/validations/user'
import bcrypt from 'bcryptjs'

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
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
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

    // Remove password hash from response
    const sanitizedUsers = users.map(({ ...user }) => user)

    return paginatedResponse(sanitizedUsers, total, page, limit)
  } catch (err) {
    const message = err instanceof Error ? err.message : 'Échec du chargement des utilisateurs'
    return errorResponse(message, 500)
  }
}

// POST /api/users - Create user with proper password hashing and Zod validation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = userCreateSchema.parse(body)

    // Check for duplicate email
    const existingUser = await db.user.findUnique({
      where: { email: validated.email },
    })
    if (existingUser) {
      return NextResponse.json(
        { error: 'Un utilisateur avec cet email existe déjà' },
        { status: 409 }
      )
    }

    // Check for duplicate professionalId if provided
    if (validated.professionalId) {
      const existingPro = await db.user.findUnique({
        where: { professionalId: validated.professionalId },
      })
      if (existingPro) {
        return NextResponse.json(
          { error: 'Un utilisateur avec cet identifiant professionnel existe déjà' },
          { status: 409 }
        )
      }
    }

    // Hash password with bcrypt (12 salt rounds - production-grade)
    const passwordHash = await bcrypt.hash(validated.password, 12)

    const user = await db.user.create({
      data: {
        email: validated.email,
        passwordHash,
        firstName: validated.firstName,
        lastName: validated.lastName,
        phone: validated.phone,
        avatarUrl: validated.avatarUrl,
        professionalId: validated.professionalId,
        specialization: validated.specialization,
        isActive: true,
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

    // Assign roles if provided
    if (validated.roles && validated.roles.length > 0) {
      await db.userRole.createMany({
        data: validated.roles.map(r => ({
          userId: user.id,
          roleId: r.roleId,
          establishmentId: r.establishmentId,
        })),
      })
    }

    // Assign to establishments if provided
    if (validated.establishments && validated.establishments.length > 0) {
      await db.userEstablishment.createMany({
        data: validated.establishments.map(e => ({
          userId: user.id,
          establishmentId: e.establishmentId,
          isDefault: e.isDefault,
        })),
      })
    }

    return NextResponse.json({ data: user }, { status: 201 })
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: err.errors },
        { status: 400 }
      )
    }
    const message = err instanceof Error ? err.message : 'Échec de la création de l\'utilisateur'
    return errorResponse(message, 500)
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
