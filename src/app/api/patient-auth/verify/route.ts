import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { patientAccountVerifySchema } from '@/lib/validations/patient'
import { verifyOtp } from '@/lib/otp-service'
import { addSimpleAuditEntry } from '@/lib/audit-logger'
import { SignJWT } from 'jose'

// JWT secret — fallback for demo/dev mode
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (
    process.env.DEMO_MODE === 'true'
      ? 'healthflow-guinea-demo-jwt-secret-NOT-FOR-PRODUCTION'
      : process.env.NODE_ENV === 'production'
        ? 'healthflow-guinea-jwt-secret-fallback'
        : 'healthflow-guinea-jwt-secret-dev-only-NOT-FOR-PRODUCTION'
  )
)

/**
 * POST /api/patient-auth/verify
 * Verify OTP and issue a JWT token for patient portal access.
 * OTP is verified via Redis (not database).
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = patientAccountVerifySchema.parse(body)

    const account = await db.patientAccount.findUnique({
      where: { phone: validated.phone },
      include: { patient: true }
    })

    if (!account) {
      // Anti-enumeration: generic error
      return NextResponse.json({ error: 'Code OTP invalide ou expiré' }, { status: 401 })
    }

    // Check lockout
    if (account.lockedUntil && new Date() < new Date(account.lockedUntil)) {
      const remainingMinutes = Math.ceil(
        (new Date(account.lockedUntil).getTime() - Date.now()) / 60000
      )
      return NextResponse.json(
        { error: `Compte temporairement bloqué. Réessayez dans ${remainingMinutes} minute(s).` },
        { status: 423 }
      )
    }

    // Verify OTP via secure OTP service (Redis)
    const otpResult = await verifyOtp(validated.phone, validated.otpCode, {
      purpose: 'login',
      userId: account.id,
    })

    if (!otpResult.valid) {
      // Increment failed login attempts in DB for lockout tracking
      const failedAttempts = account.failedLoginAttempts + 1

      if (failedAttempts >= 5) {
        // Lock account for 15 minutes after 5 failed attempts
        await db.patientAccount.update({
          where: { id: account.id },
          data: {
            failedLoginAttempts: failedAttempts,
            lockedUntil: new Date(Date.now() + 15 * 60 * 1000),
          }
        })
        return NextResponse.json(
          { error: 'Compte bloqué pour 15 minutes suite à trop de tentatives.' },
          { status: 423 }
        )
      }

      await db.patientAccount.update({
        where: { id: account.id },
        data: { failedLoginAttempts: failedAttempts }
      })

      return NextResponse.json(
        { error: otpResult.error || 'Code OTP invalide' },
        { status: 401 }
      )
    }

    // OTP verified — update account
    const updatedAccount = await db.patientAccount.update({
      where: { id: account.id },
      data: {
        isVerified: true,
        lastLoginAt: new Date(),
        failedLoginAttempts: 0,
        lockedUntil: null,
      },
      include: { patient: true }
    })

    // Create JWT token
    const token = await new SignJWT({
      accountId: updatedAccount.id,
      patientId: updatedAccount.patientId,
      phone: updatedAccount.phone,
      role: 'PATIENT',
    })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .setIssuedAt()
      .setIssuer('healthflow-guinea')
      .setAudience('patient-portal')
      .sign(JWT_SECRET)

    addSimpleAuditEntry({
      action: 'PATIENT_LOGIN',
      module: 'patient-auth',
      entity: 'PatientAccount',
      entityId: updatedAccount.id,
      description: `Patient logged in: ${updatedAccount.phone.slice(-4).padStart(updatedAccount.phone.length, '*')}`,
      severity: 'INFO',
    })

    return NextResponse.json({
      success: true,
      token,
      account: {
        id: updatedAccount.id,
        phone: updatedAccount.phone,
        preferredLanguage: updatedAccount.preferredLanguage,
        patient: updatedAccount.patient ? {
          id: updatedAccount.patient.id,
          firstName: updatedAccount.patient.firstName,
          lastName: updatedAccount.patient.lastName,
          qrCode: updatedAccount.patient.qrCode,
          bloodType: updatedAccount.patient.bloodType,
          dateOfBirth: updatedAccount.patient.dateOfBirth,
          gender: updatedAccount.patient.gender,
        } : null,
      }
    })

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json({ error: 'Données invalides', details: error.errors }, { status: 400 })
    }
    console.error('OTP verify error:', error)
    return NextResponse.json({ error: 'Erreur de vérification' }, { status: 500 })
  }
}
