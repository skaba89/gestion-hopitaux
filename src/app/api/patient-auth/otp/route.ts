import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { otpSendSchema } from '@/lib/validations/auth'
import { sendOtpToPhone } from '@/lib/otp-service'

/**
 * POST /api/patient-auth/otp
 * Request a new OTP for an existing patient account.
 * Uses the secure OTP service (Redis + SMS with failover).
 * OTP is NEVER returned in the response.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = otpSendSchema.parse(body)

    // Check account exists
    const normalizedPhone = validated.phone.startsWith('+224')
      ? validated.phone
      : `+224${validated.phone.replace(/^\+/, '')}`

    const account = await db.patientAccount.findUnique({
      where: { phone: normalizedPhone }
    })

    if (!account) {
      // Don't reveal whether the account exists (anti-enumeration)
      return NextResponse.json(
        { success: true, message: 'Si ce numéro est enregistré, un code OTP a été envoyé.', phoneLast4: normalizedPhone.slice(-4), expiresIn: 300 },
        { status: 200 }
      )
    }

    if (!account.isActive) {
      return NextResponse.json(
        { error: 'Compte désactivé. Contactez l\'administration.' },
        { status: 403 }
      )
    }

    // Send OTP via secure service (Redis + SMS)
    const result = await sendOtpToPhone(normalizedPhone, {
      purpose: 'login',
      userId: account.id,
    })

    if (!result.success) {
      return NextResponse.json(
        { error: result.error || 'Impossible d\'envoyer le code OTP. Réessayez plus tard.' },
        { status: 429 }
      )
    }

    // NEVER return the OTP code
    return NextResponse.json({
      success: true,
      message: 'Code OTP envoyé par SMS',
      phoneLast4: result.phoneLast4,
      expiresIn: result.expiresIn,
    })

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('OTP request error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'envoi du code' },
      { status: 500 }
    )
  }
}
