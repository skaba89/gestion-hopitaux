import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { jwtVerify } from 'jose'
import { patientUpdateSchema, notificationPrefsSchema } from '@/lib/validations/patient'
import { corsHeaders } from '@/lib/api-utils'
import { z } from 'zod'

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

// Extended schema for the full PUT body (patient fields + account preferences)
const patientProfileUpdateSchema = patientUpdateSchema.extend({
  preferredLanguage: z.enum(['fr', 'en', 'msk', 'sus', 'ff']).optional(),
  notificationPrefs: notificationPrefsSchema.optional(),
})

export async function PUT(request: NextRequest) {
  const account = await getPatientFromToken(request)
  if (!account) {
    return NextResponse.json({ error: 'Non autorisé' }, { status: 401 })
  }

  try {
    const body = await request.json()
    const validated = patientProfileUpdateSchema.parse(body)

    // Update patient info
    if (account.patientId) {
      const patientData: Record<string, unknown> = {}
      if (validated.firstName !== undefined) patientData.firstName = validated.firstName
      if (validated.lastName !== undefined) patientData.lastName = validated.lastName
      if (validated.address !== undefined) patientData.address = validated.address
      if (validated.city !== undefined) patientData.city = validated.city
      if (validated.region !== undefined) patientData.region = validated.region
      if (validated.emergencyContactName !== undefined) patientData.emergencyContactName = validated.emergencyContactName
      if (validated.emergencyContactPhone !== undefined) patientData.emergencyContactPhone = validated.emergencyContactPhone
      if (validated.primaryLanguage !== undefined) patientData.primaryLanguage = validated.primaryLanguage

      if (Object.keys(patientData).length > 0) {
        await db.patient.update({
          where: { id: account.patientId },
          data: patientData,
        })
      }
    }

    // Update account preferences
    if (validated.notificationPrefs || validated.email !== undefined || validated.preferredLanguage !== undefined) {
      const accountData: Record<string, unknown> = {}
      if (validated.email !== undefined) accountData.email = validated.email
      if (validated.preferredLanguage !== undefined) accountData.preferredLanguage = validated.preferredLanguage
      if (validated.notificationPrefs) {
        accountData.notificationPrefs = JSON.stringify(validated.notificationPrefs)
      }

      if (Object.keys(accountData).length > 0) {
        await db.patientAccount.update({
          where: { id: account.id },
          data: accountData,
        })
      }
    }

    return NextResponse.json({ success: true, message: 'Profil mis à jour' })
  } catch (error: any) {
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Données invalides', details: error.errors },
        { status: 400 }
      )
    }
    console.error('Profile update error:', error)
    return NextResponse.json({ error: 'Erreur de mise à jour' }, { status: 500 })
  }
}

export async function OPTIONS() {
  return new Response(null, { status: 204, headers: corsHeaders() })
}
