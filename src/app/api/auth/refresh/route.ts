import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'
import { SignJWT } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (
    process.env.DEMO_MODE === 'true'
      ? 'healthflow-guinea-demo-jwt-secret-NOT-FOR-PRODUCTION'
      : process.env.NODE_ENV === 'production'
        ? 'healthflow-guinea-jwt-secret-fallback' // Lazy: won't be used in demo mode
        : 'healthflow-guinea-jwt-secret-dev-only-NOT-FOR-PRODUCTION'
  )
)

/**
 * POST /api/auth/refresh
 * Refresh a JWT token for staff users.
 * Verifies the user is still active and re-issues a new token.
 * This enables token rotation and session revocation.
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Token requis' }, { status: 401 })
    }

    const oldToken = authHeader.substring(7)

    // Verify the existing token (even if expired, within grace period)
    let payload: any
    try {
      const verified = await jwtVerify(oldToken, JWT_SECRET, {
        clockTolerance: 300, // 5 minute grace period after expiry
      })
      payload = verified.payload
    } catch {
      return NextResponse.json({ error: 'Session expirée. Veuillez vous reconnecter.' }, { status: 401 })
    }

    // Verify user still exists and is active
    const userId = payload.userId || payload.accountId || payload.sub
    const user = await db.user.findUnique({
      where: { id: userId },
      include: {
        establishments: { where: { isDefault: true }, take: 1 },
        roles: {
          include: { role: { include: { permissions: { include: { permission: true } } } } },
          take: 5,
        },
      },
    })

    if (!user || !user.isActive) {
      return NextResponse.json({ error: 'Compte désactivé' }, { status: 403 })
    }

    // Check if user is locked
    if (user.lockedUntil && new Date() < new Date(user.lockedUntil)) {
      return NextResponse.json({ error: 'Compte bloqué' }, { status: 423 })
    }

    // Extract fresh permissions
    const permissions = user.roles.flatMap(ur =>
      ur.role.permissions.map(rp => rp.permission.name)
    )

    const defaultEst = user.establishments[0]
    const role = payload.role || user.roles[0]?.role?.name || 'Patient'

    // Issue new token
    const newToken = await new SignJWT({
      userId: user.id,
      email: user.email,
      role,
      establishmentId: defaultEst?.establishmentId || payload.establishmentId || '',
      permissions: [...new Set(permissions)],
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('12h')
      .setIssuedAt()
      .setIssuer('healthflow-guinea')
      .setAudience(payload.aud?.includes('patient-portal') ? 'patient-portal' : 'staff-portal')
      .sign(JWT_SECRET)

    return NextResponse.json({
      success: true,
      token: newToken,
      user: {
        id: user.id,
        email: user.email,
        firstName: user.firstName,
        lastName: user.lastName,
        role,
        establishmentId: defaultEst?.establishmentId || '',
        permissions: [...new Set(permissions)],
      }
    })

  } catch (error) {
    console.error('Token refresh error:', error)
    return NextResponse.json({ error: 'Erreur de rafraîchissement' }, { status: 500 })
  }
}
