import { NextRequest, NextResponse } from 'next/server'
import { isDemoMode, findDemoUser } from '@/lib/demo-users'

/**
 * POST /api/auth/login
 * Staff login with email + password.
 *
 * DEMO MODE: Authenticates against hardcoded demo users.
 * PRODUCTION: Authenticates against PostgreSQL database with bcryptjs.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { email, password } = body

    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email et mot de passe requis' },
        { status: 400 }
      )
    }

    // ─── DEMO MODE ───
    if (isDemoMode()) {
      const demoUser = findDemoUser(email, password)

      if (!demoUser) {
        return NextResponse.json(
          { error: 'Identifiants invalides' },
          { status: 401 }
        )
      }

      return NextResponse.json({
        success: true,
        data: {
          id: demoUser.id,
          name: `${demoUser.firstName} ${demoUser.lastName}`,
          email: demoUser.email,
          phone: demoUser.phone,
          role: demoUser.role,
          establishmentId: demoUser.establishmentId,
          establishmentName: demoUser.establishmentName,
        },
      })
    }

    // ─── PRODUCTION MODE (Database) ───
    const { db } = await import('@/lib/db')
    const bcryptjs = await import('bcryptjs')

    const user = await db.user.findUnique({
      where: { email },
      include: {
        establishments: { take: 5 },
        roles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } },
        },
      },
    })

    if (!user) {
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

    const isValidPassword = await bcryptjs.compare(password, user.passwordHash)

    if (!isValidPassword) {
      const failedAttempts = user.failedLoginAttempts + 1
      if (failedAttempts >= 5) {
        await db.user.update({
          where: { id: user.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
          },
        })
        return NextResponse.json(
          { error: 'Compte bloqué pour 15 minutes suite à trop de tentatives.' },
          { status: 423 }
        )
      }

      await db.user.update({
        where: { id: user.id },
        data: { failedLoginAttempts: failedAttempts },
      })

      return NextResponse.json(
        { error: 'Identifiants invalides' },
        { status: 401 }
      )
    }

    // Successful login
    await db.user.update({
      where: { id: user.id },
      data: {
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
    })

    const permissions = user.roles.flatMap(ur =>
      ur.role.permissions.map(rp => rp.permission.name)
    )

    const defaultEst = user.establishments.find(e => e.isDefault) || user.establishments[0]

    // Create JWT token
    const { SignJWT } = await import('jose')
    const JWT_SECRET = new TextEncoder().encode(
      process.env.JWT_SECRET || (
        process.env.DEMO_MODE === 'true'
          ? 'healthflow-guinea-demo-jwt-secret-NOT-FOR-PRODUCTION'
          : process.env.NODE_ENV === 'production'
            ? 'healthflow-guinea-jwt-secret-fallback'
            : 'healthflow-guinea-jwt-secret-dev-only-NOT-FOR-PRODUCTION'
      )
    )

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

    return NextResponse.json({
      success: true,
      token,
      data: {
        id: user.id,
        name: `${user.firstName} ${user.lastName}`,
        email: user.email,
        phone: user.phone,
        role: user.roles[0]?.role?.name || 'Patient',
        establishmentId: defaultEst?.establishmentId || '',
        establishmentName: 'Hôpital Donka',
      },
    })
  } catch (error: any) {
    console.error('Login error:', error)
    return NextResponse.json(
      { error: 'Erreur de connexion' },
      { status: 500 }
    )
  }
}
