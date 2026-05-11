import { NextRequest, NextResponse } from 'next/server'
import { insService, generateHealthId } from '@/lib/national-health-id'
import type { INSVerificationMethod } from '@/lib/national-health-id'

const VALID_VERIFICATION_METHODS: INSVerificationMethod[] = [
  'biometric',
  'document',
  'phone-otp',
  'in-person',
  'asc-vouch',
]

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = request.nextUrl
    const action = searchParams.get('action') || 'records'

    switch (action) {
      case 'records': {
        const records = insService.getRecords()
        return NextResponse.json({ success: true, data: records })
      }

      case 'search': {
        const query = searchParams.get('q')
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Le paramètre "q" est requis pour la recherche' },
            { status: 400 }
          )
        }
        const results = insService.searchRecords(query)
        return NextResponse.json({ success: true, data: results })
      }

      case 'verify': {
        const healthId = searchParams.get('healthId')
        const method = searchParams.get('method') as INSVerificationMethod | null
        const requestedBy = searchParams.get('requestedBy')

        if (!healthId) {
          return NextResponse.json(
            { success: false, error: 'Le paramètre "healthId" est requis pour la vérification' },
            { status: 400 }
          )
        }
        if (!method) {
          return NextResponse.json(
            { success: false, error: 'Le paramètre "method" est requis pour la vérification' },
            { status: 400 }
          )
        }
        if (!VALID_VERIFICATION_METHODS.includes(method)) {
          return NextResponse.json(
            {
              success: false,
              error: `Méthode de vérification invalide. Méthodes acceptées: ${VALID_VERIFICATION_METHODS.join(', ')}`,
            },
            { status: 400 }
          )
        }
        if (!requestedBy) {
          return NextResponse.json(
            { success: false, error: 'Le paramètre "requestedBy" est requis pour la vérification' },
            { status: 400 }
          )
        }

        const verification = insService.verifyIdentity(healthId, method, requestedBy)
        return NextResponse.json({ success: true, data: verification })
      }

      case 'verifications': {
        const verifications = insService.getVerificationRequests()
        return NextResponse.json({ success: true, data: verifications })
      }

      case 'statistics': {
        const statistics = insService.getStatistics()
        return NextResponse.json({ success: true, data: statistics })
      }

      case 'record': {
        const healthId = searchParams.get('healthId')
        if (!healthId) {
          return NextResponse.json(
            { success: false, error: 'Le paramètre "healthId" est requis pour récupérer un dossier' },
            { status: 400 }
          )
        }
        const record = insService.getRecord(healthId)
        if (!record) {
          return NextResponse.json(
            { success: false, error: `Aucun dossier trouvé pour l'identifiant: ${healthId}` },
            { status: 404 }
          )
        }
        return NextResponse.json({ success: true, data: record })
      }

      default: {
        return NextResponse.json(
          {
            success: false,
            error: `Action inconnue: "${action}". Actions valides: records, search, verify, verifications, statistics, record`,
          },
          { status: 400 }
        )
      }
    }
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { firstName, lastName, dateOfBirth, gender, phone, address, birthPlace, healthZone, verificationMethod } = body

    // Validate required fields
    const missingFields: string[] = []
    if (!firstName) missingFields.push('firstName')
    if (!lastName) missingFields.push('lastName')
    if (!dateOfBirth) missingFields.push('dateOfBirth')
    if (!gender) missingFields.push('gender')

    if (missingFields.length > 0) {
      return NextResponse.json(
        {
          success: false,
          error: `Champs obligatoires manquants: ${missingFields.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Validate gender
    if (gender !== 'M' && gender !== 'F') {
      return NextResponse.json(
        { success: false, error: 'Le champ "gender" doit être "M" ou "F"' },
        { status: 400 }
      )
    }

    // Validate verification method if provided
    if (verificationMethod && !VALID_VERIFICATION_METHODS.includes(verificationMethod)) {
      return NextResponse.json(
        {
          success: false,
          error: `Méthode de vérification invalide. Méthodes acceptées: ${VALID_VERIFICATION_METHODS.join(', ')}`,
        },
        { status: 400 }
      )
    }

    // Generate the health ID
    const healthId = generateHealthId(dateOfBirth, firstName, lastName)
    const now = new Date()

    const newINS = {
      id: `INS-${Date.now()}`,
      healthId,
      nationalId: healthId,
      firstName,
      lastName,
      dateOfBirth,
      gender: gender as 'M' | 'F',
      birthPlace: birthPlace || '',
      phone: phone || '',
      address: address || '',
      healthZone: healthZone || '',
      photoUrl: null,
      biometricHash: null,
      status: 'pending' as const,
      issuedAt: now.toISOString().split('T')[0],
      issuedBy: 'Direction Nationale de la Santé',
      expiresAt: new Date(now.getFullYear() + 10, now.getMonth(), now.getDate()).toISOString().split('T')[0],
      lastVerifiedAt: now.toISOString().split('T')[0],
      verificationMethod: (verificationMethod || 'document') as INSVerificationMethod,
      verificationStatus: 'pending' as const,
      verificationAttempts: 0,
      linkedSANTEPCard: null,
      linkedFacilities: [],
      auditTrail: [
        {
          action: 'INS_PENDING',
          performedBy: 'System',
          performedAt: now.toISOString(),
          details: 'INS en attente de vérification — émission initiée',
        },
      ],
    }

    return NextResponse.json(
      { success: true, data: newINS },
      { status: 201 }
    )
  } catch (error) {
    const message = error instanceof Error ? error.message : 'Erreur interne du serveur'
    return NextResponse.json(
      { success: false, error: message },
      { status: 500 }
    )
  }
}
