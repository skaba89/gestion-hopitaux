import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { patientAccountRegistrationSchema } from '@/lib/validations/patient'
import { sendOtpToPhone } from '@/lib/otp-service'
import { addSimpleAuditEntry } from '@/lib/audit-logger'
import { generateSecureToken } from '@/lib/security'

/**
 * POST /api/patient-auth/register
 * Creates a patient account and sends OTP for phone verification.
 * OTP is stored in Redis (NOT in database) and sent via SMS.
 * The OTP is NEVER returned in the API response.
 */
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const validated = patientAccountRegistrationSchema.parse(body)

    // Check if phone already registered
    const existing = await db.patientAccount.findUnique({
      where: { phone: validated.phone }
    })
    if (existing) {
      return NextResponse.json(
        { error: 'Un compte existe déjà avec ce numéro de téléphone' },
        { status: 409 }
      )
    }

    // Verify establishment exists, or find the first active one
    let establishmentId = validated.establishmentId
    const establishment = await db.establishment.findUnique({
      where: { id: establishmentId }
    })
    if (!establishment) {
      const firstActive = await db.establishment.findFirst({
        where: { isActive: true },
        orderBy: { createdAt: 'asc' }
      })
      if (firstActive) {
        establishmentId = firstActive.id
      } else {
        // Create a default establishment if none exists
        const defaultEst = await db.establishment.create({
          data: {
            name: 'CHU Donka',
            type: 'HOSPITAL',
            code: 'CHU-DONKA',
            city: 'Conakry',
            region: 'Conakry',
          }
        })
        establishmentId = defaultEst.id
      }
    }

    // Create or find patient record
    let patient = await db.patient.findFirst({
      where: { phone: validated.phone }
    })

    if (!patient) {
      const qrCode = `HF-${Date.now()}-${generateSecureToken(3)}`
      patient = await db.patient.create({
        data: {
          firstName: validated.firstName,
          lastName: validated.lastName,
          dateOfBirth: validated.dateOfBirth,
          gender: validated.gender,
          phone: validated.phone,
          primaryLanguage: validated.preferredLanguage,
          establishmentId,
          qrCode,
        }
      })
    }

    // Create patient account (NO OTP stored in DB — will be in Redis)
    const account = await db.patientAccount.create({
      data: {
        phone: validated.phone,
        patientId: patient.id,
        preferredLanguage: validated.preferredLanguage,
        isVerified: false,
        // otpCode and otpExpiresAt are NOT stored here anymore
      }
    })

    // Send OTP via secure OTP service (Redis + SMS)
    const otpResult = await sendOtpToPhone(validated.phone, {
      purpose: 'registration',
      userId: account.id,
    })

    addSimpleAuditEntry({
      action: 'PATIENT_REGISTER',
      module: 'patient-auth',
      entity: 'PatientAccount',
      entityId: account.id,
      description: `Patient account created for ${validated.phone.slice(-4).padStart(validated.phone.length, '*')}`,
      severity: 'INFO',
    })

    if (!otpResult.success) {
      // Account created but SMS failed — user can request OTP again
      return NextResponse.json({
        success: true,
        message: 'Compte créé. Le code OTP n\'a pas pu être envoyé par SMS. Veuillez demander un nouveau code.',
        accountId: account.id,
        phone: validated.phone,
        smsFailed: true,
        expiresIn: 300,
      }, { status: 201 })
    }

    // SUCCESS — Account created, OTP sent via SMS
    // OTP is NEVER included in the response
    return NextResponse.json({
      success: true,
      message: 'Compte créé. Vérifiez votre téléphone pour le code OTP.',
      accountId: account.id,
      phone: validated.phone,
      phoneLast4: otpResult.phoneLast4,
      expiresIn: otpResult.expiresIn,
    }, { status: 201 })

  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Patient registration error:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'inscription' },
      { status: 500 }
    )
  }
}
