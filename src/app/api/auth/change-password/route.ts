import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { passwordResetSchema } from '@/lib/validations/auth'
import { addSimpleAuditEntry } from '@/lib/audit-logger'
import { jwtVerify } from 'jose'

const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (
    process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('[SECURITY] JWT_SECRET is required in production') })()
      : 'healthflow-guinea-jwt-secret-dev-only-NOT-FOR-PRODUCTION'
  )
)

/**
 * POST /api/auth/change-password
 * Change password for authenticated staff user.
 * Requires current password verification.
 */
export async function POST(request: NextRequest) {
  try {
    // Verify JWT token
    const authHeader = request.headers.get('Authorization')
    if (!authHeader?.startsWith('Bearer ')) {
      return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
    }

    const token = authHeader.substring(7)
    let payload: any
    try {
      const verified = await jwtVerify(token, JWT_SECRET)
      payload = verified.payload
    } catch {
      return NextResponse.json({ error: 'Session expirée' }, { status: 401 })
    }

    const body = await request.json()
    const validated = passwordResetSchema.parse(body)

    // Find user
    const user = await db.user.findUnique({
      where: { id: payload.userId || payload.sub }
    })

    if (!user) {
      return NextResponse.json({ error: 'Utilisateur non trouvé' }, { status: 404 })
    }

    // Verify current password
    const bcryptjs = await import('bcryptjs')
    const isValid = await bcryptjs.compare(validated.token, user.passwordHash) // Using token field for current password

    if (!isValid) {
      return NextResponse.json({ error: 'Mot de passe actuel incorrect' }, { status: 401 })
    }

    // Hash new password
    const salt = await bcryptjs.genSalt(12)
    const newHash = await bcryptjs.hash(validated.newPassword, salt)

    // Update password
    await db.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newHash,
        lastPasswordChangeAt: new Date(),
      }
    })

    addSimpleAuditEntry({
      action: 'PASSWORD_CHANGED',
      module: 'auth',
      entity: 'User',
      entityId: user.id,
      description: 'Password changed by user',
      severity: 'INFO',
      userId: user.id,
    })

    return NextResponse.json({
      success: true,
      message: 'Mot de passe modifié avec succès',
    })

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Change password error:', error)
    return NextResponse.json({ error: 'Erreur lors du changement de mot de passe' }, { status: 500 })
  }
}
