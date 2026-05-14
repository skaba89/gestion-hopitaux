import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { loginSchema } from '@/lib/validations/auth'
import { addSimpleAuditEntry } from '@/lib/audit-logger'
import { SignJWT } from 'jose'

// JWT secret — FAIL FAST in production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (
    process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('[SECURITY] JWT_SECRET environment variable is required in production') })()
      : 'healthflow-guinea-jwt-secret-dev-only-NOT-FOR-PRODUCTION'
  )
)

/**
 * POST /api/auth/login
 * Staff login with email + password.
 * Uses bcryptjs for password verification.
 * Returns a JWT token with user info and permissions.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = loginSchema.parse(body)

    // Look up user by email
    const user = await db.user.findUnique({
      where: { email: validated.email },
      include: {
        establishments: {
          take: 5,
        },
        roles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    })

    if (!user) {
      // Anti-enumeration: same error as wrong password
      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    if (!user.isActive) {
      return NextResponse.json(
        { error: 'Compte désactivé. Contactez l\'administration.' },
        { status: 403 }
      )
    }

    // Check account lockout
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      const remainingMinutes = Math.ceil(
        (new Date(user.lockedUntil).getTime() - Date.now()) / 60000
      )
      return NextResponse.json(
        { error: `Compte bloqué. Réessayez dans ${remainingMinutes} minute(s).` },
        { status: 423 }
      )
    }

    // Verify password using bcryptjs
    const bcryptjs = await import('bcryptjs')
    const isValidPassword = await bcryptjs.compare(validated.password, user.passwordHash)

    if (!isValidPassword) {
      // Increment failed login attempts
      const failedAttempts = user.failedLoginAttempts + 1

      if (failedAttempts >= 5) {
        // Lock account for 15 minutes
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
          }
        })

        addSimpleAuditEntry({
          action: 'LOGIN_LOCKOUT',
          module: 'auth',
          entity: 'User',
          entityId: user.id,
          description: `Account locked after 5 failed attempts: ${user.email}`,
          severity: 'WARNING',
        })

        return NextResponse.json(
          { error: 'Compte bloqué pour 15 minutes suite à trop de tentatives.' },
          { status: 423 }
        )
      }

      await db.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: failedAttempts }
      })

      addSimpleAuditEntry({
        action: 'LOGIN_FAILED',
        module: 'auth',
        entity: 'User',
        entityId: user.id,
        description: `Failed login attempt (${failedAttempts}/5): ${user.email}`,
        severity: 'INFO',
      })

      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Successful login — update user and create JWT
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      }
    })

    // Extract permissions from roles
    const permissions = user.roles.flatMap(ur =>
      ur.role.permissions.map(rp => rp.permission.name)
    )

    // Find default establishment
    const defaultEst = user.establishments.find(e => e.isDefault) || user.establishments[0]

    // Create JWT token
    const token = await new SignJWT({
      userId: user.id,
      email: user.email,
      role: user.roles[0]?.role?.name || 'Patient',
      establishmentId: defaultEst?.establishmentId || '',
      permissions: [...new Set(permissions)],
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('12h')
      .setIssuedAt()
      .setIssuer('healthflow-guinea')
      .setAudience('staff-portal')
      .sign(JWT_SECRET)

    addSimpleAuditEntry({
      action: 'LOGIN_SUCCESS',
      module: 'auth',
      entity: 'User',
      entityId: user.id,
      description: `Staff login: ${user.email} (${user.roles[0]?.role?.name || 'unknown role'})`,
      severity: 'INFO',
    })

    return NextResponse.json({
      success: true,
      token,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        phone: user.phone,
        role: user.roles[0]?.role?.name || 'Patient',
        establishmentId: defaultEst?.establishmentId || '',
        establishments: user.establishments,
        permissions: [...new Set(permissions)],
        mfaEnabled: user.mfaEnabled,
        lastLoginAt: new Date(),
      }
    })

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion' },
      { status: 500 }
    )
  }
}
