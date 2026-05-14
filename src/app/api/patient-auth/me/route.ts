import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'

// SECURITY FIX: Unified JWT secret with fail-fast in production
const JWT_SECRET = new TextEncoder().encode(
  process.env.JWT_SECRET || (
    process.env.NODE_ENV === 'production'
      ? (() => { throw new Error('[SECURITY] JWT_SECRET environment variable is required in production') })()
      : 'healthflow-guinea-jwt-secret-dev-only-NOT-FOR-PRODUCTION'
  )
)

async function getPatientFromToken(request: NextRequest) {
  const authHeader = request.headers.get('Authorization')
  if (!authHeader?.startsWith('Bearer ')) return null

  try {
    const token = authHeader.substring(7)
    const { payload } = await jwtVerify(token, JWT_SECRET)
    if (payload.role !== 'PATIENT') return null

    const account = await db.patientAccount.findUnique({
      where: { id: payload.accountId as string },
      include: {
        patient: {
          include: {
            allergies: true,
            antecedents: true,
            appointments: {
              orderBy: { appointmentDate: 'desc' },
              take: 10,
            },
            medicalDocuments: {
              orderBy: { createdAt: 'desc' },
              take: 10,
            },
          }
        }
      }
    })
    return account
  } catch {
    return null
  }
}

export async function GET(request: NextRequest) {
  const account = await getPatientFromToken(request)
  if (!account) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  return NextResponse.json({
    id: account.id,
    phone: account.phone,
    email: account.email,
    preferredLanguage: account.preferredLanguage,
    notificationPrefs: account.notificationPrefs ? JSON.parse(account.notificationPrefs) : null,
    patient: account.patient ? {
      id: account.patient.id,
      firstName: account.patient.firstName,
      lastName: account.patient.lastName,
      qrCode: account.patient.qrCode,
      dateOfBirth: account.patient.dateOfBirth,
      gender: account.patient.gender,
      bloodType: account.patient.bloodType,
      phone: account.patient.phone,
      address: account.patient.address,
      city: account.patient.city,
      region: account.patient.region,
      emergencyContactName: account.patient.emergencyContactName,
      emergencyContactPhone: account.patient.emergencyContactPhone,
      allergies: account.patient.allergies,
      antecedents: account.patient.antecedents,
      appointments: account.patient.appointments,
      medicalDocuments: account.patient.medicalDocuments,
    } : null,
  })
}

export async function PUT(request: NextRequest) {
  const account = await getPatientFromToken(request)
  if (!account) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    
    // Update patient info
    if (account.patientId && (body.firstName || body.lastName || body.address || body.city)) {
      await db.patient.update({
        where: { id: account.patientId },
        data: {
          firstName: body.firstName,
          lastName: body.lastName,
          address: body.address,
          city: body.city,
          region: body.region,
          emergencyContactName: body.emergencyContactName,
          emergencyContactPhone: body.emergencyContactPhone,
          primaryLanguage: body.primaryLanguage,
        }
      })
    }

    // Update account preferences
    if (body.notificationPrefs) {
      await db.patientAccount.update({
        where: { id: account.id },
        data: {
          email: body.email,
          preferredLanguage: body.preferredLanguage,
          notificationPrefs: JSON.stringify(body.notificationPrefs),
        }
      })
    }

    return NextResponse.json({ success: true, message: 'Profil mis à jour' })
  } catch (error) {
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 })
  }
}
