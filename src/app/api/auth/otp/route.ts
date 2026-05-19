import { NextRequest, NextResponse } from 'next/server'
import { otpSendSchema, otpVerifySchema } from '@/lib/validations/auth'
import { sendOtpToPhone, verifyOtp } from '@/lib/otp-service'
import { normalizeGuineaPhone } from '@/lib/sms-provider'
import { db } from '@/lib/db'
import { successResponse, errorResponse } from '@/lib/api-utils'

/**
 * POST /api/auth/otp - Generate and send OTP
 * Uses: crypto.randomInt(), Redis storage, SMS provider with failover
 * NEVER returns the OTP code in the response
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = otpSendSchema.parse(body)

    const result = await sendOtpToPhone(validated.phone, {
      purpose: 'login',
    })

    if (!result.success) {
      return errorResponse(result.error || "Erreur lors de l'envoi du code OTP", 429)
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Code OTP envoyé par SMS',
        data: {
          phoneLast4: result.phoneLast4,
          expiresIn: result.expiresIn,
        },
      },
      { status: 200 }
    )
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: err.errors },
        { status: 400 }
      )
    }
    const message = err instanceof Error ? err.message : "Erreur lors de l'envoi du code OTP"
    return errorResponse(message, 500)
  }
}

/**
 * PUT /api/auth/otp - Verify OTP and return user data
 * OTP is verified via Redis (hashed, single-use, max 3 attempts)
 * User data is fetched from PostgreSQL
 */
export async function PUT(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = otpVerifySchema.parse(body)
    const phone = normalizeGuineaPhone(validated.phone)

    // Verify OTP via secure OTP service
    const otpResult = await verifyOtp(validated.phone, validated.otpCode, {
      purpose: 'login',
    })

    if (!otpResult.valid) {
      const status = otpResult.attempts >= 3 ? 429 : 401
      return errorResponse(otpResult.error || 'Code OTP invalide', status)
    }

    // Look up user in database
    let user = null
    const phoneSuffix = phone.replace('+224', '')

    try {
      const dbUser = await db.user.findFirst({
        where: {
          OR: [
            { phone: { contains: phoneSuffix } },
            { phone: phone },
            { phone: validated.phone },
          ],
          isActive: true,
        },
        include: {
          establishments: {
            where: { isDefault: true },
            take: 1,
          },
          roles: {
            include: { role: { include: { permissions: { include: { permission: true } } } } },
            take: 5,
          },
        },
      })

      if (dbUser) {
        // Update last login timestamp
        await db.user.update({
          where: { id: dbUser.id },
          data: { lastLoginAt: new Date() },
        })

        // Extract permissions from roles
        const permissions = dbUser.roles.flatMap(ur =>
          ur.role.permissions.map(rp => rp.permission.name)
        )

        user = {
          id: dbUser.id,
          name: `${dbUser.firstName} ${dbUser.lastName}`,
          email: dbUser.email,
          phone: dbUser.phone || phone,
          role: dbUser.roles[0]?.role?.name || 'Patient',
          establishmentId: dbUser.establishments[0]?.establishmentId || '',
          permissions: [...new Set(permissions)],
          mfaEnabled: dbUser.mfaEnabled,
        }
      }
    } catch (dbError) {
      console.warn('[Auth] Database lookup failed:', dbError)
    }

    // If no user found in DB, return error — do NOT create a fake guest user
    // SECURITY: Unregistered phone numbers must not gain authenticated sessions
    if (!user) {
      return errorResponse(
        'Numéro non enregistré. Veuillez contacter l\'administration pour créer un compte.',
        401
      )
    }

    return successResponse(user, 'Connexion réussie')
  } catch (err: any) {
    if (err.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: err.errors },
        { status: 400 }
      )
    }
    const message = err instanceof Error ? err.message : 'Erreur lors de la vérification'
    return errorResponse(message, 500)
  }
}

// OPTIONS handler for CORS
export async function OPTIONS() {
  return new Response(null, { status: 204 })
}
